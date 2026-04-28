# Shift Scheduler Frontend

A modern, responsive React web application designed for healthcare shift management. This frontend provides an intuitive interface to manage professional rosters, track unavailabilities, and generate complex shift schedules.

## 🚀 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State & Logic**: Functional Components with Hooks
- **API Client**: [Axios](https://axios-http.com/)
- **Date Handling**: [date-fns](https://date-fns.org/) & [react-datepicker](https://reactdatepicker.com/)
- **Styling**: Custom CSS with CSS Variables (Themed Design System)

## ✨ Key Features

- **Roster Management**: Comprehensive CRUD operations for Specialists and Interns.
- **Intelligent Scheduling**: Configurable parameters for morning/night staffing and weekday/weekend requirements.
- **Unavailability Calendar**: Visual selection of dates and shift types when professionals are not available.
- **Live Statistics**: Real-time distribution summary showing shift counts (Morning, Night, Total) to ensure fairness.
- **Excel-Optimized Export**: One-click download of the generated schedule in a format compatible with Excel and other spreadsheet software.
- **Responsive Design**: Optimized for both desktop and tablet workflows.

## 🎨 UI/UX Design

The application follows a custom design system defined in `src/styles/variables.css`:
- **Primary Palette**: Deep Teal (`#007d8a`) for professional reliability.
- **Accent Palette**: Warm Orange (`#f9b233`) for calls-to-action and highlights.
- **Components**: Soft-shadowed panels, rounded inputs, and interactive tabbed navigation.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the frontend folder:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

### Development

Run the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📁 Project Structure

- `src/components/`: Reusable UI components.
- `src/styles/`: Centralized CSS variables and component-specific styles.
- `src/services/`: API wrappers for communicating with the FastAPI backend.