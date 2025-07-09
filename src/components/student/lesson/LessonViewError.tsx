
interface LessonViewErrorProps {
  error: Error;
  course?: any;
}

export const LessonViewError = ({ error, course }: LessonViewErrorProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {!course ? 'Conteúdo não encontrado' : 'Erro ao carregar'}
          </h2>
          <p className="text-gray-600">
            {!course ? 'Curso não encontrado' : error.message}
          </p>
        </div>
      </div>
    </div>
  );
};
