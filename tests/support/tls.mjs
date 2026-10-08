// A throwaway CA and one certificate for the given *.localhost names, for the
// browser journey's HTTPS front door. The issuer only accepts HTTPS callbacks
// on non-loopback hosts, as it does for real deployments.
import { execFile } from "node:child_process"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)

export async function localCertificates(hosts) {
  const directory = await mkdtemp(join(tmpdir(), "devlinks-local-tls-"))
  await writeFile(join(directory, "ca.conf"), [
    "[req]", "prompt=no", "distinguished_name=dn", "x509_extensions=ext",
    "[dn]", "CN=Devlinks synthetic test CA", "[ext]",
    "basicConstraints=critical,CA:TRUE", "keyUsage=critical,keyCertSign,cRLSign", "",
  ].join("\n"))
  await writeFile(join(directory, "server.conf"), [
    "[req]", "prompt=no", "distinguished_name=dn", "[dn]", `CN=${hosts[0]}`,
    "[ext]", "basicConstraints=critical,CA:FALSE", "keyUsage=critical,digitalSignature,keyEncipherment",
    "extendedKeyUsage=serverAuth", `subjectAltName=${hosts.map(host => `DNS:${host}`).join(",")}`, "",
  ].join("\n"))
  const options = { cwd: directory, timeout: 15_000 }
  await run("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256", "-days", "1", "-config", "ca.conf", "-keyout", "ca.key", "-out", "ca.crt"], options)
  await run("openssl", ["req", "-new", "-newkey", "rsa:2048", "-nodes", "-sha256", "-config", "server.conf", "-keyout", "server.key", "-out", "server.csr"], options)
  await run("openssl", ["x509", "-req", "-in", "server.csr", "-CA", "ca.crt", "-CAkey", "ca.key", "-CAcreateserial", "-out", "server.crt", "-days", "1", "-sha256", "-extfile", "server.conf", "-extensions", "ext"], options)
  const [key, cert] = await Promise.all([readFile(join(directory, "server.key")), readFile(join(directory, "server.crt"))])
  return { key, cert }
}
