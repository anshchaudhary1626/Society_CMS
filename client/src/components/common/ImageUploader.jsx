import React, { useState } from 'react';
import { BiCloudUpload, BiTrash } from 'react-icons/bi';
import api from '../../services/api';
import LoadingSpinner from './LoadingSpinner';

const ImageUploader = ({ label = 'Upload Image', value = '', onChange, maxFiles = 1 }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previews, setPreviews] = useState(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError(null);
    setUploading(true);

    try {
      // 1. Get ImageKit auth parameters from our backend
      const authRes = await api.get('/imagekit/auth');
      const { signature, expire, token } = authRes.data.data || authRes.data;

      const uploadedUrls = [...previews];

      for (const file of files) {
        if (uploadedUrls.length >= maxFiles) {
          setError(`You can only upload a maximum of ${maxFiles} image(s).`);
          break;
        }

        // Validate image type and size (max 5MB)
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed.');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB.');
          continue;
        }

        // 2. Prepare FormData for direct ImageKit upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_/9a5IvnK4X1YqKV71b0ORPRAgkg=');
        formData.append('signature', signature);
        formData.append('expire', expire);
        formData.append('token', token);
        formData.append('folder', '/scms');

        // 3. Post file buffer directly to ImageKit CDN upload endpoint
        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadRes.ok) {
          uploadedUrls.push(uploadData.url);
        } else {
          throw new Error(uploadData.message || 'Image upload rejected by CDN.');
        }
      }

      setPreviews(uploadedUrls);
      onChange(maxFiles === 1 ? uploadedUrls[0] || '' : uploadedUrls);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange(maxFiles === 1 ? '' : updated);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-4">
        {previews.map((url, idx) => (
          <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner group">
            <img src={url} alt="Upload preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl focus:outline-none"
            >
              <BiTrash size={20} />
            </button>
          </div>
        ))}

        {previews.length < maxFiles && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all focus-within:ring-2 focus-within:ring-violet-500">
            {uploading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <BiCloudUpload className="h-6 w-6 text-slate-400" />
                <span className="mt-1 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Upload</span>
              </>
            )}
            <input
              type="file"
              multiple={maxFiles > 1}
              disabled={uploading}
              onChange={handleFileChange}
              className="sr-only"
              accept="image/*"
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUploader;
