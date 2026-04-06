'use client';

import { useRouter } from 'next/navigation.js';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link.js';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useAuth } from '@/providers/AuthProvider';

export default function MembersStatusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  
  const [members, setMembers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMembers();
    }
  }, [user, loading, router]);

  const fetchMembers = async () => {
    try {
      setFetching(true);
      const res = await axiosSecure.get('/members/members-status');
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  if (loading || !user) {
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
            ← Home
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Association Transparency</h1>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
          Read Only Mode
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Member Standings</h2>
          <p className="text-slate-500">Transparent view of all association participants and their current status.</p>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Member Name</th>
                  <th className="p-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Payments Active</th>
                  <th className="p-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Eligibility</th>
                  <th className="p-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Win Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.map((m, idx) => {
                  const isCovered = new Date(m.coverageUntil) >= new Date();
                  return (
                    <motion.tr 
                      key={m._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            m.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {m.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          m.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {m.isActive ? 'Active Member' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isCovered ? 'text-indigo-600' : 'text-orange-500'}`}>
                            {isCovered ? 'Payments Up to Date' : 'Payments Lapsed'}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-black">
                            {new Date(m.coverageUntil).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        {m.hasWon ? (
                          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                            <span>🏆 WINNER</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm italic">Waiting for draw...</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            
            {!fetching && members.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="text-4xl mb-4">🔦</div>
                <p className="text-slate-400 font-medium">No members found in the association.</p>
              </div>
            )}
            
            {fetching && (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="animate-bounce text-2xl mb-4">🔍</div>
                <p className="text-slate-400 font-medium italic">Fetching latest standings...</p>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-12 bg-slate-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Collective Accountability</h3>
            <p className="text-slate-400 text-sm max-w-md">
              This shared view ensures that everyone is contributing equally and fairly. If you see a member has "Record Lapsed", they won't be eligible for the next draw.
            </p>
          </div>
          <Link href="/" className="relative z-10 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-sm font-bold transition-all border border-white/10">
            Return to Dashboard
          </Link>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </footer>
      </main>
    </div>
  );
}
