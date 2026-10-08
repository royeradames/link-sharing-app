const noStore = { "cache-control": "private, no-store" }

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore })
}

/** Account writes must come from this app's own pages. */
export function fromOrigin(request: Request, origin: string) {
  return request.headers.get("origin") === origin
}

/** The body as JSON, or undefined when it is missing, malformed or too large. */
export async function readJson(request: Request, limit: number) {
  try {
    const text = await request.text()
    return text.length > limit ? undefined : (JSON.parse(text) as unknown)
  } catch {
    return undefined
  }
}

/** The origin the browser used, from the proxy's forwarded headers when present. */
export function requestOrigin(request: Request) {
  const url = new URL(request.url)
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.host
  const protocol =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")
  return `${protocol}://${host}`
}
