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
    apiKey: "",
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
    
    const tryFetch = async (apiUrl: string) => {
      const requestUrl = `${apiUrl}?url=${encodeURIComponent(videoUrl)}`;
      console.log(`Fetching from API: ${requestUrl}`);
      
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
      // Always use the base alldown endpoint as requested
      const apiData = await tryFetch(config.apiUrl);
      console.log("API Response Status:", apiData?.status);

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
            return res.status(404).json({ error: videoData.message || "Video not found or link is private." });
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
