import { requestOrigin, json } from "../../../../lib/server/http.ts"
import { serverRuntime } from "../../../../lib/server/runtime.ts"

export const dynamic = "force-dynamic"
const callbackPath = "/api/auth/federation/callback"
const noStore = { "cache-control": "private, no-store" }

/**
 * The browser lands on the callback by navigation, so a failed or expired
 * sign-in must show a page, not the handler's JSON. Send it back to the
 * account page with a reason, keeping any cookies the handler cleared.
 */
function callbackFailure(response: Response | null, origin: string) {
  const reason =
    !response || response.status === 503
      ? "unavailable"
      : response.status === 409
        ? "linking"
        : "expired"
  const headers = new Headers({
    location: new URL(`/account?error=${reason}`, origin).href,
    ...noStore,
  })
  for (const cookie of response?.headers.getSetCookie() ?? [])
    headers.append("set-cookie", cookie)
  return new Response(null, { status: 303, headers })
}

/**
 * The account handler refuses any origin but this deployment's registered
 * one. Behind a TLS-terminating proxy the server sees plain HTTP, so when the
 * forwarded host and protocol name exactly the registered address, present
 * the request as the browser sent it. Anything else is left unchanged.
 */
function asSeenByBrowser(request: Request, registered: string) {
  try {
    const seen = new URL(request.url)
    if (seen.origin === registered || requestOrigin(request) !== registered)
      return request
    return new Request(new URL(seen.pathname + seen.search, registered), request)
  } catch {
    return request
  }
}

async function handle(incoming: Request) {
  const runtime = serverRuntime()
  if (!runtime)
    return json({ error: "Accounts are coming soon." }, 404)
  const request = asSeenByBrowser(incoming, runtime.origin)
  const url = new URL(request.url)
  const callback = request.method === "GET" && url.pathname === callbackPath
  try {
    const response = await runtime.accounts.handler(request)
    return callback && response.status >= 400
      ? callbackFailure(response, runtime.origin)
      : response
  } catch {
    if (callback) return callbackFailure(null, runtime.origin)
    return json(
      { error: "Account access is temporarily unavailable. Please try again." },
      503
    )
  }
}

export const GET = handle
export const POST = handle
