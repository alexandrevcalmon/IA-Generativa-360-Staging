import { useEffect, useState } from 'react';
import { useBunnyVideoUpload } from './useBunnyVideoUpload';

export const useBunnyVideoStatus = (
  videoId: string | null,
  libraryId: string | null,
  autoCheck: boolean = true
) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'ready' | 'error'>('pending');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { checkVideoStatus } = useBunnyVideoUpload();

  const checkStatus = async () => {
    if (!videoId || !libraryId) return;

    setIsChecking(true);
    try {
      const result = await checkVideoStatus(videoId, libraryId);
      if (result) {
        setStatus(result.status as any);
        if (result.embedUrl) {
          setEmbedUrl(result.embedUrl);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus('error');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!videoId || !libraryId) return;

    // Verificar status inicialmente
    checkStatus();

    // Se autoCheck estiver ativado, verificar periodicamente se ainda processando
    if (autoCheck) {
      const interval = setInterval(() => {
        if (status === 'pending' || status === 'processing') {
          checkStatus();
        }
      }, 10000); // 10 segundos

      return () => clearInterval(interval);
    }
  }, [videoId, libraryId, autoCheck, status]);

  return {
    status,
    embedUrl,
    isChecking,
    checkStatus,
  };
}; 
