# Technical Stack & Build System

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context API for local state
- **Data Fetching**: TanStack React Query (v5)
- **Routing**: React Router DOM (v6)
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Form Handling**: React Hook Form with Zod validation

## Key Libraries
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts/Visualization**: Recharts
- **Drag and Drop**: @dnd-kit
- **Notifications**: Sonner (toast notifications)
- **Theming**: next-themes

## Environment Requirements
- Node.js (latest LTS recommended)
- Required environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_APP_URL` (optional)

## Common Commands

### Development
```bash
# Install dependencies
npm i

# Start development server
npm run dev
```

### Building
```bash
# Production build
npm run build

# Development build
npm run build:dev
```

### Code Quality
```bash
# Run linting
npm run lint
```

### Preview Production Build
```bash
# Preview built application
npm run preview
```

## Deployment
The application is built as a static site that can be deployed to any static hosting provider. The build output is in the `dist` directory.

## Supabase Integration
The project uses Supabase for backend services. The Supabase configuration is located in the `supabase` directory. The project requires proper Supabase credentials in the environment variables.