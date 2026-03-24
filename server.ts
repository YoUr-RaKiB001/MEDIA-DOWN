import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import fs from "fs";

const CONFIG_PATH = path.join(process.cwd(), "config.json");

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    }
  } catch (error) {
    console.error("Error reading config:", error);
  }
  return {
    apiUrl: "https://nayan-video-downloader.vercel.app/alldown",
    apiKey: "API-R07-XXXXXXXXXXXX",
    failoverUrl: "https://api-backup.vortex-downloader.com/v1",
    autoFailover: true
  };
}

function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving config:", error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin Config Endpoints
  app.get("/api/admin/config", (req, res) => {
    res.json(getConfig());
  });

  app.post("/api/admin/config", (req, res) => {
    const newConfig = req.body;
    if (saveConfig(newConfig)) {
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

    const config = getConfig();
    const videoUrl = url as string;
    
    // Determine which endpoint to use based on the URL
    let finalApiUrl = config.apiUrl;
    const baseUrl = config.apiUrl.split("/alldown")[0];
    
    if (videoUrl.includes("instagram.com") || videoUrl.includes("instagr.am")) {
      finalApiUrl = `${baseUrl}/instagram`;
    } else if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      finalApiUrl = `${baseUrl}/youtube`;
    } else if (videoUrl.includes("tiktok.com")) {
      finalApiUrl = `${baseUrl}/tiktok`;
    } else if (videoUrl.includes("facebook.com") || videoUrl.includes("fb.watch")) {
      finalApiUrl = `${baseUrl}/facebook`;
    } else if (videoUrl.includes("twitter.com") || videoUrl.includes("x.com")) {
      finalApiUrl = `${baseUrl}/twitter`;
    } else if (videoUrl.includes("pinterest.com") || videoUrl.includes("pin.it")) {
      finalApiUrl = `${baseUrl}/pinterest`;
    } else if (videoUrl.includes("snapchat.com")) {
      finalApiUrl = `${baseUrl}/snapchat`;
    }

    const tryFetch = async (apiUrl: string) => {
      // Add API key if present in config
      const separator = apiUrl.includes("?") ? "&" : "?";
      const requestUrl = `${apiUrl}${separator}url=${encodeURIComponent(videoUrl)}${config.apiKey ? `&key=${config.apiKey}` : ""}`;
      
      console.log(`Fetching from API: ${requestUrl.replace(config.apiKey, "HIDDEN")}`);
      
      const response = await axios.get(requestUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        timeout: 20000 // 20 seconds timeout
      });
      return response.data;
    };

    try {
      let apiData: any;
      try {
        apiData = await tryFetch(finalApiUrl);
      } catch (e: any) {
        console.error(`Error fetching from ${finalApiUrl}:`, e.message);
        // If specific endpoint fails, try alldown fallback
        if (finalApiUrl !== config.apiUrl) {
          console.log("Trying alldown fallback due to error...");
          apiData = await tryFetch(config.apiUrl);
        } else {
          throw e;
        }
      }

      console.log("API Response Status:", apiData?.status);

      // If specific endpoint returned non-200, try alldown fallback
      if (apiData && apiData.status !== 200 && apiData.status !== "200" && finalApiUrl !== config.apiUrl) {
        console.log("Trying alldown fallback due to non-200 status...");
        try {
          const fallbackData = await tryFetch(config.apiUrl);
          if (fallbackData && (fallbackData.status === 200 || fallbackData.status === "200")) {
            apiData = fallbackData;
          }
        } catch (e) {
          console.error("Fallback failed");
        }
      }

      const isSuccess = apiData && (
        apiData.status === 200 || 
        apiData.status === "200" || 
        apiData.success === true || 
        (apiData.data && (apiData.data.status === true || apiData.data.status === "true" || apiData.data.success === true)) ||
        (typeof apiData === 'string' && apiData.startsWith('http'))
      );

      if (isSuccess) {
        // Handle case where API returns a direct URL string
        if (typeof apiData === 'string' && apiData.startsWith('http')) {
          return res.json({
            title: "Downloaded Video",
            thumbnail: "https://picsum.photos/seed/video/800/450",
            duration: "N/A",
            formats: [{
              quality: "High Quality",
              url: apiData,
              size: "Auto"
            }]
          });
        }

        // Robust data extraction
        let videoData = apiData.data;
        
        // If data contains another data field (like in the YouTube example)
        if (videoData && videoData.data && typeof videoData.data === 'object' && !Array.isArray(videoData.data)) {
          // Check if the middle layer has a status: false
          if (videoData.status === false || videoData.status === "false") {
            const msg = videoData.message || "Video not found or link is private.";
            if (msg.toLowerCase().includes("key") || msg.toLowerCase().includes("api")) {
              return res.status(401).json({ error: "Invalid API Key. Please update your API key in the admin panel." });
            }
            return res.status(404).json({ error: msg });
          }
          videoData = videoData.data;
        }
        
        // If videoData is still null or not the right object, use apiData.data or apiData
        if (!videoData || (!videoData.formats && !videoData.video && !videoData.high && !videoData.url)) {
          videoData = apiData.data || apiData;
        }

        const formats = [];
        
        // Handle YouTube specific structure (formats array)
        if (videoData && Array.isArray(videoData.formats)) {
          videoData.formats.forEach((format: any) => {
            if (format.type === "video_with_audio" || format.type === "video_only" || format.url) {
              formats.push({
                quality: format.label || `${format.quality || "Video"} (${format.ext || "mp4"})`,
                url: format.url,
                size: format.size || "Auto"
              });
            } else if (format.type === "audio") {
              formats.push({
                quality: `Audio - ${format.label || format.ext || "m4a"}`,
                url: format.url,
                size: format.size || "Auto"
              });
            }
          });
        } 
        // Handle Instagram specific structure (arrays)
        else if (videoData && Array.isArray(videoData.video)) {
          videoData.video.forEach((vUrl: string, index: number) => {
            formats.push({
              quality: videoData.video.length > 1 ? `Video ${index + 1}` : "High Quality",
              url: vUrl,
              size: "Auto"
            });
          });
        } 
        // Handle other structures
        else if (videoData) {
          const highUrl = videoData.high || videoData.url_high || videoData.url || videoData.link;
          if (highUrl) {
            formats.push({
              quality: "High Quality",
              url: highUrl,
              size: "Auto"
            });
          }
          
          const lowUrl = videoData.low || videoData.url_low;
          if (lowUrl && lowUrl !== highUrl) {
            formats.push({
              quality: "Low Quality",
              url: lowUrl,
              size: "Auto"
            });
          }
        }

        // If still no formats, try to find any URL in the entire object
        if (formats.length === 0) {
          const findUrl = (obj: any): string | null => {
            if (!obj || typeof obj !== 'object') return null;
            if (typeof obj.url === 'string' && obj.url.startsWith('http')) return obj.url;
            if (typeof obj.link === 'string' && obj.link.startsWith('http')) return obj.link;
            if (typeof obj.download === 'string' && obj.download.startsWith('http')) return obj.download;
            
            for (const key in obj) {
              const result = findUrl(obj[key]);
              if (result) return result;
            }
            return null;
          };
          
          const fallbackUrl = findUrl(apiData);
          if (fallbackUrl) {
            formats.push({
              quality: "Download Link",
              url: fallbackUrl,
              size: "Auto"
            });
          }
        }

        if (formats.length === 0) {
          console.error("No download formats found in API response", JSON.stringify(apiData).substring(0, 500));
          if (config.apiKey === "API-R07-XXXXXXXXXXXX") {
            return res.status(401).json({ error: "Invalid API Key. Please update your API key in the admin panel." });
          }
          return res.status(404).json({ error: "No downloadable formats found for this video." });
        }

        // Determine thumbnail
        let thumbnail = "https://picsum.photos/seed/video/800/450";
        if (videoData && videoData.thumbnail) {
          thumbnail = videoData.thumbnail;
        } else if (videoData && Array.isArray(videoData.thumb) && videoData.thumb.length > 0) {
          thumbnail = videoData.thumb[0];
        } else if (videoData && videoData.thumb) {
          thumbnail = videoData.thumb;
        }

        const result = {
          title: (videoData && videoData.title) || "Untitled Video",
          thumbnail: thumbnail,
          duration: (videoData && videoData.duration) || "N/A",
          formats: formats
        };
        
        return res.json(result);
      } else {
        console.error("API returned failure status:", apiData);
        return res.status(404).json({ error: apiData?.message || "Video not found or platform not supported." });
      }
    } catch (error: any) {
      console.error("API Error:", error.message);
      if (error.response) {
        console.error("API Error Response Status:", error.response.status);
        console.error("API Error Response Data:", error.response.data);
        
        const errorData = error.response.data;
        if (error.response.status === 401 || error.response.status === 403 || 
            (errorData && (errorData.message?.toLowerCase().includes("key") || errorData.message?.toLowerCase().includes("api")))) {
          return res.status(401).json({ error: "Invalid API Key. Please update your API key in the admin panel." });
        }
      }
      return res.status(500).json({ error: "Failed to fetch video data from the server." });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
