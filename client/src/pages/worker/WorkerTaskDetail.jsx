import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ImageUploader from '../../components/common/ImageUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiChevronLeft, BiUser, BiPhone, BiMessageSquareDetail, BiCheckDouble, BiPlayCircle } from 'react-icons/bi';

const WorkerTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resolution Form State
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionImage, setResolutionImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      if (res.data.status === 'success') {
        setComplaint(res.data.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleStartWork = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await api.patch(`/worker/complaints/${id}/start`);
      await fetchComplaint();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start work.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTask = async (e) => {
    e.preventDefault();
    if (resolutionNotes.length < 10) {
      setError('Resolution notes must be at least 10 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.patch(`/worker/complaints/${id}/resolve`, {
        resolutionNotes,
        resolutionImage,
      });
      await fetchComplaint();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold">
          <BiChevronLeft size={20} /> Back
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold transition-colors focus:outline-none">
        <BiChevronLeft size={22} /> Back to Job Sheets
      </button>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{complaint.category}</span>
                <h1 className="text-2xl font-extrabold text-slate-800 mt-1">{complaint.complaintId || 'COMP-NEW'}</h1>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem Details</h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Resident Attachments */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attachments Uploaded by Resident</h4>
                <div className="flex flex-wrap gap-4">
                  {complaint.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative h-28 w-28 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 hover:opacity-90 transition-opacity">
                      <img src={img} alt={`Problem attachment ${idx}`} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Sheets based on Status */}
          {(complaint.status?.toUpperCase() === 'ASSIGNED' || complaint.status?.toUpperCase() === 'REOPENED') && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-violet-900">Task Assigned to You</h3>
                <p className="text-sm text-slate-500 mt-1">Accept task to move status to In Progress and let the resident know you have started.</p>
              </div>
              <button
                onClick={handleStartWork}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-violet-500 shadow-md hover:shadow-violet-500/20 active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
              >
                <BiPlayCircle size={20} />
                Start Work
              </button>
            </div>
          )}

          {complaint.status?.toUpperCase() === 'IN_PROGRESS' && (
            <form onSubmit={handleResolveTask} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Resolve Complaint & Upload Proof</h3>
                <p className="text-xs text-slate-400 mt-1">Submit notes and a photo to mark this ticket resolved for the resident's verification.</p>
              </div>

              {/* Resolution Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">Resolution Description</label>
                <textarea
                  id="notes"
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-slate-700 focus:border-violet-500 focus:ring-violet-500 focus:outline-none sm:text-sm"
                  placeholder="Detail the work done to resolve this issue (e.g. replaced the brass valve joint)..."
                />
              </div>

              {/* Proof image */}
              <ImageUploader label="Resolution Proof Image (Required)" value={resolutionImage} onChange={setResolutionImage} maxFiles={1} />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !resolutionImage}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 shadow-md hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <BiCheckDouble size={22} />
                  Submit Resolution
                </button>
              </div>
            </form>
          )}

          {/* Already Resolved Screen */}
          {['RESOLVED', 'CLOSED'].includes(complaint.status?.toUpperCase()) && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Resolution Submitted</h3>
                <p className="text-xs text-slate-400 mt-1">Historical resolution documentation details.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Notes</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{complaint.resolutionNotes}</p>
              </div>
              {complaint.resolutionImage && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proof Image</h4>
                  <a href={complaint.resolutionImage} target="_blank" rel="noopener noreferrer" className="inline-block relative h-36 w-36 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 hover:opacity-90 transition-opacity">
                    <img src={complaint.resolutionImage} alt="Resolution proof attachment" className="h-full w-full object-cover" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resident details and reopen reasons sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">Resident Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-50 p-2 text-violet-600">
                  <BiUser size={20} />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 text-sm leading-tight">{complaint.resident?.name}</h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flat {complaint.resident?.flatNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                <BiPhone size={16} className="text-slate-400" />
                <span>{complaint.resident?.phone || 'No phone record'}</span>
              </div>
            </div>
          </div>

          {/* Reopen history banner */}
          {complaint.status?.toUpperCase() === 'REOPENED' && complaint.reopenReason && (
            <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-red-800">
                <BiMessageSquareDetail size={20} className="text-red-500" />
                <h4 className="text-sm font-bold">Reopen Reason</h4>
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed whitespace-pre-wrap">"{complaint.reopenReason}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerTaskDetail;
