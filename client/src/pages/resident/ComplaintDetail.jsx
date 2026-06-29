import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiChevronLeft, BiUser, BiPhone, BiMessageRounded, BiWrench, BiCheckCircle } from 'react-icons/bi';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reopen and Review Actions
  const [reopenMode, setReopenMode] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [closeMode, setCloseMode] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

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

  const handleCloseTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      // 1. Close ticket
      await api.patch(`/complaints/${id}/close`);
      
      // 2. Submit review rating if closing successfully
      await api.post(`/complaints/${id}/review`, {
        rating,
        comment: reviewComment,
      });

      setCloseMode(false);
      await fetchComplaint();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopenTicket = async (e) => {
    e.preventDefault();
    if (reopenReason.length < 5) {
      setError('Please provide a descriptive reopen reason (min 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.patch(`/complaints/${id}/reopen`, {
        reopenReason,
      });
      setReopenMode(false);
      setReopenReason('');
      await fetchComplaint();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reopen ticket.');
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
        <BiChevronLeft size={22} /> Back to List
      </button>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{complaint.category}</span>
                <h1 className="text-2xl font-extrabold text-slate-800 mt-1">{complaint.complaintId || 'COMP-NEW'}</h1>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Description</h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Resident Uploaded Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uploaded Images</h4>
                <div className="flex flex-wrap gap-4">
                  {complaint.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative h-32 w-32 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 hover:opacity-90 transition-opacity">
                      <img src={img} alt={`Complaint attach ${idx}`} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Sheets based on Status */}
          {complaint.status?.toUpperCase() === 'RESOLVED' && !reopenMode && !closeMode && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <BiCheckCircle size={24} className="text-emerald-500" />
                <h3 className="text-lg font-bold">Worker Marked as Resolved</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                The technician completed the job and uploaded proof. Please review the resolution details on the right side and choose to close or reopen this ticket.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCloseMode(true)}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-sm"
                >
                  Accept & Close Ticket
                </button>
                <button
                  onClick={() => setReopenMode(true)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Reopen Issue
                </button>
              </div>
            </div>
          )}

          {/* Close Form (Leave Review) */}
          {closeMode && (
            <form onSubmit={handleCloseTicket} className="rounded-2xl border border-violet-100 bg-violet-50/20 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Close Ticket & Review Service</h3>
                <p className="text-xs text-slate-400 mt-1">Submit feedback to close this ticket and rate your agent.</p>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Rate Technician Service</label>
                <StarRating rating={rating} onChange={setRating} size={32} />
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-semibold text-slate-700">Review Comments (Optional)</label>
                <textarea
                  id="comment"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-4 text-slate-700 focus:border-violet-500 focus:ring-violet-500 focus:outline-none sm:text-sm"
                  placeholder="Tell us what you liked or how we can improve..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseMode(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit & Close'}
                </button>
              </div>
            </form>
          )}

          {/* Reopen Form */}
          {reopenMode && (
            <form onSubmit={handleReopenTicket} className="rounded-2xl border border-red-100 bg-red-50/20 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reopen Complaint Ticket</h3>
                <p className="text-xs text-slate-400 mt-1">State clearly why the current resolution was not satisfactory.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="reopenReason" className="block text-sm font-semibold text-slate-700">Reason for Reopening</label>
                <textarea
                  id="reopenReason"
                  rows={3}
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-slate-700 focus:border-violet-500 focus:ring-violet-500 focus:outline-none sm:text-sm"
                  placeholder="Explain why the problem remains unresolved (e.g. pipe still dripping)..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReopenMode(false);
                    setReopenReason('');
                  }}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Assigned Technician & Progress Status Sidebar */}
        <div className="space-y-6">
          {/* Assigned Worker Info */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">Assigned Agent</h3>
            {!complaint.assignedWorker ? (
              <div className="text-center py-4">
                <BiWrench className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 mt-2 font-semibold">Awaiting worker assignment</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-violet-50 p-2 text-violet-600">
                    <BiUser size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm leading-tight">{complaint.assignedWorker.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider capitalize">{complaint.assignedWorker.specialization?.join(', ') || 'Technician'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <BiPhone size={16} className="text-slate-400" />
                  <span>{complaint.assignedWorker.phone || 'No phone record'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Details Sidebar Panel */}
          {complaint.resolutionNotes && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">Resolution Proof</h3>
              <div className="space-y-3">
                <p className="text-slate-600 text-xs italic leading-relaxed whitespace-pre-wrap">"{complaint.resolutionNotes}"</p>
                {complaint.resolutionImage && (
                  <a href={complaint.resolutionImage} target="_blank" rel="noopener noreferrer" className="block relative h-28 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 hover:opacity-90 transition-opacity">
                    <img src={complaint.resolutionImage} alt="Resolution proof attachment" className="h-full w-full object-cover" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Reopen Reason Sidebar Panel */}
          {complaint.reopenReason && (
            <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider border-b border-red-100/50 pb-2">Reopen Reason</h3>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed whitespace-pre-wrap">"{complaint.reopenReason}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
