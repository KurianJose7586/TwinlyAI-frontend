# 🦋 TwinlyAI Frontend

The official Next.js-powered web application for **TwinlyAI**. Providing a seamless, modern interface for candidates to build their AI professional identity and for recruiters to source talent with precision.

## ✨ Features

### For Candidates
- **Digital Twin Customization**: Dynamic avatar builder and profile orchestration using DiceBear.
- **Onboarding Wizard**: A step-by-step interactive journey to build your AI professional persona.
- **Integration Hub**: Connect GitHub, LinkedIn, and other professional sources to train your Twin.

### For Recruiters
- **Intelligent Dashboard**: View candidate matches with semantic scores and detailed summaries.
- **Dynamic AI Chat**: Real-time streaming chat with a candidate's AI Twin to evaluate soft and hard skills instantly.
- **Persistent Sessions**: Automated chat history tracking in the browser sidebar for efficient candidate management.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context (Auth) + [TanStack Query](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-time**: Event-driven streaming for AI responses.

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js 18+
- npm / yarn / pnpm

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

- `src/app/`: Next.js pages and routing (Auth, Recruiter, Candidate, Onboarding).
- `src/components/`: Reusable UI components and layout sections.
- `src/context/`: Global state providers (Authentication).
- `src/services/`: API client services for backend interaction.
- `src/lib/`: Shared utilities, validation, and constants.

## 📄 License
This project is proprietary. © 2025 TwinlyAI.
