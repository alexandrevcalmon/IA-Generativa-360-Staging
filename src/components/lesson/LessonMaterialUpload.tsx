
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface LessonMaterialUploadProps {
  lessonId: string;
  onUploadComplete?: () => void;
}

export const LessonMaterialUpload = ({ lessonId, onUploadComplete }: LessonMaterialUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { uploadFile } = useFileUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain'
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length !== files.length) {
      toast.error('Alguns arquivos foram removidos. Apenas PDF, Word, Excel, CSV e TXT até 10MB são aceitos.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        // Upload file to storage
        const uploadedUrl = await uploadFile(file, {
          bucket: 'lesson-materials',
          maxSize: 10 * 1024 * 1024,
          allowedTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'text/plain'
          ],
        });

        // Save material info to database
        const { error } = await supabase
          .from('lesson_materials')
          .insert({
            lesson_id: lessonId,
            file_name: file.name,
            file_url: uploadedUrl,
            file_type: file.type,
            file_size_bytes: file.size,
            uploaded_by: user.id
          });

        if (error) {
          console.error('Error saving material:', error);
          toast.error(`Erro ao salvar ${file.name}`);
        } else {
          toast.success(`${file.name} enviado com sucesso!`);
        }
      }

      // Clear selected files
      setSelectedFiles([]);
      
      // Refresh materials list
      queryClient.invalidateQueries({ queryKey: ['lesson-materials', lessonId] });
      
      // Call completion callback
      onUploadComplete?.();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro durante o upload dos arquivos');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="w-full border-slate-700/50 bg-slate-900/20 shadow-lg">
      <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
          Adicionar Materiais de Apoio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div>
          <Input
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.csv,.txt"
            onChange={handleFileSelect}
            className="cursor-pointer border-slate-600 bg-slate-800/50 text-slate-300 text-xs sm:text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">
            Aceita: PDF, Word, Excel, CSV, TXT (máx. 10MB cada)
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-white">Arquivos Selecionados:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 sm:h-12"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar {selectedFiles.length} arquivo(s)
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs sm:text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3 rounded">
          <span className="hidden sm:inline">💡 <strong>Dica:</strong> Materiais de apoio melhoram significativamente a capacidade do assistente IA de responder suas perguntas com informações específicas e detalhadas sobre o conteúdo da lição.</span>
          <span className="sm:hidden">💡 <strong>Dica:</strong> Materiais de apoio melhoram as respostas do assistente IA.</span>
        </div>
      </CardContent>
    </Card>
  );
};
