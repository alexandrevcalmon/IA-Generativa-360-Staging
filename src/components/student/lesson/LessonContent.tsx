
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download } from 'lucide-react';
import { StudentLesson } from '@/hooks/useStudentCourses';
import { LessonMaterialUpload } from '@/components/lesson/LessonMaterialUpload';
import { useAuth } from '@/hooks/auth/useAuth';

interface LessonContentProps {
  currentLesson: StudentLesson;
  currentModule?: { title: string } | null;
}

export const LessonContent = ({ currentLesson, currentModule }: LessonContentProps) => {
  const { user } = useAuth();
  
  const handleDownloadClick = () => {
    console.log('Download material clicked');
  };

  // Check if user can upload materials (company owners and producers)
  const canUploadMaterials = user?.user_metadata?.role === 'company' || user?.user_metadata?.role === 'producer';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Lesson Content */}
      <Card className="w-full border-slate-700/50 bg-slate-900/20 shadow-lg">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 bg-slate-900/20 text-white rounded-t-lg border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Conteúdo da Lição
          </CardTitle>
          {currentModule && (
            <div className="text-xs sm:text-sm text-slate-300 mt-1">
              Módulo: {currentModule.title}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
          <div className="prose prose-sm sm:prose lg:prose-base max-w-none text-slate-300 prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-emerald-400">
            {currentLesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            ) : (
              <p className="text-slate-400 text-sm sm:text-base">Nenhum conteúdo adicional disponível.</p>
            )}
          </div>
          
          {/* Legacy Material URL Support */}
          {currentLesson.material_url && (
            <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 lg:pt-6 border-t border-slate-700/50">
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-white">Material de Apoio</h3>
              <Button 
                asChild 
                variant="outline" 
                className="w-full sm:w-auto h-12 sm:h-14 touch-manipulation font-medium border-2 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 text-slate-300 bg-transparent"
                onClick={handleDownloadClick}
              >
                <a href={currentLesson.material_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download do Material
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Material Upload Section - Only for authorized users */}
      {canUploadMaterials && (
        <LessonMaterialUpload 
          lessonId={currentLesson.id}
          onUploadComplete={() => {
            // Optionally refresh materials or show success message
            console.log('Materials uploaded successfully');
          }}
        />
      )}
    </div>
  );
};
