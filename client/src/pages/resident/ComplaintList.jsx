import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiSearch } from 'react-icons/bi';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'ALL';
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await api.get('/complaints/my');
        if (res.data.status === 'success') {
          setComplaints(res.data.data.complaints || res.data.complaints || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    let result = [...complaints];

    // Filter by Tab
    if (currentTab !== 'ALL') {
      if (currentTab === 'ACTIVE') {
        result = result.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status?.toUpperCase()));
      } else {
        result = result.filter(c => c.status?.toUpperCase() === currentTab.toUpperCase());
      }
    }

    // Filter by Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        c =>
          (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [complaints, currentTab, search]);

  const tabs = [
    { key: 'ALL', label: 'All Tickets' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ];

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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Complaints</h1>
        <p className="text-sm text-slate-400 font-medium">Track progress and provide feedback on your reported issues.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchParams(tab.key === 'ALL' ? {} : { status: tab.key })}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all focus:outline-none ${
                currentTab === tab.key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <BiSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-violet-500 focus:ring-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Complaints Grid/List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-slate-400 font-semibold text-lg">No tickets found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => navigate(`/resident/complaints/${ticket._id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ticket.category}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 group-hover:text-violet-600 transition-colors">
                    {ticket.complaintId || 'COMP-NEW'}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              <div className="border-t border-slate-50 mt-6 pt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Submitted: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                {ticket.assignedWorker && (
                  <span className="font-semibold text-violet-600">Active Agent</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
