
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-white">
            {!course ? 'Conteúdo não encontrado' : 'Erro ao carregar'}
          </h2>
          <p className="text-slate-300">
            {!course ? 'Curso não encontrado' : error.message}
          </p>
        </div>
      </div>
    </PageLayout>
  );
};
