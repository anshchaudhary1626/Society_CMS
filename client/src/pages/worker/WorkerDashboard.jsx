import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { BiTimeFive, BiCheckCircle, BiWrench } from 'react-icons/bi';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/worker/complaints');
      if (res.data.status === 'success') {
        setComplaints(res.data.data.complaints || res.data.complaints || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (user) {
      setIsAvailable(user.isAvailable);
    }
  }, [user]);

  const handleToggleAvailability = async () => {
    try {
      setToggling(true);
      setError(null);
      const res = await api.patch('/worker/availability');
      if (res.data.status === 'success') {
        setIsAvailable(res.data.data.isAvailable);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle availability.');
    } finally {
      setToggling(false);
    }
  };

  // Compute stats
  const assigned = complaints.filter(c => c.status?.toUpperCase() === 'ASSIGNED').length;
  const inProgress = complaints.filter(c => c.status?.toUpperCase() === 'IN_PROGRESS').length;
  const completed = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status?.toUpperCase())).length;

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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Technician Dashboard</h1>
          <p className="text-sm text-slate-400 font-medium">Manage assignments and update resolution sheets.</p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
          <span className="text-sm font-semibold text-slate-500">Duty Status:</span>
          <button
            onClick={handleToggleAvailability}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold uppercase tracking-wider ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
            {isAvailable ? 'Active' : 'Offline'}
          </span>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard title="Assigned Jobs" value={assigned} icon={BiTimeFive} color="blue" onClick={() => navigate('/worker/complaints?status=ASSIGNED')} />
        <StatCard title="In Progress" value={inProgress} icon={BiWrench} color="violet" onClick={() => navigate('/worker/complaints?status=IN_PROGRESS')} />
        <StatCard title="Completed" value={completed} icon={BiCheckCircle} color="emerald" onClick={() => navigate('/worker/complaints')} />
      </div>

      {/* Active Work list */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Current Task Queue</h2>
          <Link to="/worker/complaints" className="text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors">
            View All Tasks
          </Link>
        </div>

        {complaints.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status?.toUpperCase())).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 font-semibold">Your queue is currently empty.</p>
            <p className="text-xs text-slate-400 mt-1">Great job! Enjoy the break, new assignments will auto-route when filed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Ticket ID</th>
                  <th className="pb-3">Problem Details</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-600 font-medium">
                {complaints
                  .filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status?.toUpperCase()))
                  .slice(0, 5)
                  .map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => navigate(`/worker/complaints/${task._id}`)}
                      className="group cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 pl-2 font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                        {task.complaintId || 'COMP-NEW'}
                      </td>
                      <td className="py-4 max-w-xs truncate">{task.description}</td>
                      <td className="py-4 capitalize">{task.category}</td>
                      <td className="py-4 pr-2 text-right">
                        <StatusBadge status={task.status} />
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

export default WorkerDashboard;
