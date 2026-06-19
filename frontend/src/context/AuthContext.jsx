import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(data => {
                if (data.id) setUser(data);
                else logout();
            })
            .catch(() => logout());
        }
    }, [token]);

    function login(newToken, userData) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        navigate('/admin');
    }

    function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);