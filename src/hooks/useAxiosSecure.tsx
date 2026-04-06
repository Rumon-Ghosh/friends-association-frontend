'use client';

import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { useEffect } from 'react';

const axiosSecure = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

const useAxiosSecure = () => {
  const { logout } = useAuth();

  useEffect(() => {
    // Intercept responses
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        // If unauthorized (401) or forbidden (403), logout the user
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  return axiosSecure;
};

export default useAxiosSecure;
