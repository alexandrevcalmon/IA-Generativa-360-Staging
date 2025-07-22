
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
  uploadOptions,
  accept,
  preview = false,
  className = "",
}: FileUploadFieldProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, deleteFile, isUploading } = useFileUpload();

  const handleFileSelect = async (file: File) => {
    const url = await uploadFile(file, uploadOptions);
    if (url) {
      onChange(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteFile(value, uploadOptions.bucket);
      onChange(null);
    }
  };

  const getFileIcon = () => {
    if (uploadOptions.bucket === 'module-images' || uploadOptions.bucket === 'lesson-images') {
      return <Image className="h-8 w-8" />;
    } else if (uploadOptions.bucket === 'lesson-videos') {
      return <Video className="h-8 w-8" />;
    } else {
      return <FileText className="h-8 w-8" />;
    }
  };

  const isImage = uploadOptions.bucket.includes('images');
  const isVideo = uploadOptions.bucket === 'lesson-videos';

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-300">{label}</Label>
      {description && (
        <p className="text-sm text-gray-400 mt-1 mb-2">{description}</p>
      )}
      
      {!value ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-gray-400">
              {getFileIcon()}
            </div>
            <div className="text-sm text-gray-300">
              <p>Arraste e solte ou</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-2 !border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-700 !bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Selecionar arquivo'}
              </Button>
            </div>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {preview && isImage && (
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="w-full max-w-xs h-32 object-cover rounded border border-gray-600"
              />
            </div>
          )}
          {preview && isVideo && (
            <div className="relative">
              <video
                src={value}
                controls
                className="w-full max-w-xs h-32 rounded border border-gray-600"
              />
            </div>
          )}
          <div className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-600">
            <div className="text-gray-400">
              {getFileIcon()}
            </div>
            <span className="text-sm flex-1 truncate text-gray-300">
              {value.split('/').pop()?.split('?')[0]}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
