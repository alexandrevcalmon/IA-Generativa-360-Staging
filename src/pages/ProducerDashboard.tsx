
import { useCourses } from "@/hooks/useCourses";
import { ProducerStatsGrid } from "@/components/producer/ProducerStatsGrid";
import { ProducerCoursesSection } from "@/components/producer/ProducerCoursesSection";
import { ProducerAnalyticsSection } from "@/components/producer/ProducerAnalyticsSection";
import { ProducerQuickActions } from "@/components/producer/ProducerQuickActions";
import { ProducerRecentActivity } from "@/components/producer/ProducerRecentActivity";
import { ProducerPerformanceSummary } from "@/components/producer/ProducerPerformanceSummary";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";

const ProducerDashboard = () => {
  const { data: courses = [], isLoading } = useCourses();

  // Calculate real statistics from actual data
  const publishedCourses = courses.filter(course => course.is_published);
  const totalCourses = courses.length;

  return (
    <div className="flex flex-col h-full">
      <StudentPageHeader
        title="Painel do Produtor"
        subtitle="Bem-vindo de volta! Gerencie seus cursos e empresas clientes."
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Stats Grid */}
          <ProducerStatsGrid 
            totalCourses={totalCourses}
            publishedCourses={publishedCourses.length}
          />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              <ProducerCoursesSection 
                courses={courses}
                isLoading={isLoading}
              />
              <ProducerAnalyticsSection />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              <ProducerQuickActions />
              <ProducerRecentActivity />
              <ProducerPerformanceSummary publishedCourses={publishedCourses.length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
