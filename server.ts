import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import fs from "fs";

// Configuration - Edit this object to change API endpoints and rules
let APP_CONFIG = {
  apiUrl: "https://imran.bro.bd/api/alldl",
  fbApi: "https://imran.bro.bd/api/alldl",
  instaApi: "https://imran.bro.bd/api/alldl",
  tiktokApi: "https://imran.bro.bd/api/alldl",
  capcutApi: "https://imran.bro.bd/api/alldl",
  teraboxApi: "https://imran.bro.bd/api/alldl",
  youtubeApi: "https://imran.bro.bd/api/alldl",
  titleKey: "",
  linksKey: "",
  failoverUrl: "https://nayan-video-downloader.vercel.app/alldown",
  autoFailover: true,
  customRules: []
};

// Load persistent config if exists
try {
  if (fs.existsSync("./config.json")) {
    const savedConfig = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
    APP_CONFIG = { ...APP_CONFIG, ...savedConfig };
    console.log("Loaded persistent configuration from config.json");
  }
} catch (err) {
  console.error("Failed to load config.json:", err);
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

  // Config Endpoint
  app.get("/api/admin/config", (req, res) => {
    res.json(APP_CONFIG);
  });

  app.post("/api/admin/config", (req, res) => {
    const newConfig = req.body;
    Object.assign(APP_CONFIG, newConfig);
    
    // Optional: Save to a file for persistence
    try {
      fs.writeFileSync("./config.json", JSON.stringify(APP_CONFIG, null, 2));
    } catch (err) {
      console.error("Failed to save config to file:", err);
    }
    
    res.json({ status: "ok", config: APP_CONFIG });
  });

    // API Route for video analysis
  app.get("/api/analyze", async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const config = APP_CONFIG;
    const videoUrl = url as string;
    
    // Smart Routing Logic
    let targetApi = config.apiUrl;
    let isPlatformSpecific = false;
    const lowerUrl = videoUrl.toLowerCase();
    
    // 1. Check Custom Rules first (Highest Priority)
    if (config.customRules && Array.isArray(config.customRules)) {
      for (const rule of config.customRules) {
        if (rule.pattern && rule.apiUrl && lowerUrl.includes(rule.pattern.toLowerCase())) {
          targetApi = rule.apiUrl;
          isPlatformSpecific = true;
          break;
        }
      }
    }

    // 2. Fallback to Platform-Specific Defaults if no custom rule matched
    if (!isPlatformSpecific) {
      if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.watch")) {
        targetApi = config.fbApi || config.apiUrl;
        if (config.fbApi && config.fbApi !== config.apiUrl) isPlatformSpecific = true;
      } else if (lowerUrl.includes("instagram.com")) {
        targetApi = config.instaApi || config.apiUrl;
        if (config.instaApi && config.instaApi !== config.apiUrl) isPlatformSpecific = true;
      } else if (lowerUrl.includes("tiktok.com")) {
        targetApi = config.tiktokApi || config.apiUrl;
        if (config.tiktokApi && config.tiktokApi !== config.apiUrl) isPlatformSpecific = true;
      } else if (lowerUrl.includes("capcut.com")) {
        targetApi = config.capcutApi || config.apiUrl;
        if (config.capcutApi && config.capcutApi !== config.apiUrl) isPlatformSpecific = true;
      } else if (lowerUrl.includes("terabox.com") || lowerUrl.includes("teraboxapp.com")) {
        targetApi = config.teraboxApi || config.apiUrl;
        if (config.teraboxApi && config.teraboxApi !== config.apiUrl) isPlatformSpecific = true;
      } else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        targetApi = config.youtubeApi || config.apiUrl;
        if (config.youtubeApi && config.youtubeApi !== config.apiUrl) isPlatformSpecific = true;
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
        
        const formats: any[] = [];
        const dataObj = obj.data || obj.result || obj;

        // Check for specific 'low' and 'high' fields (Nayan API style)
        if (dataObj.high) formats.push({ quality: "High Quality (HD)", url: dataObj.high });
        if (dataObj.low) formats.push({ quality: "Low Quality (SD)", url: dataObj.low });

        // Check for direct arrays (Existing logic)
        const possibleArrays = [
          config.linksKey && obj[config.linksKey],
          obj.formats, obj.medias, obj.links, obj.urls, obj.video_urls,
          (obj.data && obj.data.formats), (obj.data && obj.data.medias), (obj.data && obj.data.links),
          (obj.result && obj.result.formats), (obj.result && obj.result.links)
        ];

        for (const arr of possibleArrays) {
          if (Array.isArray(arr)) {
            arr.forEach(item => {
              formats.push({
                quality: item.quality || item.resolution || item.type || item.format || "Download",
                url: item.url || item.link || item.href || item.download_url || item
              });
            });
          }
        }

        // Check for single link if nothing found yet
        if (formats.length === 0) {
          const singleLink = obj.url || obj.link || obj.download || (obj.data && (obj.data.url || obj.data.link));
          if (typeof singleLink === 'string') {
            formats.push({ quality: "HD Quality", url: singleLink });
          }
        }

        return formats.filter(item => typeof item.url === 'string' && item.url.startsWith('http'));
      };

      return {
        title: findTitle(data),
        thumbnail: data.thumbnail || data.cover || (data.data && data.data.thumbnail) || "",
        duration: data.duration || (data.data && data.data.duration) || "N/A",
        formats: findFormats(data)
      };
    };

    try {
      console.log(`Using Primary API: ${targetApi} for URL: ${videoUrl}`);
      const data = await tryFetch(targetApi);
      res.json(data);
    } catch (error) {
      console.error("Primary API failed:", error.message);
      
      // Fallback 1: If platform-specific failed, try general alldown API
      if (isPlatformSpecific && targetApi !== config.apiUrl) {
        try {
          console.log(`Platform API failed. Attempting General API: ${config.apiUrl}`);
          const data = await tryFetch(config.apiUrl);
          return res.json(data);
        } catch (genError) {
          console.error("General API also failed:", genError.message);
        }
      }

      // Fallback 2: Try Failover URL if enabled
      if (config.autoFailover && config.failoverUrl) {
        try {
          console.log(`Attempting Failover API: ${config.failoverUrl}`);
          const data = await tryFetch(config.failoverUrl);
          res.json(data);
        } catch (failoverError) {
          console.error("Failover API failed:", failoverError.message);
          res.status(500).json({ error: "All API endpoints failed. Please try again later." });
        }
      } else {
        res.status(500).json({ error: "API request failed. Please check the URL or try again later." });
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
