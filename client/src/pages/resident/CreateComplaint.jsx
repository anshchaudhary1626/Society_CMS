import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ImageUploader from '../../components/common/ImageUploader';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CreateComplaint = () => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (description.length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      const res = await api.post('/complaints', {
        category,
        description,
        images,
      });

      if (res.data.status === 'success') {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">File a Complaint</h1>
        <p className="text-sm text-slate-400 font-medium">Describe your issue in detail. We will auto-route it to an available specialist.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700">
            Complaint Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-slate-700 focus:border-violet-500 focus:ring-violet-500 sm:text-sm focus:outline-none"
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
            Description of the Issue
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-slate-700 placeholder-slate-400 focus:border-violet-500 focus:ring-violet-500 sm:text-sm focus:outline-none"
            placeholder="Please write at least 10 characters detailing the problem..."
            required
          />
        </div>

        {/* Image Uploader */}
        <ImageUploader label="Attachments (Proof of problem - Max 2)" value={images} onChange={setImages} maxFiles={2} />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 shadow-md hover:shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? <LoadingSpinner size="sm" /> : 'File Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;
