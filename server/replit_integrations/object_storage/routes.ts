import type { Express, Request, Response, NextFunction } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", requireAuth, async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }

      if (contentType && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }

      if (size && size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "File too large (max 10MB)" });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  /**
   * Serve uploaded objects.
   *
   * GET /objects/:objectPath(*)
   *
   * This serves files from object storage. For public files, no auth needed.
   * For protected files, add authentication middleware and ACL checks.
   */
  app.use(async (req, res, next) => {
    if (!req.path.startsWith("/objects/")) return next();
    if (req.method !== "GET") return next();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      console.error("Error serving object:", error);
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}

