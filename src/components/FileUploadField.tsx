
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, FileText, Video } from 'lucide-react';
import { useFileUpload, FileUploadOptions } from '@/hooks/useFileUpload';

interface FileUploadFieldProps {
  label: string;
  description?: string;
  value?: string;
  onChange: (url: string | null) => void;
  onFileUpload?: (file: File, url: string, storageFileId: string) => void;
  uploadOptions: FileUploadOptions;
  accept?: string;
  preview?: boolean;
  className?: string;
}

export const FileUploadField = ({
  label,
  description,
  value,
  onChange,
  onFileUpload,
  uploadOptions,
  accept,
  preview = false,
  className = "",
}: FileUploadFieldProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, deleteFile, isUploading } = useFileUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const result = await uploadFile(file, uploadOptions);
    if (result) {
      onChange(result.url);
      if (onFileUpload) {
        onFileUpload(file, result.url, result.storageFileId);
      }
    }
  };

  const handleRemove = async () => {
    if (value) {
      const success = await deleteFile(value, uploadOptions.bucket);
      if (success) {
        onChange(null);
      }
    }
  };

  const getFileIcon = () => {
    if (!value) return <Upload className="h-8 w-8" />;
    
    const extension = value.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-8 w-8" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <Video className="h-8 w-8" />;
    } else {
      return <FileText className="h-8 w-8" />;
    }
  };

  const getFileName = () => {
    if (!value) return '';
    const urlParts = value.split('/');
    return urlParts[urlParts.length - 1];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="file-upload">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${value ? 'bg-muted/50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!value ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            {getFileIcon()}
            <div className="text-center">
              <p className="text-sm font-medium">
                Arraste e solte um arquivo aqui ou
              </p>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                clique para selecionar
              </Button>
            </div>
            {accept && (
              <p className="text-xs text-muted-foreground">
                Tipos aceitos: {accept}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="text-sm font-medium">{getFileName()}</p>
                <p className="text-xs text-muted-foreground">Arquivo enviado</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <Input
          ref={inputRef}
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept={accept}
          disabled={isUploading}
        />
      </div>
      
      {isUploading && (
        <p className="text-sm text-muted-foreground">
          Enviando arquivo...
        </p>
      )}
    </div>
  );
};
