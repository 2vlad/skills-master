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
    <div className="space-y-2">
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-black" />
            <div>
              <p className="text-sm font-medium text-black">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} КБ
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Удалить файл"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={`
            flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${dragOver ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            <span className="text-black font-medium">Выберите файл</span> или перетащите сюда
          </p>
          <p className="text-xs text-gray-400 mt-1">CSV файл, до 5 МБ</p>
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
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Формат: первая колонка — текст скилла, вторая — отметка X
      </p>
    </div>
  );
}
