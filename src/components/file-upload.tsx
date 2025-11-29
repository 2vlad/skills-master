'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function FileUpload({ onFileSelect, selectedFile, disabled }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Файл должен быть в формате CSV');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Файл слишком большой (максимум 5 МБ)');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 bg-[#f5f5f7] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-[#1d1d1f]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1d1d1f] truncate">{selectedFile.name}</p>
            <p className="text-xs text-[#86868b]">
              {(selectedFile.size / 1024).toFixed(1)} КБ
            </p>
          </div>
          {!disabled && (
            <button
              onClick={handleRemove}
              className="w-8 h-8 rounded-full hover:bg-[#e8e8ed] flex items-center justify-center transition-colors"
              aria-label="Удалить файл"
            >
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={`
            flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all duration-200
            ${dragOver 
              ? 'bg-[#f0f0f5] ring-2 ring-[#0071e3] ring-offset-2' 
              : 'bg-[#f5f5f7] hover:bg-[#f0f0f5]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
            <Upload className="w-5 h-5 text-[#86868b]" />
          </div>
          <p className="text-sm text-[#1d1d1f] text-center font-medium">
            Выберите CSV файл
          </p>
          <p className="text-xs text-[#86868b] mt-1">или перетащите сюда</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-[#ff3b30]">{error}</p>
      )}
    </div>
  );
}
