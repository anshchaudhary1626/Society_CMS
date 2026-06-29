import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const WorkerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get('/worker/reviews');
        if (res.data.status === 'success') {
          setReviews(res.data.data.reviews || res.data.reviews || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Reviews & Ratings</h1>
        <p className="text-sm text-slate-400 font-medium">Feedback from residents on resolved complaint tickets.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {reviews.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-slate-400 font-semibold text-lg">No reviews yet</p>
          <p className="text-xs text-slate-400 mt-1">Reviews will appear once residents close resolved tickets and submit feedback.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{review.resident?.name || 'Resident'}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    Ticket: {review.complaint?.complaintId || 'COMP-ID'} — Category: {review.complaint?.category}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-2">
                <StarRating rating={review.rating} readOnly size={18} />
                {review.comment && (
                  <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                    "{review.comment}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerReviews;
