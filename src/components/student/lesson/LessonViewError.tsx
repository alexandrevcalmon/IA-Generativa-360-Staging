
import { PageLayout } from '@/components/PageLayout';

interface LessonViewErrorProps {
  error: Error;
  course?: any;
}

export const LessonViewError = ({ error, course }: LessonViewErrorProps) => {
  return (
    <PageLayout
      title={!course ? 'Conteúdo não encontrado' : 'Erro ao carregar'}
      subtitle={!course ? 'Curso não encontrado' : error.message}
      background="dark"
    >
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center px-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white">
            {!course ? 'Conteúdo não encontrado' : 'Erro ao carregar'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            {!course ? 'Curso não encontrado' : error.message}
          </p>
        </div>
      </div>
    </PageLayout>
  );
};
