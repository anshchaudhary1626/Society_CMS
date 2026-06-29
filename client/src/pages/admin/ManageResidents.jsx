import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BiSearch } from 'react-icons/bi';

const ManageResidents = () => {
  const [residents, setResidents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/residents');
        if (res.data.status === 'success') {
          setResidents(res.data.data.residents || res.data.residents || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load residents directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(residents);
      return;
    }

    const q = search.toLowerCase();
    const result = residents.filter(
      r =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.flatNumber && r.flatNumber.toLowerCase().includes(q))
    );
    setFiltered(result);
  }, [residents, search]);

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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Residents Directory</h1>
          <p className="text-sm text-slate-400 font-medium">Verify flats, review contact directories, and view housing data.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <BiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search residents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-100 bg-white">
          <p className="text-slate-400 font-semibold">No residents found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Resident Name</th>
                  <th className="py-3 px-4">Flat Number</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                {filtered.map((resident) => (
                  <tr key={resident._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{resident.name}</td>
                    <td className="py-4 px-4">{resident.flatNumber || 'N/A'}</td>
                    <td className="py-4 px-4 text-slate-500">{resident.email}</td>
                    <td className="py-4 px-4 text-slate-500">{resident.phone || 'N/A'}</td>
                    <td className="py-4 px-4 text-right text-slate-400 font-medium">
                      {new Date(resident.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResidents;
