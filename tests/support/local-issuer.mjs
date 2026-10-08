// A local Breakthrough account issuer for tests. It runs the same reviewed
// @royer/auth issuer as accounts-preview, over plain HTTP on loopback (which
// the package allows for development), with an in-memory PostgreSQL and
// verification mail kept in memory. Synthetic accounts only; nothing here is
// deployed.
import { randomBytes } from "node:crypto"
import { createServer } from "node:http"
import { createServer as createNetServer } from "node:net"
import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import { createPrivateAuth } from "@royer/auth/server"
import { createIdentityIssuer } from "@royer/auth/issuer"
import { getMigrations } from "better-auth/db/migration"
import pg from "pg"

/** A free loopback TCP port. */
export async function freePort() {
  const server = createNetServer()
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address()
  await new Promise(resolve => server.close(resolve))
  return port
}

async function readBody(incoming) {
  const chunks = []
  for await (const chunk of incoming) chunks.push(chunk)
  return Buffer.concat(chunks)
}

/** A minimal cookie jar: name=value pairs, no attributes. */
export function cookieJar() {
  const cookies = new Map()
  return {
    store(response) {
      for (const raw of response.headers.getSetCookie()) {
        const pair = raw.split(";")[0]
        const at = pair.indexOf("=")
        const expired = /max-age=0|expires=thu, 01 jan 1970/i.test(raw)
        if (pair.slice(at + 1) && !expired) cookies.set(pair.slice(0, at), pair.slice(at + 1))
        else cookies.delete(pair.slice(0, at))
      }
    },
    header() {
      return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ")
    },
  }
}

/** Starts the issuer at http://localhost:<port> and registers `clients`. */
export async function startLocalIssuer({ port = 0, clients }) {
  const origin = `http://localhost:${port || (await freePort())}`
  const database = await PGlite.create()
  const socket = new PGLiteSocketServer({ db: database, host: "127.0.0.1", port: 0 })
  await socket.start()
  const pool = new pg.Pool({
    connectionString: `postgresql://postgres@${socket.getServerConn()}/postgres?sslmode=disable`,
    max: 1,
  })
  const mail = []
  const config = {
    appId: "local-issuer",
    appName: "Breakthrough account (local test)",
    baseURL: origin,
    secret: randomBytes(32).toString("base64url"),
    database: pool,
    email: {
      sendVerification: async message => {
        mail.push({ kind: "verify", email: message.user.email, url: message.url })
      },
      sendPasswordReset: async message => {
        mail.push({ kind: "reset", email: message.user.email, url: message.url })
      },
    },
  }
  let auth = createPrivateAuth(config)
  await (await getMigrations(auth.engine.options)).runMigrations()
  const server = createServer(async (incoming, outgoing) => {
    try {
      const headers = new Headers()
      for (let index = 0; index < incoming.rawHeaders.length; index += 2)
        headers.append(incoming.rawHeaders[index], incoming.rawHeaders[index + 1])
      const method = incoming.method ?? "GET"
      const body = ["GET", "HEAD"].includes(method) ? undefined : await readBody(incoming)
      const response = await auth.handler(
        new Request(new URL(incoming.url ?? "/", origin), { method, headers, body })
      )
      outgoing.statusCode = response.status
      for (const [key, value] of response.headers)
        if (key !== "set-cookie") outgoing.setHeader(key, value)
      const cookies = response.headers.getSetCookie()
      if (cookies.length) outgoing.setHeader("set-cookie", cookies)
      outgoing.end(Buffer.from(await response.arrayBuffer()))
    } catch {
      if (!outgoing.headersSent) outgoing.writeHead(500, { "content-type": "application/json" })
      outgoing.end(JSON.stringify({ error: "local_issuer_failed" }))
    }
  })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(Number(new URL(origin).port), "127.0.0.1", resolve)
  })

  async function call(jar, path, body) {
    const headers = new Headers({ cookie: jar.header() })
    if (body !== undefined) {
      headers.set("content-type", "application/json")
      headers.set("origin", origin)
    }
    const response = await auth.handler(
      new Request(new URL(path, origin), {
        method: body === undefined ? "GET" : "POST",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    )
    jar.store(response)
    return response
  }

  /** Signs up and verifies a synthetic account. */
  async function createAccount({ name, email, password }) {
    const jar = cookieJar()
    const created = await call(jar, "/api/auth/sign-up/email", { name, email, password })
    if (!created.ok) throw new Error(`Local sign-up failed with ${created.status}`)
    const verification = mail.findLast(m => m.kind === "verify" && m.email === email)
    if (!verification) throw new Error("No verification mail was captured")
    const link = new URL(verification.url)
    const verified = await call(jar, link.pathname + link.search)
    if (![200, 302].includes(verified.status))
      throw new Error(`Verification failed with ${verified.status}`)
    return (await created.json()).user.id
  }

  // Bootstrap one operator, promote the issuer, then register each client the
  // way an operator does on accounts-preview's /operator page.
  const operator = {
    name: "Local operator",
    email: "operator@example.test",
    password: randomBytes(18).toString("base64url"),
  }
  const operatorId = await createAccount(operator)
  auth = createIdentityIssuer({ ...config, operatorUserIds: [operatorId] })
  await (await getMigrations(auth.engine.options)).runMigrations()
  const operatorJar = cookieJar()
  const signedIn = await call(operatorJar, "/api/auth/sign-in/email", {
    email: operator.email,
    password: operator.password,
  })
  if (!signedIn.ok) throw new Error(`Operator sign-in failed with ${signedIn.status}`)
  const operatorHeaders = new Headers({ cookie: operatorJar.header() })
  const credentials = []
  for (const client of clients)
    credentials.push(await auth.registerClient({ operatorHeaders, ...client }))

  return {
    origin,
    issuerURL: `${origin}/api/auth`,
    credentials,
    createAccount,
    async close() {
      await new Promise(resolve => {
        server.close(resolve)
        server.closeAllConnections()
      })
      await pool.end()
      await socket.stop()
      await database.close()
    },
  }
}
