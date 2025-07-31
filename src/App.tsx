
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CollaboratorAccessGuard } from '@/components/CollaboratorAccessGuard';
import { PageTransition } from '@/components/PageTransition';
import { AuthDebugPanel } from '@/components/AuthDebugPanel';

// Layouts (mantidos como imports estáticos)
import ProdutorLayout from '@/components/ProdutorLayout';
import CompanyLayout from '@/components/CompanyLayout';
import StudentLayout from '@/components/StudentLayout';

// Lazy imports para todas as páginas
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Courses = lazy(() => import('@/pages/Courses'));
const CourseDetails = lazy(() => import('@/pages/CourseDetails'));
const Community = lazy(() => import('@/pages/Community'));
const Profile = lazy(() => import('@/pages/Profile'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Learning = lazy(() => import('@/pages/Learning'));
const LoginProdutor = lazy(() => import('@/pages/LoginProdutor'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Planos = lazy(() => import('@/pages/Planos'));
const ActivateAccount = lazy(() => import('@/pages/ActivateAccount'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Admin = lazy(() => import('@/pages/Admin'));
const CompanyData = lazy(() => import('@/pages/checkout/company-data'));
const CheckoutSuccess = lazy(() => import('@/pages/checkout/success'));

// Producer pages
const ProducerDashboard = lazy(() => import('@/pages/ProducerDashboard'));
const ProducerCourses = lazy(() => import('@/pages/ProducerCourses'));
const ProducerCourseDetails = lazy(() => import('@/pages/ProducerCourseDetails'));
const ProducerCompanies = lazy(() => import('@/pages/ProducerCompanies'));
const ProducerCompanyDetails = lazy(() => import('@/pages/ProducerCompanyDetails'));
const ProducerMentorship = lazy(() => import('@/pages/ProducerMentorship'));
const ProducerCommunity = lazy(() => import('@/pages/ProducerCommunity'));
const ProducerCollaboratorsAnalytics = lazy(() => import('@/pages/ProducerCollaboratorsAnalytics'));
const ProducerSubscriptionAnalytics = lazy(() => import('@/pages/ProducerSubscriptionAnalytics'));
const ProducerPlans = lazy(() => import('@/pages/ProducerPlans'));
const ProducerProfile = lazy(() => import('@/pages/ProducerProfile'));
const ProducerAIConfigurations = lazy(() => import('@/pages/ProducerAIConfigurations'));

// Company pages
const CompanyDashboard = lazy(() => import('@/pages/CompanyDashboard'));
const CompanyCourses = lazy(() => import('@/pages/CompanyCourses'));
const CompanyMentorships = lazy(() => import('@/pages/CompanyMentorships'));
const CompanyCollaborators = lazy(() => import('@/pages/CompanyCollaborators'));
const CompanyCollaboratorsAnalytics = lazy(() => import('@/pages/CompanyCollaboratorsAnalytics'));
const CompanyProfile = lazy(() => import('@/pages/CompanyProfile'));
const CourseProgressPage = lazy(() => import('@/components/company/CourseProgressPage'));

// Support pages
const SupportTickets = lazy(() => import('@/pages/SupportTickets'));
const SupportTicketDetail = lazy(() => import('@/pages/SupportTicketDetail'));
const CreateSupportTicket = lazy(() => import('@/pages/CreateSupportTicket'));

// Student pages
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const StudentCourses = lazy(() => import('@/pages/StudentCourses'));
const StudentCourseDetail = lazy(() => import('@/pages/StudentCourseDetail'));
const StudentLessonView = lazy(() => import('@/pages/StudentLessonView'));
const StudentMentorship = lazy(() => import('@/pages/StudentMentorship'));
const StudentCommunity = lazy(() => import('@/pages/StudentCommunity'));
const StudentGamification = lazy(() => import('@/pages/StudentGamification'));
const StudentProfile = lazy(() => import('@/pages/StudentProfile'));
const StudentAnalytics = lazy(() => import('@/pages/StudentAnalytics'));
const StudentQuizView = lazy(() => import('@/pages/StudentQuizView'));
const TopicDetailView = lazy(() => import('@/components/community/TopicDetailView'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <div className="text-slate-400 text-sm font-medium">Carregando...</div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para preload de páginas importantes
const PagePreloader = () => {
  useEffect(() => {
    // Preload das páginas mais importantes após o carregamento inicial
    const preloadPages = () => {
      // Preload dos dashboards principais
      import('@/pages/ProducerDashboard');
      import('@/pages/CompanyDashboard');
      import('@/pages/StudentDashboard');
      
      // Preload das páginas de cursos
      import('@/pages/ProducerCourses');
      import('@/pages/CompanyCourses');
      import('@/pages/StudentCourses');
      
      // Preload das páginas de perfil
      import('@/pages/ProducerProfile');
      import('@/pages/CompanyProfile');
      import('@/pages/StudentProfile');
    };

    // Aguarda um pouco para não interferir no carregamento inicial
    const timer = setTimeout(preloadPages, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

// Função para verificar se há um token de ativação na URL
const checkActivationToken = () => {
  const url = window.location.href;
  const isRootPath = window.location.pathname === '/';
  
  // Verificar se estamos na página principal mas com parâmetros de ativação
  if (isRootPath) {
    // Verificar token no formato ?token=xxx&type=invite
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');
    
    // Verificar hash no formato #access_token=xxx
    const hash = window.location.hash;
    const hasActivationParams = (token && type === 'invite') || 
                               (hash && hash.includes('access_token'));
    
    const hasRecoveryParams = (token && type === 'recovery') || 
                             (hash && hash.includes('recovery_token'));
    
    if (hasActivationParams) {
      console.log('🔄 Detectado token de ativação na página principal, redirecionando...');
      // Construir URL de ativação
      const redirectUrl = `/activate-account${token ? `?token=${token}&type=${type || 'invite'}` : ''}${hash || ''}`;
      window.location.href = redirectUrl;
      return true;
    }
    
    if (hasRecoveryParams) {
      console.log('🔄 Detectado token de recuperação na página principal, redirecionando...');
      // Construir URL de recuperação
      const redirectUrl = `/reset-password${token ? `?token=${token}&type=${type || 'recovery'}` : ''}${hash || ''}`;
      window.location.href = redirectUrl;
      return true;
    }
  }
  return false;
};

function App() {
  // Verificar token de ativação ao carregar
  useEffect(() => {
    checkActivationToken();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <PagePreloader />
          <Suspense fallback={<LoadingSpinner />}>
            <PageTransition>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login-produtor" element={<LoginProdutor />} />
                <Route path="/planos" element={<Planos />} />
                <Route path="/activate-account" element={<ActivateAccount />} />
                <Route path="/reset-password" element={<ResetPassword />} />
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
                  <Route path="subscription-analytics" element={<ProducerSubscriptionAnalytics />} />
                  <Route path="plans" element={<ProducerPlans />} />
                  <Route path="profile" element={<ProducerProfile />} />
                  <Route path="ai-configurations" element={<ProducerAIConfigurations />} />
                  <Route path="support" element={<SupportTickets />} />
                  <Route path="support/new" element={<CreateSupportTicket />} />
                  <Route path="support/:ticketId" element={<SupportTicketDetail />} />
                  <Route index element={<Navigate to="/producer/dashboard" replace />} />
                </Route>

                {/* Company routes */}
                <Route path="/company" element={<CompanyLayout />}>
                  <Route path="dashboard" element={<CompanyDashboard />} />
                  <Route path="courses" element={<CompanyCourses />} />
                  <Route path="course-progress" element={<CourseProgressPage />} />
                  <Route path="mentorships" element={<CompanyMentorships />} />
                  <Route path="collaborators" element={<CompanyCollaborators />} />
                  <Route path="collaborators-analytics" element={<CompanyCollaboratorsAnalytics />} />
                  <Route path="profile" element={<CompanyProfile />} />
                  <Route path="support" element={<SupportTickets />} />
                  <Route path="support/new" element={<CreateSupportTicket />} />
                  <Route path="support/:ticketId" element={<SupportTicketDetail />} />
                  <Route index element={<Navigate to="/company/dashboard" replace />} />
                </Route>

                {/* Support routes - moved to specific layouts */}

                {/* Student routes */}
                <Route path="/student" element={
                  <CollaboratorAccessGuard>
                    <StudentLayout />
                  </CollaboratorAccessGuard>
                }>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentCourses />} />
                  <Route path="courses/:courseId" element={<StudentCourseDetail />} />
                  <Route path="courses/:courseId/lessons/:lessonId" element={<StudentLessonView />} />
                  <Route path="courses/:courseId/quizzes/:quizId" element={<StudentQuizView />} />
                  <Route path="mentorship" element={<StudentMentorship />} />
                  <Route path="community" element={<StudentCommunity />} />
                  <Route path="community/topic/:topicId" element={<TopicDetailView />} />
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
            </PageTransition>
          </Suspense>
          <Toaster />
          {import.meta.env.DEV && <AuthDebugPanel />}
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
