import { useState, useCallback } from 'react';

const API_URL = '/api';

export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getToken = () => localStorage.getItem('token');

    const request = useCallback(async (endpoint, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const headers = { ...options.headers };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
            
            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
                return null;
            }
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur serveur');
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { request, loading, error };
}