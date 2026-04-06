'use client';

import { useRouter } from 'next/navigation.js';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import DrawCountdown from '@/components/DrawCountdown';
import { useAuth } from '@/providers/AuthProvider';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const [contributions, setContributions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFetching(true);
      axiosSecure.get('/members/profile')
        .then(res => {
          setContributions(res.data.data.contributions);
        })
        .catch(err => console.error(err))
        .finally(() => setFetching(false));
    }
  }, [user, axiosSecure]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 relative z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent italic">
            Friends Association
          </h1>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right flex flex-col items-end mr-2">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
            </div>
            {user.role === 'admin' && (
              <Link 
                href="/admin"
                className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-purple-200"
              >
                Admin Panel
              </Link>
            )}
            <Link href="/draw-results" className="text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              🏆 Results
            </Link>
            <Link href="/notifications" className="text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              🔔 Inbox
            </Link>
            <Link href="/members" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-indigo-100">
              Members
            </Link>
            <button onClick={logout} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-200">
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3 shadow-xl absolute w-full"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-2">
              <span className="font-semibold text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">{user.role}</span>
            </div>
            
            {user.role === 'admin' && (
              <Link href="/admin" className="text-purple-600 font-medium py-2">
                ⚙️ Admin Panel
              </Link>
            )}
            <Link href="/draw-results" className="text-slate-600 font-medium py-2">
              🏆 Draw Results
            </Link>
            <Link href="/notifications" className="text-slate-600 font-medium py-2">
              🔔 Inbox Notifications
            </Link>
            <Link href="/members" className="text-indigo-600 font-medium py-2">
              👥 Members Status
            </Link>
            <button onClick={logout} className="text-red-500 font-medium py-2 text-left mt-2 border-t border-slate-50 pt-3">
              Logout
            </button>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <DrawCountdown />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center py-12"
        >
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold">
            👋
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Home, {user.name}</h2>
          <p className="text-slate-500 max-w-sm">
            Everything looks correctly configured. Soon you'll be able to see your contributions and draw status here.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500 mb-1">Role Status</p>
              <p className="text-xl font-bold text-indigo-600 capitalize">{user.role}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500 mb-1">Email Verified</p>
              <p className="text-xl font-bold text-emerald-600">Yes</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500 mb-1">Association Info</p>
              <p className="text-xl font-bold text-slate-800">
                {fetching ? '...' : `${contributions.length} Payments`}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
