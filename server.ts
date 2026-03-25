import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

// Initialize Firebase Admin with error handling
async function initFirebaseAdmin() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("Firebase config file not found. Admin features will be disabled.");
      return null;
    }
    
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (!admin.apps || admin.apps.length === 0) {
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
    return admin.firestore(firebaseConfig.firestoreDatabaseId);
  } catch (error) {
    console.error("Critical error initializing Firebase Admin:", error);
    return null;
  }
}

let db: any = null;
const SETTINGS_COLLECTION = "settings";
const CONFIG_DOC = "config";

const DEFAULT_CONFIG = {
  apiUrl: "https://imran.bro.bd/v1/alldown",
  fbApi: "https://imran.bro.bd/v2/fb",
  instaApi: "https://imran.bro.bd/v3/insta",
  tiktokApi: "https://imran.bro.bd/v4/tiktok",
  capcutApi: "https://imran.bro.bd/v5/capcut",
  teraboxApi: "https://imran.bro.bd/v6/terabox",
  youtubeApi: "https://imran.bro.bd/v7/youtube",
  titleKey: "",
  linksKey: "",
  failoverUrl: "https://api-backup.vortex-downloader.com/v1",
  autoFailover: true,
  customRules: []
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
    
    // Smart Routing Logic
    let targetApi = config.apiUrl;
    const lowerUrl = videoUrl.toLowerCase();
    
    // 1. Check Custom Rules first (Highest Priority)
    if (config.customRules && Array.isArray(config.customRules)) {
      for (const rule of config.customRules) {
        if (rule.pattern && rule.apiUrl && lowerUrl.includes(rule.pattern.toLowerCase())) {
          targetApi = rule.apiUrl;
          break;
        }
      }
    }

    // 2. Fallback to Platform-Specific Defaults if no custom rule matched
    if (targetApi === config.apiUrl) {
      if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.watch")) {
        targetApi = config.fbApi || config.apiUrl;
      } else if (lowerUrl.includes("instagram.com")) {
        targetApi = config.instaApi || config.apiUrl;
      } else if (lowerUrl.includes("tiktok.com")) {
        targetApi = config.tiktokApi || config.apiUrl;
      } else if (lowerUrl.includes("capcut.com")) {
        targetApi = config.capcutApi || config.apiUrl;
      } else if (lowerUrl.includes("terabox.com") || lowerUrl.includes("teraboxapp.com")) {
        targetApi = config.teraboxApi || config.apiUrl;
      } else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        targetApi = config.youtubeApi || config.apiUrl;
      }
    }

    const tryFetch = async (apiUrl: string) => {
      const response = await axios.get(apiUrl, {
        params: { url: videoUrl },
        timeout: 15000
      });
      
      const data = response.data;
      
    // Smart Normalization: Try to find title and links in various common structures
    const findTitle = (obj: any): string => {
      if (!obj) return "Video Download";
      
      // Use user-defined key if available
      if (config.titleKey && obj[config.titleKey]) return obj[config.titleKey];

      return obj.title || obj.video_title || obj.caption || obj.desc || obj.description || 
             (obj.data && findTitle(obj.data)) || 
             (obj.result && findTitle(obj.result)) || 
             "Video Download";
    };

    const findFormats = (obj: any): any[] => {
      if (!obj) return [];
      
      // Check for direct arrays
      const possibleArrays = [
        config.linksKey && obj[config.linksKey], // User defined key
        obj.formats, obj.medias, obj.links, obj.urls, obj.video_urls,
        (obj.data && obj.data.formats), (obj.data && obj.data.medias), (obj.data && obj.data.links),
        (obj.result && obj.result.formats), (obj.result && obj.result.links)
      ];

        for (const arr of possibleArrays) {
          if (Array.isArray(arr)) {
            return arr.map(item => ({
              quality: item.quality || item.resolution || item.type || item.format || "Download",
              url: item.url || item.link || item.href || item.download_url || item
            })).filter(item => typeof item.url === 'string' && item.url.startsWith('http'));
          }
        }

        // Check for single link
        const singleLink = obj.url || obj.link || obj.download || (obj.data && (obj.data.url || obj.data.link));
        if (typeof singleLink === 'string') {
          return [{ quality: "HD Quality", url: singleLink }];
        }

        return [];
      };

      return {
        title: findTitle(data),
        thumbnail: data.thumbnail || data.cover || (data.data && data.data.thumbnail) || "",
        duration: data.duration || (data.data && data.data.duration) || "N/A",
        formats: findFormats(data)
      };
    };

    try {
      console.log(`Using API: ${targetApi} for URL: ${videoUrl}`);
      const data = await tryFetch(targetApi);
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
