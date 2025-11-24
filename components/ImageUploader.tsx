import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon, TrashIcon } from './icons';
import { fileToImageFile } from '../utils/fileUtils';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  title: string;
  labels: {
    clickToChange: string;
    clickOrDrag: string;
  };
  onImageUpload: (image: ImageFile) => void;
  onRemove?: () => void;
  className?: string;
  // Optional: pass the current image data to keep internal state in sync if managed externally,
  // though for now we are managing preview internally. If onRemove is called, we should clear preview.
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, labels, onImageUpload, onRemove, className = '' }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow clearing from parent if needed (e.g. if the parent state is cleared)
  // But strictly, we'll just handle the local remove action.

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      try {
        const imageFile = await fileToImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        onImageUpload(imageFile);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  }, [onImageUpload]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
        onRemove();
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const onAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={onAreaClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`relative group flex flex-col items-center justify-center bg-slate-800/50 rounded-xl border-2 border-dashed p-3 min-h-[140px] cursor-pointer transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-slate-800' : 'border-slate-700 hover:border-cyan-500'} ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files)}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {imagePreview ? (
        <>
          <div className="absolute inset-0 p-2">
             <img src={imagePreview} alt={title} className="w-full h-full object-cover rounded-lg" />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-10">
              <p className="text-white text-xs font-semibold mb-2">{labels.clickToChange}</p>
              
              {onRemove && (
                <button 
                  onClick={handleRemove}
                  className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110"
                  title="Remove image"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
          </div>
        </>
      ) : (
        <div className="text-center text-slate-400 p-2">
          <UploadIcon className="w-8 h-8 mx-auto mb-2 text-slate-500 group-hover:text-cyan-500 transition-colors" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-300 uppercase">{title}</h3>
          <p className="text-[10px] sm:text-xs mt-1 text-slate-500">{labels.clickOrDrag}</p>
        </div>
      )}
    </div>
  );
};