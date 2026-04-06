'use client';

import { useRouter } from 'next/navigation.js';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link.js';
import { useAuth } from '@/providers/AuthProvider';
import useAxiosSecure from '@/hooks/useAxiosSecure';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchNotifications();
    }
  }, [user, loading, router]);

  const fetchNotifications = async () => {
    try {
      setFetching(true);
      const res = await axiosSecure.get('/members/notifications');
      setNotifications(res.data.data);
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
          <h1 className="text-xl font-bold text-slate-800">Inbox</h1>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Notifications</h2>
          <p className="text-slate-500">Stay updated on your contributions and association draws.</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((n, idx) => {
              const isPayment = n.message.toLowerCase().includes('contribution');
              const isWin = n.message.toLowerCase().includes('winner');
              
              let bgClass = 'bg-white';
              let icon = '🔔';
              
              if (isPayment) icon = '💸';
              if (isWin) {
                bgClass = 'bg-indigo-50 border-indigo-100';
                icon = '🎉';
              }

              return (
                <motion.div 
                  key={n._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`${bgClass} rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl shadow-sm ${
                    isWin ? 'bg-indigo-600 text-white' : 'bg-slate-100'
                  }`}>
                    {icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm md:text-base ${isWin ? 'font-bold text-indigo-900' : 'text-slate-700 font-medium'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      {new Date(n.createdAt).toLocaleString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm shadow-blue-200"></div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!fetching && notifications.length === 0 && (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="text-6xl mb-6 opacity-30">📭</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</h3>
            <p className="text-slate-500 max-w-sm">When admin adds your contribution or completes a draw, it will show up here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
