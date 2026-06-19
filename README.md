<div align="center">
  <h1>🦋 TwinlyAI Frontend</h1>
  <p><strong>The Official User Interface for Digital Twin Orchestration</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
</div>

<br />

The **TwinlyAI Frontend** is a meticulously crafted web application built to provide a seamless, modern interface. It serves two distinct user journeys: empowering **Candidates** to build their AI professional identity, and enabling **Recruiters** to source talent with precision through semantic search and real-time voice conversations.

---

## ✨ Key Features

### 👨‍💻 For Candidates
- **Digital Twin Customization**: A dynamic avatar builder and profile orchestration suite.
- **Onboarding Wizard**: A step-by-step interactive journey with live previews to construct your AI professional persona.
- **Integration Hub**: Connect GitHub, LinkedIn, and other professional sources to train your Twin.
- **Instant UI Rendering**: Zero layout shift and instant responsiveness using the **Boneyard** skeleton system.

### 🕵️‍♀️ For Recruiters
- **Intelligent Dashboard**: View candidate matches with semantic relevance scores and detailed AI summaries.
- **Live AI Voice Calls**: Real-time WebRTC audio streaming with candidate AI Twins powered by **LiveKit**, featuring natural interruption handling and VAD.
- **Dynamic Text Chat**: Real-time streaming chat interface to evaluate soft and hard skills instantly.
- **Command Menu**: Lightning-fast navigation using a `Ctrl+K` command palette.
- **Persistent Sessions**: Automated chat history tracking for efficient candidate management.

---

## 🛠️ Technology Stack

| Category | Technology |
| --- | --- |
| **Framework** | [Next.js 15+](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State & Fetching** | [TanStack Query](https://tanstack.com/query) + React Context |
| **Voice / RTC** | [@livekit/components-react](https://livekit.io/) |
| **Key UI Libraries** | Boneyard-js (Skeletons), CMDK (Command Menu), Embla (Carousels), Lucide (Icons) |

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
- Node.js 18.x or higher
- npm or pnpm

### 2. Environment Configuration
Create a `.env.local` file in the `frontend` root directory:
```env
# Core API
NEXT_PUBLIC_API_URL=http://localhost:8000

# LiveKit WebRTC Configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server-url
```

### 3. Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── app/          # Next.js App Router (Auth, Dashboard, Onboarding flows)
│   ├── bones/        # Skeleton screen definitions for modern hydration
│   ├── components/   # Reusable UI components and shared layouts
│   ├── context/      # Global state providers (Auth, Theme)
│   ├── lib/          # Shared utilities, validation, and theme configs
│   └── services/     # API client services (Axios, TanStack Query)
├── public/           # Static assets
└── package.json
```

---

<div align="center">
  <i>Proprietary software. © 2026 TwinlyAI. All rights reserved.</i>
</div>
