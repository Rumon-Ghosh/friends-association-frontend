'use client';

import { useRouter } from 'next/navigation.js';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link.js';
import { useAuth } from '@/providers/AuthProvider';
import useAxiosSecure from '@/hooks/useAxiosSecure';

export default function DrawResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  
  const [results, setResults] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchResults();
    }
  }, [user, loading, router]);

  const fetchResults = async () => {
    try {
      setFetching(true);
      const res = await axiosSecure.get('/members/draw-results');
      setResults(res.data.data);
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
          <h1 className="text-xl font-bold text-slate-800">Draw Results</h1>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Previous Winners</h2>
          <p className="text-slate-500">History of all completed association draws and their lucky winners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {results.map((r, idx) => (
              <motion.div 
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-slate-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">
                  🏆
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {new Date(r.drawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">Pool: {r.totalAmount} TK</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{r.winnerId?.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{r.winnerId?.email}</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Prize Awarded</span>
                      <span className="text-lg font-black text-emerald-600">{r.totalAmount} TK</span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                      #{results.length - idx}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!fetching && results.length === 0 && (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="text-6xl mb-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">🎲</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No draws yet</h3>
            <p className="text-slate-500 max-w-sm">The first draw will appear here once the admin initiates it. Keep contributing!</p>
          </div>
        )}
      </main>
    </div>
  );
}
