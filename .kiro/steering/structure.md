# Project Structure

## Root Directory
- `.env` / `.env.local` / `env.example` - Environment variable configuration
- `package.json` - Project dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui component configuration
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration
- `index.html` - Entry HTML file

## Source Code (`src/`)
- `src/App.tsx` - Main application component with routing
- `src/main.tsx` - Application entry point
- `src/index.css` - Global CSS styles
- `src/vite-env.d.ts` - Vite type declarations

### Key Directories
- `src/components/` - Reusable UI components
  - `src/components/ui/` - shadcn/ui components
  - Layout components for different user roles (ProdutorLayout, CompanyLayout, StudentLayout)
- `src/pages/` - Page components organized by user role
  - Public pages (Index, Auth, etc.)
  - Producer pages (ProducerDashboard, ProducerCourses, etc.)
  - Company pages (CompanyDashboard, CompanyCollaborators, etc.)
  - Student pages (StudentDashboard, StudentCourses, etc.)
- `src/hooks/` - Custom React hooks
  - `src/hooks/auth/` - Authentication related hooks
- `src/lib/` - Utility functions and shared code
- `src/services/` - API and external service integrations
- `src/utils/` - Helper functions and utilities
- `src/integrations/` - Third-party integrations

## Backend (`supabase/`)
- `supabase/config.toml` - Supabase project configuration
- `supabase/migrations/` - Database migration files
- `supabase/functions/` - Supabase Edge Functions

## Public Assets (`public/`)
- `public/favicon-calmon.ico` - Favicon
- `public/Logomarca Calmon Academy.png` - Logo
- `public/placeholder.svg` - Placeholder image
- `public/robots.txt` - SEO configuration

## Code Organization Patterns
- **Path Aliases**: The project uses `@/` alias for imports from the `src` directory
- **Role-Based Organization**: Components and pages are organized by user role (Producer, Company, Student)
- **Feature-Based Structure**: Within each role, code is organized by feature (Dashboard, Courses, Analytics, etc.)
- **Component Composition**: UI is built using composition of smaller components from shadcn/ui
- **Route Structure**: Routes are organized hierarchically with nested routes for different user roles