import http, { IncomingMessage, ServerResponse } from "http"
import { program } from "@app/domain"
import { Effect } from "effect"

const PORT = 4000


const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const { method, url, headers } = req

    const chunks: Buffer[] = []

    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8")

      console.log("----- REQUEST -----")
      console.log("Time:", new Date().toISOString())
      console.log("Method:", method)
      console.log("URL:", url)
      console.log("Headers:", headers)
      console.log("Body:", JSON.stringify(body) || "<empty>")
      console.log("-------------------")

      res.statusCode = 200
      res.setHeader("Content-Type", "text/plain")
      res.end("OK\n")
    })

    req.on("error", (err) => {
      console.error("Request error:", err)
      res.statusCode = 500
      res.end("error\n")
    })
  }
)

Effect.runPromise(program)

server.listen(PORT, () => {
  console.log(`Dump server listening on http://localhost:${PORT}`)
})

