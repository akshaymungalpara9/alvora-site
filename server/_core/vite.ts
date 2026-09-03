import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getPublicOrigin } from "../publicSeoRoutes";
import { injectPrerenderedBody, injectSeoIntoHtml } from "../seoInjection";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);
      page = injectSeoIntoHtml(page, req.originalUrl.split("?")[0], getPublicOrigin(req));
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { index: false }));

  // Cache the base HTML at startup; inject SEO tags per-request before sending.
  const indexPath = path.resolve(distPath, "index.html");
  const baseHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "";

  // Load prerendered body snapshots produced by scripts/prerender.mjs.
  // Each entry maps an exact pathname to the #root innerHTML snapshot.
  const prerendered = new Map<string, string>();
  const manifestPath = path.resolve(import.meta.dirname, "prerendered", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest: Record<string, string> = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const snapshotDir = path.dirname(manifestPath);
    for (const [route, filename] of Object.entries(manifest)) {
      const filePath = path.join(snapshotDir, filename);
      if (fs.existsSync(filePath)) {
        prerendered.set(route, fs.readFileSync(filePath, "utf-8"));
      }
    }
    if (prerendered.size > 0) {
      console.log(`Loaded ${prerendered.size} prerendered snapshot(s): ${Array.from(prerendered.keys()).join(", ")}`);
    }
  }

  app.use("*", (req, res) => {
    if (!baseHtml) {
      res.status(500).send("Internal Server Error: build not found");
      return;
    }
    const pathname = req.originalUrl.split("?")[0];
    const origin = getPublicOrigin(req);
    let html = injectSeoIntoHtml(baseHtml, pathname, origin);
    const snapshot = prerendered.get(pathname);
    if (snapshot) html = injectPrerenderedBody(html, snapshot);
    res.status(200).set("Content-Type", "text/html").send(html);
  });
}
