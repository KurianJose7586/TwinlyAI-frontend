# 🦋 TwinlyAI Frontend

The official Next.js-powered web application for **TwinlyAI**. Providing a seamless, modern interface for candidates to build their AI professional identity and for recruiters to source talent with precision.

## ✨ Features

### For Candidates
- **Digital Twin Customization**: Dynamic avatar builder and profile orchestration.
- **Onboarding Wizard**: A step-by-step interactive journey to build your AI professional persona.
- **Integration Hub**: Connect GitHub and other professional sources to train your Twin.
- **Skeleton Experience**: Instant UI responsiveness using the **Boneyard** skeleton system.

### For Recruiters
- **Intelligent Dashboard**: View candidate matches with semantic scores and detailed summaries.
- **Dynamic AI Chat**: Real-time streaming chat with a candidate's AI Twin to evaluate soft and hard skills instantly.
- **Command Menu**: Powerful search and navigation using `Ctrl+K` command palette.
- **Persistent Sessions**: Automated chat history tracking for efficient candidate management.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [TanStack Query](https://tanstack.com/query) + React Context
- **Components**: [Boneyard-js](https://github.com/kurianjose/boneyard-js) (Skeletons), [CMDK](https://cmdk.paco.me/) (Command Menu), [Embla Carousel](https://www.embla-carousel.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js 18+

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

- `src/app/`: Next.js App Router (Auth, Dashboard, Onboarding).
- `src/bones/`: Skeleton screen definitions for modern hydration.
- `src/components/`: Reusable UI components and shared layouts.
- `src/context/`: Global state providers (Auth, Theme).
- `src/services/`: API client services using Axios and TanStack Query.
- `src/lib/`: Shared utilities, validation, and theme configurations.

## 📄 License
This project is proprietary. © 2025 TwinlyAI.
