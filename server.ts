import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import fs from "fs";
import * as admin from "firebase-admin";

// Initialize Firebase Admin with error handling
async function initFirebaseAdmin() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("Firebase config file not found. Admin features will be disabled.");
      return null;
    }
    
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (!admin.apps.length) {
      // In this environment, we try to use applicationDefault but fallback to just projectId
      // if credentials aren't available.
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId,
        });
        console.log("Firebase Admin initialized with Application Default Credentials");
      } catch (credError) {
        console.warn("Failed to initialize with Application Default Credentials, trying without...", credError);
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
        console.log("Firebase Admin initialized with Project ID only");
      }
    }
    return admin.firestore();
  } catch (error) {
    console.error("Critical error initializing Firebase Admin:", error);
    return null;
  }
}

let db: admin.firestore.Firestore | null = null;
const SETTINGS_COLLECTION = "settings";
const CONFIG_DOC = "config";

const DEFAULT_CONFIG = {
  apiUrl: "https://nayan-video-downloader.vercel.app/alldown",
  apiKey: "",
  failoverUrl: "https://api-backup.vortex-downloader.com/v1",
  autoFailover: true
};

async function getConfig() {
  if (!db) {
    db = await initFirebaseAdmin();
  }
  
  if (!db) return DEFAULT_CONFIG;

  try {
    const doc = await db.collection(SETTINGS_COLLECTION).doc(CONFIG_DOC).get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (error) {
    console.error("Error reading config from Firestore:", error);
  }
  return DEFAULT_CONFIG;
}

async function saveConfig(config: any) {
  if (!db) {
    db = await initFirebaseAdmin();
  }

  if (!db) return false;

  try {
    await db.collection(SETTINGS_COLLECTION).doc(CONFIG_DOC).set({
      ...config,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error saving config to Firestore:", error);
    return false;
  }
}

async function createServer() {
  console.log("Starting server initialization...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin Config Endpoints
  app.get("/api/admin/config", async (req, res) => {
    res.json(await getConfig());
  });

  app.post("/api/admin/config", async (req, res) => {
    const newConfig = req.body;
    if (await saveConfig(newConfig)) {
      res.json({ success: true, config: newConfig });
    } else {
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // API Route for video analysis
  app.get("/api/analyze", async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const config: any = await getConfig();
    const videoUrl = url as string;
    
    const tryFetch = async (apiUrl: string) => {
      const response = await axios.get(apiUrl, {
        params: { url: videoUrl, key: config.apiKey },
        timeout: 10000
      });
      return response.data;
    };

    try {
      const data = await tryFetch(config.apiUrl);
      res.json(data);
    } catch (error) {
      console.error("Primary API failed:", error);
      if (config.autoFailover) {
        try {
          console.log("Attempting failover...");
          const data = await tryFetch(config.failoverUrl);
          res.json(data);
        } catch (failoverError) {
          console.error("Failover API failed:", failoverError);
          res.status(500).json({ error: "All API endpoints failed" });
        }
      } else {
        res.status(500).json({ error: "Primary API failed and failover is disabled" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

createServer();
