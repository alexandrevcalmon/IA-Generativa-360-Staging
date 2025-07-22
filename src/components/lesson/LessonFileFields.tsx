
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadField } from '@/components/FileUploadField';
import { BunnyVideoUploadField } from '@/components/BunnyVideoUploadField';
import { BunnyVideoIdField } from '@/components/BunnyVideoIdField';
import { BunnyVideoInfo } from '@/hooks/useBunnyVideoGet';
import { useFormContext } from 'react-hook-form';
import { LessonFormData } from './types';

export const LessonFileFields: React.FC = () => {
  const { setValue, watch } = useFormContext<LessonFormData>();
  const bunnyLibraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;

  // Observar mudanças nos campos do Bunny.net
  const bunnyVideoId = watch('bunny_video_id');
  const bunnyLibraryIdWatch = watch('bunny_library_id');
  const bunnyEmbedUrl = watch('bunny_embed_url');

  // Função para atualizar a duração automaticamente
  const updateDurationFromBunny = (durationInSeconds: number) => {
    if (durationInSeconds > 0) {
      const durationInMinutes = durationInSeconds / 60;
      setValue('duration_minutes', Math.round(durationInMinutes * 100) / 100); // Arredondar para 2 casas decimais
    }
  };

  // Função para lidar com mudanças no upload do Bunny.net
  const handleBunnyVideoUpload = (videoId: string | null, embedUrl: string | null) => {
    setValue('bunny_video_id', videoId || '');
    setValue('bunny_embed_url', embedUrl || '');
    setValue('bunny_library_id', bunnyLibraryId ? parseInt(bunnyLibraryId) : undefined);
    setValue('bunny_video_status', 'pending');
  };

  // Função para lidar com busca por ID do Bunny.net
  const handleBunnyVideoSearch = (videoInfo: BunnyVideoInfo | null) => {
    if (videoInfo) {
      setValue('bunny_video_id', videoInfo.videoId || '');
      setValue('bunny_embed_url', videoInfo.embedUrl || '');
      setValue('bunny_library_id', videoInfo.libraryId || undefined);
      setValue('bunny_video_status', videoInfo.status || 'pending');
      
      // Atualizar duração automaticamente se disponível
      if (videoInfo.duration) {
        updateDurationFromBunny(videoInfo.duration);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arquivos da Aula</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bunny-upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-600">
            <TabsTrigger 
              value="bunny-upload" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Upload Bunny.net
            </TabsTrigger>
            <TabsTrigger 
              value="bunny-search" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Buscar por ID
            </TabsTrigger>
            <TabsTrigger 
              value="supabase" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Supabase Storage
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bunny-upload" className="mt-4">
            <BunnyVideoUploadField 
              onChange={handleBunnyVideoUpload}
              onVideoInfoReceived={updateDurationFromBunny}
            />
          </TabsContent>
          
          <TabsContent value="bunny-search" className="mt-4">
            <BunnyVideoIdField 
              onChange={handleBunnyVideoSearch}
              onVideoInfoReceived={updateDurationFromBunny}
              libraryId={bunnyLibraryId}
            />
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Vídeo da Aula (Supabase Storage)</h4>
              <FileUploadField
                label="Vídeo da Aula"
                description="Formatos aceitos: MP4, WebM, OGG, AVI, MOV. Tamanho máximo: 512MB"
                value={watch('video_file_url')}
                onChange={(url) => setValue('video_file_url', url)}
                uploadOptions={{
                  bucket: 'lesson-videos',
                  maxSize: 512 * 1024 * 1024, // 512MB
                  allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
                }}
                accept="video/*"
                preview={true}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Material de Apoio</h4>
          <FileUploadField
            label="Material de Apoio"
            description="Formatos aceitos: PDF, DOC, PPT, XLS, TXT, ZIP, RAR. Tamanho máximo: 50MB"
            value={watch('material_file_url')}
            onChange={(url) => setValue('material_file_url', url)}
            uploadOptions={{
              bucket: 'lesson-materials',
              maxSize: 50 * 1024 * 1024, // 50MB
              allowedTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
              ],
            }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
            preview={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};
