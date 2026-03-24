# 🌪️ Vortex Video Downloader

Vortex is a powerful, high-performance video downloader and analyzer built with **React**, **Express**, and **Firebase**. It features a modern, sleek interface and a robust admin dashboard for managing API configurations in real-time.

---

## ✨ Features

- **🚀 High-Speed Analysis:** Instantly analyze and fetch download links for videos from various platforms.
- **🛡️ Admin Dashboard:** Real-time configuration of API endpoints, failover settings, and system monitoring.
- **🔐 Secure Authentication:** Multi-method login (Google & Email/Password) powered by Firebase Auth.
- **☁️ Cloud-Native:** Fully compatible with **Vercel** and **Cloud Run** for seamless deployment.
- **💾 Firestore Integration:** Persistent settings and configuration that stay safe even after server restarts.
- **🎨 Modern UI/UX:** Built with Tailwind CSS, Lucide Icons, and Framer Motion for a premium feel.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express, Axios, Firebase Admin SDK.
- **Database:** Firebase Firestore (for global settings).
- **Authentication:** Firebase Auth (Google & Email/Password).
- **Deployment:** Vercel (Serverless Functions) / Cloud Run.

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18 or higher)
- A Firebase Project

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vortex-downloader.git

# Navigate to the project directory
cd vortex-downloader

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `firebase-applet-config.json` in the root directory with your Firebase credentials:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "firestoreDatabaseId": "YOUR_DATABASE_ID"
}
```

### 4. Running Locally

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the project settings.
3. Click **Deploy**.

### Cloud Run

The project is pre-configured for Cloud Run deployment with a custom Express server.

---

## 🔑 Admin Access

Access the admin dashboard at `/login`. 

> **Note:** Only authorized emails (e.g., `ahamedemran60@gmail.com`) are granted access to the dashboard. You can manage this in the `firestore.rules` and `App.tsx`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

**Built with ❤️ by Vortex Team**
