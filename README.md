# HealthAI - Healthcare AI Web Application

A full-stack healthcare AI web application built with React, TypeScript, and Node.js/Express. Provides AI-powered health assistance through symptom checking, a health chatbot, and medical information resources.

## Features

- 🏥 **Dashboard** - Overview of health stats and quick navigation
- �� **Symptom Checker** - AI-powered symptom assessment with severity classification
- 💬 **Health Chatbot** - Conversational AI for health questions (keyword-based, no external API)
- 📚 **Medical Information** - Browse common health conditions, symptoms, treatments, and prevention

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6

**Backend:**
- Node.js + Express
- TypeScript
- CORS enabled

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Build

```bash
# Build both frontend and backend
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/chat | AI health chatbot |
| POST | /api/symptom-check | Symptom assessment |
| GET | /api/health-info | Health conditions data |

## Disclaimer

This application provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
