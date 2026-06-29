import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BiLogOut, BiMenu, BiX } from 'react-icons/bi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLinks = {
    resident: [
      { name: 'Dashboard', path: '/resident/dashboard' },
      { name: 'My Complaints', path: '/resident/complaints' },
      { name: 'File Complaint', path: '/resident/complaints/new' },
    ],
    worker: [
      { name: 'Dashboard', path: '/worker/dashboard' },
      { name: 'My Tasks', path: '/worker/complaints' },
      { name: 'My Reviews', path: '/worker/reviews' },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Complaints Console', path: '/admin/complaints' },
      { name: 'Manage Workers', path: '/admin/workers' },
      { name: 'Residents Directory', path: '/admin/residents' },
    ],
  };

  const links = roleLinks[user.role] || [];

  return (
    <nav className="border-b border-slate-100 bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold tracking-tight text-violet-600 flex items-center gap-1.5">
                🏢 <span className="font-semibold text-slate-800">SCMS</span>
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{user.name}</p>
              <p className="text-xs font-semibold text-slate-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all focus:outline-none"
              title="Logout"
            >
              <BiLogOut className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none"
            >
              {isOpen ? <BiX className="h-6 w-6" /> : <BiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white">
          <div className="space-y-1 pb-3 pt-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-all"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-2 border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-semibold text-red-600 hover:bg-red-50 transition-all"
            >
              <BiLogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
