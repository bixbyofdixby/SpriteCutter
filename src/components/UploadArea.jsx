import { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function UploadArea({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      } else {
        alert("Please upload a valid image file (PNG, JPEG, etc).");
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '2rem'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--border-color)'}`,
          backgroundColor: isDragging ? '#eff6ff' : 'var(--panel-bg)',
          borderRadius: '12px',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ padding: '1rem', backgroundColor: 'var(--canvas-bg)', borderRadius: '50%' }}>
           <ImageIcon size={48} color="var(--primary-color)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>Upload Spritesheet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Drag and drop your image here, or click to browse.</p>
        </div>
        
        <label className="btn btn-primary" style={{ marginTop: '1rem', cursor: 'pointer' }}>
          <Upload size={16} /> Select File
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/gif, image/webp" 
            style={{ display: 'none' }} 
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
}
