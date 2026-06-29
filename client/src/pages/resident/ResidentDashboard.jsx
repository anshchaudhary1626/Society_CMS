import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiPlusCircle, BiListOl, BiTimeFive, BiCheckDouble, BiWrench } from 'react-icons/bi';

const ResidentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/complaints/my');
        if (res.data.status === 'success') {
          // res.data.data.complaints
          setComplaints(res.data.data.complaints || res.data.complaints || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute status aggregates
  const total = complaints.length;
  const pending = complaints.filter(c => c.status?.toUpperCase() === 'PENDING').length;
  const active = complaints.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status?.toUpperCase())).length;
  const resolved = complaints.filter(c => c.status?.toUpperCase() === 'RESOLVED').length;
  const closed = complaints.filter(c => c.status?.toUpperCase() === 'CLOSED').length;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Dashboard</h1>
          <p className="text-sm text-slate-400 font-medium">Track your tickets and report new society issues.</p>
        </div>
        <Link
          to="/resident/complaints/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500 shadow-md hover:shadow-violet-500/20 transition-all active:scale-95"
        >
          <BiPlusCircle size={20} />
          File New Complaint
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Tickets" value={total} icon={BiListOl} color="violet" onClick={() => navigate('/resident/complaints')} />
        <StatCard title="Pending" value={pending} icon={BiTimeFive} color="amber" onClick={() => navigate('/resident/complaints?status=PENDING')} />
        <StatCard title="Active Work" value={active} icon={BiWrench} color="blue" onClick={() => navigate('/resident/complaints')} />
        <StatCard title="Resolved" value={resolved} icon={BiCheckDouble} color="teal" onClick={() => navigate('/resident/complaints')} />
        <StatCard title="Closed Tickets" value={closed} icon={BiCheckDouble} color="emerald" onClick={() => navigate('/resident/complaints')} />
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Complaints</h2>
          <Link to="/resident/complaints" className="text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors">
            View All
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 font-semibold">You have not submitted any complaints yet.</p>
            <p className="text-xs text-slate-400 mt-1">Submit your first complaint to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Ticket ID</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Submitted</th>
                  <th className="pb-3 pr-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-600 font-medium">
                {complaints.slice(0, 5).map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/resident/complaints/${ticket._id}`)}
                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 pl-2 font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                      {ticket.complaintId || 'COMP-NEW'}
                    </td>
                    <td className="py-4 capitalize">{ticket.category}</td>
                    <td className="py-4 max-w-xs truncate">{ticket.description}</td>
                    <td className="py-4">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 pr-2 text-right">
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboard;
