'use client';

import { Download } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import type { SkillsJson } from '@/types/skills';

interface DownloadButtonProps {
  data: SkillsJson;
  disabled?: boolean;
}

export function DownloadButton({ data, disabled }: DownloadButtonProps) {
  const handleDownload = () => {
    const timestamp = formatTimestamp(new Date());
    const filename = `skills_${data.meta.profileId}_${timestamp}.json`;
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-black hover:bg-gray-800 text-white shadow-sm hover:shadow-md'
        }
      `}
    >
      <Download className="w-4 h-4" />
      Скачать JSON
    </button>
  );
}
