
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { SidebarProvider } from '@/components/ui/sidebar';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Courses from '@/pages/Courses';
import CourseDetails from '@/pages/CourseDetails';
import Community from '@/pages/Community';
import Profile from '@/pages/Profile';
import Analytics from '@/pages/Analytics';
import Learning from '@/pages/Learning';
import LoginProdutor from '@/pages/LoginProdutor';
import NotFound from '@/pages/NotFound';
import Planos from '@/pages/Planos';
import ActivateAccount from '@/pages/ActivateAccount';
import Admin from '@/pages/Admin';
import CompanyData from '@/pages/checkout/company-data';
import CheckoutSuccess from '@/pages/checkout/success';

// Producer pages
import ProducerDashboard from '@/pages/ProducerDashboard';
import ProducerCourses from '@/pages/ProducerCourses';
import ProducerCourseDetails from '@/pages/ProducerCourseDetails';
import ProducerCompanies from '@/pages/ProducerCompanies';
import ProducerCompanyDetails from '@/pages/ProducerCompanyDetails';
import ProducerMentorship from '@/pages/ProducerMentorship';
import ProducerCommunity from '@/pages/ProducerCommunity';
import ProducerCollaboratorsAnalytics from '@/pages/ProducerCollaboratorsAnalytics';
import ProducerPlans from '@/pages/ProducerPlans';
import ProducerProfile from '@/pages/ProducerProfile';
import ProducerAIConfigurations from '@/pages/ProducerAIConfigurations';

// Company pages
import CompanyDashboard from '@/pages/CompanyDashboard';
import CompanyCourses from '@/pages/CompanyCourses';
import CompanyMentorships from '@/pages/CompanyMentorships';
import CompanyCollaborators from '@/pages/CompanyCollaborators';
import CompanyCollaboratorsAnalytics from '@/pages/CompanyCollaboratorsAnalytics';
import CompanyProfile from '@/pages/CompanyProfile';

// Student pages
import StudentDashboard from '@/pages/StudentDashboard';
import StudentCourses from '@/pages/StudentCourses';
import StudentCourseDetail from '@/pages/StudentCourseDetail';
import StudentLessonView from '@/pages/StudentLessonView';
import StudentCalendar from '@/pages/StudentCalendar';
import StudentMentorship from '@/pages/StudentMentorship';
import StudentCommunity from '@/pages/StudentCommunity';
import StudentGamification from '@/pages/StudentGamification';
import StudentProfile from '@/pages/StudentProfile';
import StudentAnalytics from '@/pages/StudentAnalytics';

// Layouts
import ProdutorLayout from '@/components/ProdutorLayout';
import CompanyLayout from '@/components/CompanyLayout';
import StudentLayout from '@/components/StudentLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login-produtor" element={<LoginProdutor />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/activate-account" element={<ActivateAccount />} />
            <Route path="/checkout/company-data" element={<CompanyData />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />

            {/* Legacy company dashboard redirect */}
            <Route path="/company-dashboard" element={<Navigate to="/company/dashboard" replace />} />

            {/* Producer routes */}
            <Route path="/producer" element={<ProdutorLayout />}>
              <Route path="dashboard" element={<ProducerDashboard />} />
              <Route path="courses" element={<ProducerCourses />} />
              <Route path="courses/:courseId" element={<ProducerCourseDetails />} />
              <Route path="companies" element={<ProducerCompanies />} />
              <Route path="companies/:id" element={<ProducerCompanyDetails />} />
              <Route path="mentorship" element={<ProducerMentorship />} />
              <Route path="community" element={<ProducerCommunity />} />
              <Route path="collaborators-analytics" element={<ProducerCollaboratorsAnalytics />} />
              <Route path="plans" element={<ProducerPlans />} />
              <Route path="profile" element={<ProducerProfile />} />
              <Route path="ai-configurations" element={<ProducerAIConfigurations />} />
              <Route index element={<Navigate to="/producer/dashboard" replace />} />
            </Route>

            {/* Company routes */}
            <Route path="/company" element={<CompanyLayout />}>
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="courses" element={<CompanyCourses />} />
              <Route path="mentorships" element={<CompanyMentorships />} />
              <Route path="collaborators" element={<CompanyCollaborators />} />
              <Route path="collaborators-analytics" element={<CompanyCollaboratorsAnalytics />} />
              <Route path="profile" element={<CompanyProfile />} />
              <Route index element={<Navigate to="/company/dashboard" replace />} />
            </Route>

            {/* Student routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="courses/:courseId" element={<StudentCourseDetail />} />
              <Route path="courses/:courseId/lessons/:lessonId" element={<StudentLessonView />} />
              <Route path="calendar" element={<StudentCalendar />} />
              <Route path="mentorship" element={<StudentMentorship />} />
              <Route path="community" element={<StudentCommunity />} />
              <Route path="gamification" element={<StudentGamification />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="analytics" element={<StudentAnalytics />} />
              <Route index element={<Navigate to="/student/dashboard" replace />} />
            </Route>

            {/* Legacy routes for backward compatibility */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/learning" element={<Learning />} />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
