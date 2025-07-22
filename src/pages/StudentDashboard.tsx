import { useAuth } from '@/hooks/auth';
import { useStudentPoints } from '@/hooks/useStudentGamification';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { usePointsHistory } from '@/hooks/useStudentGamification';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Trophy,
  MessageCircle,
  Calendar,
  User,
  Zap,
  Star,
  Target,
  Sparkles,
  Crown,
  ArrowUpRight,
  Play,
  CheckCircle,
  BarChart3,
  Users,
  Brain,
  Rocket,
  Flame,
  Lightbulb,
  Heart,
  Shield,
  Gem,
  Diamond,
  Coins,
  Sparkle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StudentAchievements } from '@/components/student/StudentAchievements';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const StudentDashboard = () => {
  const { companyUserData } = useAuth();
  const { data: studentPoints } = useStudentPoints();
  const { data: courses = [] } = useStudentCourses();
  const { data: pointsHistory = [] } = usePointsHistory();

  const totalPoints = studentPoints?.total_points || 0;
  const currentStreak = studentPoints?.streak_days || 0;

  // Calculate real stats from actual data
  const coursesInProgress = courses.filter(course => 
    course.progress_percentage > 0 && course.progress_percentage < 100
  ).length;
  
  const completedCourses = courses.filter(course => 
    course.progress_percentage >= 100
  ).length;

  // Calculate total hours studied based on course progress
  const hoursStudied = courses.reduce((total, course) => {
    const progressDecimal = course.progress_percentage / 100;
    return total + (course.estimated_hours * progressDecimal);
  }, 0);

  // Header content com badges premium dark theme
  const headerContent = (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Badge className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-lg backdrop-blur-sm">
          <Diamond className="w-3 h-3 mr-1" />
          {totalPoints} pontos
        </Badge>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Badge className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white border-0 shadow-lg backdrop-blur-sm">
          <Flame className="w-3 h-3 mr-1" />
          {currentStreak} dias seguidos
        </Badge>
      </motion.div>
    </motion.div>
  );

  // Stats cards com paleta dark theme premium
  const statsCards = [
    {
      title: "Cursos em Andamento",
      value: coursesInProgress,
      icon: BookOpen,
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      bgGradient: "from-emerald-400/20 via-green-500/15 to-teal-600/20",
      description: "Continue aprendendo",
      textGradient: "from-emerald-400 to-green-500"
    },
    {
      title: "Cursos Concluídos",
      value: completedCourses,
      icon: Award,
      gradient: "from-purple-400 via-violet-500 to-purple-600",
      bgGradient: "from-purple-400/20 via-violet-500/15 to-purple-600/20",
      description: "Conquistas alcançadas",
      textGradient: "from-purple-400 to-violet-500"
    },
    {
      title: "Horas Estudadas",
      value: `${hoursStudied.toFixed(1)}h`,
      icon: Clock,
      gradient: "from-blue-400 via-cyan-500 to-blue-600",
      bgGradient: "from-blue-400/20 via-cyan-500/15 to-blue-600/20",
      description: "Tempo investido",
      textGradient: "from-blue-400 to-cyan-500"
    },
    {
      title: "Pontos Acumulados",
      value: totalPoints,
      icon: Trophy,
      gradient: "from-orange-400 via-yellow-500 to-orange-600",
      bgGradient: "from-orange-400/20 via-yellow-500/15 to-orange-600/20",
      description: "Recompensas ganhas",
      textGradient: "from-orange-400 to-yellow-500"
    }
  ];

  // Quick actions com design dark theme premium
  const quickActions = [
    {
      title: "Meus Cursos",
      description: "Continuar aprendendo",
      icon: BookOpen,
      href: "/student/courses",
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      bgGradient: "from-emerald-400/10 via-green-500/8 to-teal-600/10"
    },
    {
      title: "Comunidade",
      description: "Interagir com outros alunos",
      icon: MessageCircle,
      href: "/student/community",
      gradient: "from-blue-400 via-cyan-500 to-blue-600",
      bgGradient: "from-blue-400/10 via-cyan-500/8 to-blue-600/10"
    },
    {
      title: "Mentorias",
      description: "Agendar uma mentoria",
      icon: Calendar,
      href: "/student/mentorship",
      gradient: "from-purple-400 via-violet-500 to-purple-600",
      bgGradient: "from-purple-400/10 via-violet-500/8 to-purple-600/10"
    },
    {
      title: "Meu Perfil",
      description: "Ver meu progresso",
      icon: User,
      href: "/student/profile",
      gradient: "from-orange-400 via-yellow-500 to-orange-600",
      bgGradient: "from-orange-400/10 via-yellow-500/8 to-orange-600/10"
    }
  ];

  return (
    <PageLayout
      title={`Olá, ${companyUserData?.name || 'Estudante'}! 👋`}
      subtitle="Continue sua jornada de aprendizado com tecnologia de ponta"
      headerContent={headerContent}
      background="dark"
    >
      {/* Background Elements Dark Theme Premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/15 via-green-500/12 to-teal-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/15 via-violet-500/12 to-purple-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-400/12 via-cyan-500/10 to-blue-600/12 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-orange-400/12 via-yellow-500/10 to-orange-600/12 rounded-full blur-3xl animate-pulse delay-1500" />
      </div>

      <div className="relative space-y-8">
        {/* Stats Grid - Dark Theme Premium */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group h-32">
                {/* Animated background gradient premium dark */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  stat.bgGradient
                )} />
                
                <CardContent className="relative p-6 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <motion.p 
                        className="text-sm font-semibold text-slate-300 mb-2 whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        {stat.title}
                      </motion.p>
                      <motion.p 
                        className={cn(
                          "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                          stat.textGradient
                        )}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      >
                        {stat.value}
                      </motion.p>
                      <motion.p 
                        className="text-xs text-slate-400 mt-1 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {stat.description}
                      </motion.p>
                    </div>
                    <motion.div 
                      className={cn(
                        "p-4 rounded-2xl bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0",
                        stat.gradient
                      )}
                      whileHover={{ rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Animated progress indicator premium dark */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions - Design Dark Theme Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
                <CardHeader className="pb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                      <Sparkle className="h-5 w-5 text-emerald-400" />
                      Ações Rápidas
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Link to={action.href}>
                          <div className={cn(
                            "relative overflow-hidden p-6 rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm transition-all duration-300 group cursor-pointer",
                            "hover:bg-slate-800/80 hover:shadow-2xl hover:border-slate-600/60"
                          )}>
                            {/* Animated background premium dark */}
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                              action.bgGradient
                            )} />
                            
                            <div className="relative flex items-center gap-4">
                              <motion.div 
                                className={cn(
                                  "p-3 rounded-xl bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-300",
                                  action.gradient
                                )}
                                whileHover={{ rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <action.icon className="h-6 w-6 text-white" />
                              </motion.div>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">
                                  {action.title}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                  {action.description}
                                </p>
                              </div>
                              
                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                whileHover={{ x: 3 }}
                              >
                                <ArrowUpRight className="h-5 w-5 text-slate-400" />
                              </motion.div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Recent Activities - Design Dark Theme Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
                <CardHeader className="pb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                      <Gem className="h-5 w-5 text-purple-400" />
                      Atividades Recentes
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {pointsHistory.length > 0 ? (
                      <div className="space-y-4">
                        {pointsHistory.slice(0, 5).map((entry, index) => (
                          <motion.div
                            key={entry.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600/60 transition-all duration-300"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-200">
                                {entry.description || entry.action_type}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(entry.earned_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-lg">
                                {entry.action_type}
                              </Badge>
                              <Badge className="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 text-white border-0 shadow-lg">
                                +{entry.points} pts
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="text-center py-8 text-slate-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Brain className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                        <p>Nenhuma atividade recente encontrada.</p>
                        <p className="text-sm mt-1">Comece a aprender para ver suas conquistas!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Achievements - Design Dark Theme Premium */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl h-fit">
              <CardHeader className="pb-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Crown className="h-5 w-5 text-orange-400" />
                    Conquistas
                  </CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <StudentAchievements 
                  coursesInProgress={coursesInProgress} 
                  completedCourses={completedCourses} 
                  totalPoints={totalPoints} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Motivational Section - Design Dark Theme Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
            <CardContent className="relative p-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="p-4 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 shadow-2xl">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-2">
                    Continue sua jornada de sucesso!
                  </h3>
                  <p className="text-slate-300 max-w-md">
                    Cada curso concluído é um passo em direção ao seu crescimento profissional. 
                    Mantenha o foco e alcance seus objetivos!
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300"
                    asChild
                  >
                    <Link to="/student/courses">
                      <Play className="h-4 w-4 mr-2" />
                      Continuar Aprendendo
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default StudentDashboard;