import express from "express";
import path from "path";
import http from "http";
import https from "https";
import { parse as parseUrl } from "url";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stream proxy to convert insecure HTTP video streams to HTTPS
  app.get("/api/stream", (req, res) => {
    const streamUrl = req.query.url as string;
    if (!streamUrl) {
      return res.status(400).send("Missing 'url' query parameter");
    }

    console.log(`[Stream Proxy] Requesting: ${streamUrl}`);
    proxyStream(streamUrl, res);
  });

  // Matches scraper proxy to load koray-live.net without browser CORS errors
  app.get("/api/matches-source", (req, res) => {
    console.log(`[Matches Proxy] Fetching matches list from koray-live.net`);
    https.get("https://koray-live.net/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    }, (sourceRes) => {
      let body = "";
      sourceRes.on("data", (chunk) => { body += chunk; });
      sourceRes.on("end", () => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(body);
      });
    }).on("error", (err) => {
      console.error("[Matches Proxy] Failed to fetch koray-live.net:", err);
      res.status(500).send("Error fetching matches schedule");
    });
  });

  // API health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite development integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express v4 / Express v5 routing compatibility:
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
  });
}

// Helper to handle and pipe chunked video streaming with redirect support
function proxyStream(targetUrl: string, clientResponse: express.Response, maxRedirects = 5) {
  if (maxRedirects <= 0) {
    console.error("[Stream Proxy] Too many redirects");
    clientResponse.status(500).send("Too many redirects");
    return;
  }

  try {
    const parsed = parseUrl(targetUrl);
    if (!parsed.hostname) {
      clientResponse.status(400).send("Invalid stream URL");
      return;
    }

    const client = targetUrl.startsWith("https") ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (targetUrl.startsWith("https") ? 443 : 80),
      path: parsed.path,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Connection": "keep-alive"
      }
    };

    const req = client.get(options, (res) => {
      // Check for redirects
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirUrl = res.headers.location;
        if (!redirUrl.startsWith("http")) {
          const protocol = targetUrl.startsWith("https") ? "https:" : "http:";
          redirUrl = `${protocol}//${parsed.host}${redirUrl}`;
        }
        console.log(`[Stream Proxy] Redirected (${res.statusCode}) -> ${redirUrl}`);
        proxyStream(redirUrl, clientResponse, maxRedirects - 1);
        return;
      }

      // Forward content type and stream body chunk-by-chunk
      clientResponse.writeHead(res.statusCode || 200, {
        "Content-Type": res.headers["content-type"] || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      });

      res.pipe(clientResponse);
    });

    req.on("error", (err) => {
      console.error("[Stream Proxy] Connection error for URL:", targetUrl, err.message);
      if (!clientResponse.headersSent) {
        clientResponse.status(500).send("Failed to stream target server");
      }
    });

    clientResponse.on("close", () => {
      req.destroy();
    });
  } catch (err: any) {
    console.error("[Stream Proxy] Exception while proxying stream:", err.message);
    if (!clientResponse.headersSent) {
      clientResponse.status(500).send("Stream proxy failed");
    }
  }
}

startServer();
