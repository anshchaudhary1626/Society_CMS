import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiUserPlus, BiPowerOff } from 'react-icons/bi';

const ManageWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/workers');
      if (res.data.status === 'success') {
        setWorkers(res.data.data.workers || res.data.workers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workers database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (specialization.length === 0) {
      setError('Please select at least one specialization.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post('/admin/workers', {
        name,
        email,
        password,
        phone,
        specialization,
      });

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setSpecialization([]);
      setShowAddModal(false);
      await fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create worker profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateWorker = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this worker?')) return;
    try {
      setError(null);
      await api.delete(`/admin/workers/${id}`);
      await fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate worker.');
    }
  };

  const handleCheckboxChange = (cat) => {
    if (specialization.includes(cat)) {
      setSpecialization(specialization.filter(s => s !== cat));
    } else {
      setSpecialization([...specialization, cat]);
    }
  };

  const categories = ['electricity', 'water', 'plumbing', 'maintenance', 'security', 'other'];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Technician Database</h1>
          <p className="text-sm text-slate-400 font-medium">Add, manage, and audit specialized maintenance personnel.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500 shadow-md hover:shadow-violet-500/20 active:scale-95 transition-all"
        >
          <BiUserPlus size={20} />
          Register New Worker
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {workers.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-100 bg-white">
          <p className="text-slate-400 font-semibold">No registered technicians found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div key={worker._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800">{worker.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{worker.email}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    worker.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {worker.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600 font-medium">
                  <p><span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Contact:</span> {worker.phone || 'N/A'}</p>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Specializations:</span>
                    <div className="flex flex-wrap gap-1">
                      {worker.specialization?.map(spec => (
                        <span key={spec} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">Active Jobs: {worker.activeComplaints}</span>
                <button
                  onClick={() => handleDeactivateWorker(worker._id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Deactivate Worker"
                >
                  <BiPowerOff size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddWorker} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 transition-all">
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-800">Register Technician Profile</h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="wName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    id="wName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:outline-none focus:border-violet-500"
                    placeholder="Ramesh Dev"
                  />
                </div>

                <div>
                  <label htmlFor="wEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    id="wEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:outline-none focus:border-violet-500"
                    placeholder="ramesh@society.com"
                  />
                </div>

                <div>
                  <label htmlFor="wPass" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Temporary Password</label>
                  <input
                    id="wPass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:outline-none focus:border-violet-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="wPhone" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    id="wPhone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:outline-none focus:border-violet-500"
                    placeholder="9988776655"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specializations</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={specialization.includes(cat)}
                          onChange={() => handleCheckboxChange(cat)}
                          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSpecialization([]);
                }}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Creating...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageWorkers;
