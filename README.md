# Chaudhary Hospital Management System — Frontend

Modern, fast, and responsive React + Vite frontend for Chaudhary Hospital Management System.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Realtime**: Socket.IO Client
- **Offline / PWA**: Service Worker with offline caching & background sync

## Portals & Roles
- **Receptionist Portal**: Patient registration, OPD queuing, token distribution
- **Nurse / Staff Portal**: Vitals tracking, inpatient monitoring, bed management, SBAR handovers
- **Doctor Portal**: Clinical notes, prescriptions, diagnosis history, admissions
- **Admin Portal**: Discharges, automated billing, audits, room/bed roster, analytics
- **Developer Portal**: Live system diagnostics, API round-trip benchmarks, error logs

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local` if your backend is hosted separately:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Production build outputs to the `dist/` directory.
