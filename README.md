# UtsavCycle AI ♻️
### Turn Event & Festival Waste into Community Resources

[![Live Vercel Deployment](https://img.shields.io/badge/Vercel-Deployment-brightgreen?style=for-the-badge&logo=vercel)](https://utsavai-beta.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Deepika-bysani2006/UtsavCycle-AI-Festival-Wedding-Waste-Flow-Matcher)

🌐 **Live Application**: [https://utsavai-beta.vercel.app](https://utsavai-beta.vercel.app)  
📦 **GitHub Repository**: [UtsavCycle-AI-Festival-Wedding-Waste-Flow-Matcher](https://github.com/Deepika-bysani2006/UtsavCycle-AI-Festival-Wedding-Waste-Flow-Matcher)

**UtsavCycle AI** is an end-to-end, AI-powered sustainability platform designed for Indian weddings, festivals, pujas, corporate gatherings, and large community events. It predicts waste generation, connects event organizers with verified recovery partners, tracks pickup logistics, and quantifies environmental impact in real time.

---

## 🌟 Key Features

- 🤖 **AI Waste Prediction Engine**: Powered by Google Gemini AI to forecast waste quantities (Food, Flowers, Plastic, Paper, Fabric) based on guest count, event duration, food style, and decoration type.
- 🤝 **Smart Recovery Partner Matching**: Algorithms that match event waste categories with nearby verified NGOs, floral recyclers, food banks, and composting facilities based on capacity and location.
- 🚛 **Pickup Request & Tracking System**: Seamlessly schedule and track pickup requests through real-time status progressions (`PENDING` ➔ `MATCHED` ➔ `CONFIRMED` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
- 📊 **Environmental Impact Dashboard**: Track lifetime sustainability metrics including **Waste Diverted (kg)**, **CO₂ Emissions Prevented (kg)**, **Meals Rescued**, and **Trees Equivalent**.
- 💬 **AI Sustainability Assistant**: Built-in Gemini AI conversational assistant to answer event waste segregation, composting, and eco-friendly event planning queries.
- 🌓 **Dual Theme Support (Light & Dark)**: Accessible, responsive theme system supporting light mode, dark mode, and automatic system preference detection.
- 📱 **Progressive Web App (PWA)**: Mobile-installable PWA with offline caching capabilities, service worker auto-updates, and app manifest support.

---

## 🏗️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite |
| **PWA & Performance** | `vite-plugin-pwa`, Workbox, Custom Service Worker |
| **Backend API** | Node.js, Express.js, `tsx` |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Authentication & DB** | Firebase Authentication, Google Sign-In, Cloud Firestore |

---

## 📁 Project Structure

```
UtsavCycleAI/
├── public/                 # Static assets, logos, and PWA icons
├── server/                 # Express backend API for Gemini AI integration
│   └── src/index.ts        # Gemini API endpoints (/api/waste/predict, /api/chat)
├── src/
│   ├── components/         # Reusable UI components & layouts
│   │   ├── layout/         # AppLayout & Responsive Sidebar Navigation
│   │   └── ui/             # Buttons, Cards, Inputs, Badges, ThemeToggle
│   ├── contexts/           # AuthContext (Firebase) & ThemeContext
│   ├── lib/                # Firebase & Firestore helpers
│   ├── pages/              # Landing, Auth, Dashboard, Predict, Matching, Assistant, Impact
│   ├── types/              # TypeScript interfaces for Event, PickupRequest, Partner, etc.
│   ├── App.tsx             # Route management & protected route guards
│   └── main.tsx            # PWA Service Worker registration & App mounting
├── index.html              # HTML shell & instant theme injection script
├── tailwind.config.js      # Tailwind CSS configuration with custom brand colors
└── vite.config.ts          # Vite build config & PWA plugin settings
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Deepika-bysani2006/UtsavCycle-AI-Festival-Wedding-Waste-Flow-Matcher.git
cd UtsavCycle-AI-Festival-Wedding-Waste-Flow-Matcher
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=http://localhost:3001
```

Create a `.env` file in the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

### 4. Run Development Server
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173/`
- **Backend API**: `http://localhost:3001`

---

## 💡 Impact Calculation Model

- **CO₂ Emissions Prevented**: `Total Waste Diverted (kg) × 0.7`
- **Meals Rescued**: `Food Waste Diverted (kg) × 0.3`
- **Trees Equivalent**: `CO₂ Saved (kg) ÷ 21`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
