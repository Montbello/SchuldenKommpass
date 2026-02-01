import { useState, useRef, useCallback } from 'react';

interface DocumentUploadProps {
  onUpload: (file: File, category: string) => Promise<void>;
  category: string;
  categoryLabel: string;
  accepted?: string;
  maxSizeMB?: number;
  existingDocument?: { document_id: string; uploaded_at: string } | null;
}

const MAX_FILE_SIZE_DEFAULT = 5 * 1024 * 1024; // 5MB
const ACCEPTED_DEFAULT = '.pdf,.jpg,.jpeg,.png';

export default function DocumentUpload({
  onUpload,
  category,
  categoryLabel,
  accepted = ACCEPTED_DEFAULT,
  maxSizeMB = 5,
  existingDocument,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(
    existingDocument ? `Hochgeladen am ${new Date(existingDocument.uploaded_at).toLocaleDateString('de-DE')}` : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    const allowedTypes = accepted.split(',').map(t => t.trim().replace('.', ''));
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return `Nur ${accepted} Dateien sind erlaubt.`;
    }
    
    if (file.size > maxSize) {
      return `Datei darf maximal ${maxSizeMB}MB groß sein.`;
    }
    
    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      await onUpload(file, category);
      setUploadedFile(file.name);
    } catch (err: any) {
      setError(err.message || 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="document-upload">
      <label className="upload-label">{categoryLabel}</label>
      
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'uploaded' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accepted}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-status">
            <span className="spinner">⏳</span>
            <span>Wird hochgeladen...</span>
          </div>
        ) : uploadedFile ? (
          <div className="upload-status success">
            <span>✅</span>
            <span>{uploadedFile}</span>
            <button 
              type="button" 
              className="btn-change"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
                fileInputRef.current?.click();
              }}
            >
              Ändern
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <span className="upload-icon">📄</span>
            <p>Datei hier ablegen oder klicken</p>
            <small>PDF, JPG oder PNG (max. {maxSizeMB}MB)</small>
          </div>
        )}
      </div>
      
      {error && <p className="upload-error">{error}</p>}
      
      <style>{`
        .document-upload {
          margin-bottom: 1.5rem;
        }
        .upload-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        .upload-dropzone {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f9fafb;
        }
        .upload-dropzone:hover {
          border-color: #6366f1;
          background: #f5f3ff;
        }
        .upload-dropzone.dragging {
          border-color: #6366f1;
          background: #eef2ff;
        }
        .upload-dropzone.uploaded {
          border-color: #10b981;
          background: #ecfdf5;
        }
        .upload-dropzone.uploading {
          opacity: 0.7;
          cursor: wait;
        }
        .upload-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .upload-prompt p {
          margin: 0.5rem 0;
          color: #4b5563;
        }
        .upload-prompt small {
          color: #9ca3af;
        }
        .upload-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .upload-status.success {
          color: #059669;
        }
        .btn-change {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          background: #e5e7eb;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-change:hover {
          background: #d1d5db;
        }
        .upload-error {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
