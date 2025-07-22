
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, File } from 'lucide-react';
import { useLessonMaterials } from '@/hooks/useLessonMaterials';

interface LessonMaterialsSectionProps {
  lessonId: string;
}

export const LessonMaterialsSection = ({ lessonId }: LessonMaterialsSectionProps) => {
  const { data: materials = [], isLoading } = useLessonMaterials(lessonId);

  if (isLoading) {
    return (
      <Card className="w-full border-slate-700/50 bg-slate-900/20 shadow-lg">
        <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Materiais de Apoio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (materials.length === 0) {
    return (
      <Card className="w-full border-slate-700/50 bg-slate-900/20 shadow-lg">
        <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Materiais de Apoio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-300">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p className="text-sm">Nenhum material de apoio disponível para esta lição</p>
            <p className="text-xs mt-2 text-slate-400">
              Materiais de apoio ajudam o assistente IA a fornecer respostas mais detalhadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (fileType.includes('doc')) return <FileText className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="w-full border-slate-700/50 bg-slate-900/20 shadow-lg">
      <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          Materiais de Apoio ({materials.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {materials.map((material) => (
          <div
            key={material.id}
            className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors bg-slate-900/10"
          >
            <div className="flex items-center gap-3 flex-1">
              {getFileIcon(material.file_type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-white">{material.file_name}</p>
                <p className="text-xs text-slate-400">
                  {material.file_type} {material.file_size_bytes && `• ${formatFileSize(material.file_size_bytes)}`}
                </p>
                {material.extracted_content ? (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ Conteúdo disponível para IA
                  </p>
                ) : (
                  <p className="text-xs text-amber-400 mt-1">
                    ⏳ Processando conteúdo para IA...
                  </p>
                )}
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-shrink-0 border-slate-600 text-slate-300 hover:bg-slate-800/50 bg-transparent"
            >
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
        
        <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span>🤖</span>
            <strong>Assistente IA Melhorado</strong>
          </div>
          <p>Estes materiais estão disponíveis para o assistente IA fornecer respostas mais precisas e detalhadas sobre o conteúdo da lição.</p>
        </div>
      </CardContent>
    </Card>
  );
};
