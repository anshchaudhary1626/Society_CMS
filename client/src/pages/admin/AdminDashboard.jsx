import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiTask, BiTimeFive, BiCheckDouble, BiWrench, BiUserVoice, BiTrafficCone } from 'react-icons/bi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, workersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/workers'),
        ]);

        if (statsRes.data.status === 'success') {
          setStats(statsRes.data.data);
        }
        if (workersRes.data.status === 'success') {
          setWorkers(workersRes.data.data.workers || workersRes.data.workers || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load administration data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Prep stats numbers and map MongoDB Aggregation arrays to objects
  const defaultStatuses = {
    PENDING: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
    REOPENED: 0
  };
  const counts = { ...defaultStatuses };
  if (Array.isArray(stats?.statusCounts)) {
    stats.statusCounts.forEach(item => {
      if (item._id) {
        counts[item._id.toUpperCase()] = item.count;
      }
    });
  }

  const defaultCategories = {
    electricity: 0,
    water: 0,
    plumbing: 0,
    maintenance: 0,
    security: 0,
    other: 0
  };
  const categoryDataRaw = { ...defaultCategories };
  if (Array.isArray(stats?.categoryCounts)) {
    stats.categoryCounts.forEach(item => {
      if (item._id) {
        categoryDataRaw[item._id.toLowerCase()] = item.count;
      }
    });
  }
  
  const totalComplaints = Object.values(counts).reduce((a, b) => a + b, 0);
  const pending = counts.PENDING || 0;
  const active = (counts.ASSIGNED || 0) + (counts.IN_PROGRESS || 0) + (counts.REOPENED || 0);
  const resolved = counts.RESOLVED || 0;
  const closed = counts.CLOSED || 0;

  // Format Avg Resolution Time (Read hours directly from backend)
  const avgResHours = stats?.averageResolutionTimeHours || 0;

  // Format Chart Data
  const chartData = Object.keys(categoryDataRaw).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: categoryDataRaw[cat] || 0,
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 font-medium">Global operational metrics and agent workloads.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Complaints" value={totalComplaints} icon={BiTask} color="violet" />
        <StatCard title="Unassigned (Pending)" value={pending} icon={BiTrafficCone} color="rose" />
        <StatCard title="Active Working" value={active} icon={BiWrench} color="blue" />
        <StatCard title="Awaiting Closure" value={resolved} icon={BiTimeFive} color="amber" />
        <StatCard title="Avg Resolution Time" value={`${avgResHours} hrs`} icon={BiCheckDouble} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown bar chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Complaints by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Workload Panel */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Agent Workloads</h2>
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-60 pr-1">
              {workers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No registered technicians.</p>
              ) : (
                workers.map((worker) => (
                  <div key={worker._id} className="flex items-center justify-between py-3">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{worker.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 capitalize">
                        {worker.specialization?.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        worker.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {worker.activeComplaints} Active
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
