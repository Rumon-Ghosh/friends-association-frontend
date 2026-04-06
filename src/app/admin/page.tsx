'use client';

import { useRouter } from 'next/navigation.js';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link.js';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useAuth } from '@/providers/AuthProvider';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Contribution Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState(100);
  const [daysCovered, setDaysCovered] = useState(1);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    } else if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [usersRes, statsRes] = await Promise.all([
        axiosSecure.get('/admin/users'),
        axiosSecure.get('/admin/stats')
      ]);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchUsers = async () => {
    fetchData(); // Simplified for now to refresh everything
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    const action = !currentStatus ? 'activate' : 'deactivate';
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Change this member's status to ${action}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Yes, ${action}!`,
      customClass: {
        popup: 'rounded-3xl',
      }
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.put('/admin/update-status', { userId, isActive: !currentStatus });
        Swal.fire({
          title: 'Updated!',
          text: `User has been ${action}d.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-3xl' }
        });
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Delete user?',
      text: "This action cannot be undone!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete!',
      customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.delete(`/admin/delete-user/${userId}`);
        Swal.fire({
          title: 'Deleted!',
          text: 'The user has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-3xl' }
        });
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete user', 'error');
      }
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return Swal.fire('Oops!', 'Select a user first.', 'info');

    // Validation: 1 day = 100 TK
    const expectedAmount = daysCovered * 100;
    if (amount !== expectedAmount) {
      return Swal.fire({
        title: 'Amount Mismatch!',
        text: `Based on ${daysCovered} days, the amount should be exactly ${expectedAmount} TK.`,
        icon: 'error',
        customClass: { popup: 'rounded-3xl' }
      });
    }
    
    setSubmitting(true);
    try {
      await axiosSecure.post('/admin/contribution', { userId: selectedUser, amount, daysCovered });
      Swal.fire({
        title: 'Success!',
        text: 'Contribution recorded successfully.',
        icon: 'success',
        customClass: { popup: 'rounded-3xl' }
      });
      setSelectedUser('');
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', 'Failed to add contribution', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunDraw = async () => {
    if (stats?.totalPooled < 10000) {
      return Swal.fire({
        title: 'Not Enough Funds!',
        text: 'At least 10,000 TK must be pooled to run the draw.',
        icon: 'error',
        customClass: { popup: 'rounded-1xl' }
      });
    }
    const result = await Swal.fire({
      title: '🎲 Run Draw?',
      text: 'A winner will be selected from eligible members.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Let\'s do it!',
      customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.post('/admin/run-draw');
        Swal.fire({
          title: '🏆 Winner Selected!',
          html: `Draw completed successfully.`,
          icon: 'success',
          customClass: { popup: 'rounded-3xl' }
        });
        fetchUsers();
      } catch (err: any) {
        Swal.fire('Draw Failed', err.response?.data?.message || 'No eligible members found.', 'error');
      }
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunDraw}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100"
          >
            🎲 Run Draw
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Members</p>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalMembers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{stats?.activeMembers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Eligible for Draw</p>
            <p className="text-2xl font-bold text-indigo-600">{stats?.eligibleCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Pooled (TK)</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalPooled || 0}</p>
          </div>
        </div>

        
        {/* Left: User Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Association Members</h2>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {users.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Member</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Status</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Coverage Until</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Won</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {users.map((u) => {
                      const coverageDate = new Date(u.coverageUntil).getTime();
                      const now = new Date().getTime();
                      const daysSinceCoverage = Math.floor((now - coverageDate) / (1000 * 60 * 60 * 24));
                      const isAtRisk = daysSinceCoverage > 25;

                      return (
                        <motion.tr 
                          key={u._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-slate-50/50 transition-colors group ${isAtRisk ? 'bg-red-50/30' : ''}`}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800">{u.name}</p>
                              {isAtRisk && (
                                <span className="bg-red-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm shadow-red-200 animate-pulse" title={`${daysSinceCoverage} days without payment`}>
                                  At Risk
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </td>
                        <td className="py-4">
                          <button 
                            onClick={() => toggleStatus(u._id, u.isActive)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          {new Date(u.coverageUntil).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          {u.hasWon ? (
                            <span className="text-xl">🏆</span>
                          ) : (
                            <span className="text-slate-200">○</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-300 hover:text-red-500 transition-colors p-2 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {fetching && users.length === 0 && (
                <div className="py-20 text-center text-slate-400">Loading members...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Add Contribution</h2>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Select Member</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-black border border-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Choose 10 members...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Days</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-black outline-none"
                    value={daysCovered}
                    onChange={(e) => {
                      const days = Number(e.target.value);
                      setDaysCovered(days);
                      setAmount(days * 100);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Amount (TK)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-black outline-none"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Record Payment 💸'}
              </button>
            </form>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-100 text-white">
            <h3 className="text-lg font-bold mb-2">Draw Logic</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              A random winner will be selected from members who are **Active**, **Covered by payments**, and **Haven't won** this cycle.
            </p>
            <div className="bg-white/10 p-4 rounded-2xl text-xs flex gap-3 italic">
              <span>ℹ️</span>
              Ensure you have at least one eligible member before running the draw.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
