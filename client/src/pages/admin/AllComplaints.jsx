import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiSearch, BiUser, BiChevronLeft } from 'react-icons/bi';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Reassignment Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [targetWorkerId, setTargetWorkerId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, workerRes] = await Promise.all([
        api.get('/admin/complaints'),
        api.get('/admin/workers'),
      ]);

      if (compRes.data.status === 'success') {
        setComplaints(compRes.data.data.complaints || compRes.data.complaints || []);
      }
      if (workerRes.data.status === 'success') {
        setWorkers(workerRes.data.data.workers || workerRes.data.workers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...complaints];

    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status?.toUpperCase() === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter(c => c.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        c =>
          (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.resident?.name && c.resident.name.toLowerCase().includes(q)) ||
          (c.assignedWorker?.name && c.assignedWorker.name.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [complaints, statusFilter, categoryFilter, search]);

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!targetWorkerId) return;

    try {
      setReassigning(true);
      setError(null);
      await api.patch(`/admin/complaints/${selectedComplaint._id}/assign`, {
        workerId: targetWorkerId,
      });

      setSelectedComplaint(null);
      setTargetWorkerId('');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign worker.');
    } finally {
      setReassigning(false);
    }
  };

  // Filter workers eligible for the selected complaint's category
  const eligibleWorkers = selectedComplaint
    ? workers.filter(
        w =>
          w.isAvailable &&
          w.specialization?.includes(selectedComplaint.category.toLowerCase())
      )
    : [];

  const categories = ['ALL', 'electricity', 'water', 'plumbing', 'maintenance', 'security', 'other'];
  const statuses = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Complaints Console</h1>
        <p className="text-sm text-slate-400 font-medium">Override automatic routing, monitor statuses, and reassign technicians.</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:outline-none"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <BiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Resident, Worker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Grid List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-100 bg-white">
          <p className="text-slate-400 font-semibold text-lg">No matching tickets</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Assigned Technician</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                {filtered.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{ticket.complaintId || 'COMP-NEW'}</td>
                    <td className="py-4 px-4 capitalize">{ticket.category}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-800">{ticket.resident?.name}</p>
                        <p className="text-[10px] text-slate-400">Flat {ticket.resident?.flatNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {ticket.assignedWorker ? (
                        <p className="font-bold text-slate-850">{ticket.assignedWorker.name}</p>
                      ) : (
                        <p className="text-slate-400 italic">Unassigned</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {['PENDING', 'ASSIGNED', 'REOPENED'].includes(ticket.status?.toUpperCase()) && (
                        <button
                          onClick={() => {
                            setSelectedComplaint(ticket);
                            setTargetWorkerId(ticket.assignedWorker?._id || '');
                          }}
                          className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-600 hover:bg-violet-100 hover:text-violet-750 transition-all"
                        >
                          Manual Route
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Route Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleReassign} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 transition-all">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Manually Assign Ticket</h3>
              <p className="text-xs text-slate-400">
                Category: <span className="font-bold text-slate-700 capitalize">{selectedComplaint.category}</span>
              </p>

              <div>
                <label htmlFor="workerSelect" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Available Agent
                </label>
                <select
                  id="workerSelect"
                  required
                  value={targetWorkerId}
                  onChange={(e) => setTargetWorkerId(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-700 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Select Technician</option>
                  {eligibleWorkers.map(w => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.activeComplaints} active jobs)
                    </option>
                  ))}
                </select>
                {eligibleWorkers.length === 0 && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">
                    No online specialists available for this category.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedComplaint(null);
                  setTargetWorkerId('');
                }}
                disabled={reassigning}
                className="rounded-lg px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reassigning || !targetWorkerId}
                className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {reassigning ? 'Reassigning...' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AllComplaints;
