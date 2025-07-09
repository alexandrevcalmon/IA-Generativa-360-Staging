
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth';
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4" />
          Adicionar Materiais de Apoio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.csv,.txt"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Aceita: PDF, Word, Excel, CSV, TXT (máx. 10MB cada)
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Arquivos Selecionados:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
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

        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          💡 <strong>Dica:</strong> Materiais de apoio melhoram significativamente a capacidade do assistente IA de responder suas perguntas com informações específicas e detalhadas sobre o conteúdo da lição.
        </div>
      </CardContent>
    </Card>
  );
};
