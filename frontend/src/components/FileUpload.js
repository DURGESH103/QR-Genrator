import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';

const FileUpload = ({
  onFile,
  onClear,
  onError = (message) => alert(message),
  file,
  preview,
  accept = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
  maxSize = 5 * 1024 * 1024,
  label = 'Drag & drop an image, or click to select',
  hint = 'JPG, PNG, WebP up to 5MB'
}) => {
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') onError(`File is too large. Max ${Math.round(maxSize / 1024 / 1024)}MB.`);
      else if (err.code === 'file-invalid-type') onError('Invalid file type. Only JPG, PNG, WebP allowed.');
      else onError(err.message);
      return;
    }
    if (accepted[0]) onFile(accepted[0]);
  }, [onFile, onError, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1
  });

  if (file && preview) {
    return (
      <div className="relative border-2 border-primary-300 dark:border-primary-600 rounded-xl p-3 bg-primary-50 dark:bg-primary-900/20">
        <div className="flex items-center space-x-3">
          <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="flex-shrink-0 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-2">
        {isDragActive ? (
          <Image className="h-10 w-10 text-primary-500" />
        ) : (
          <Upload className="h-10 w-10 text-gray-400" />
        )}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragActive ? 'Drop it here!' : label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      </div>
    </div>
  );
};

export default FileUpload;
