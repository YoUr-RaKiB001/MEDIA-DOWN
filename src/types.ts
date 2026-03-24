export interface VideoFormat {
  quality: string;
  url: string;
  size: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: VideoFormat[];
}

export interface DownloadItem {
  id: string;
  title: string;
  progress: number;
  status: "Downloading" | "Paused" | "Completed" | "Failed";
  size: string;
  speed: string;
  thumbnail: string;
}

export interface AppConfig {
  maintenanceMode: boolean;
  apiFailover: boolean;
  activeApiUrl: string;
  enableAds: boolean;
  enableNotifications: boolean;
}
