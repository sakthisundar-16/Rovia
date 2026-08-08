import React, { useState } from 'react';
import { Upload, X, FileCheck } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  onFileSelect?: (file: File) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Photo / Document',
  onFileSelect,
  accept = 'image/*',
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
      if (onFileSelect) onFileSelect(file);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {label && <label className="text-xs font-semibold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">{label}</label>}
      {preview ? (
        <div className="relative rounded-xl overflow-hidden glass-panel border border-[#988686]/40 p-2 flex items-center gap-3">
          <img src={preview} alt="Upload preview" className="w-16 h-16 object-cover rounded-lg" />
          <div className="flex-1 truncate">
            <p className="text-xs font-semibold truncate text-[#000000] dark:text-white">{fileName}</p>
            <span className="text-[10px] text-[#5E7A63] flex items-center gap-1 mt-1">
              <FileCheck className="w-3 h-3" /> Ready for inspection attachment
            </span>
          </div>
          <button
            onClick={clearFile}
            className="p-1 rounded-full text-[#988686] hover:bg-[#988686]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D1D0D0] dark:border-[#5C4E4E] rounded-xl cursor-pointer hover:border-[#988686] transition-colors glass-panel">
          <Upload className="w-6 h-6 text-[#988686] mb-2" />
          <span className="text-xs font-semibold text-[#000000] dark:text-[#F5F3F3]">Click to upload or drag & drop</span>
          <span className="text-[10px] text-[#988686] mt-1">PNG, JPG, WEBP up to 10MB</span>
          <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </label>
      )}
    </div>
  );
};
