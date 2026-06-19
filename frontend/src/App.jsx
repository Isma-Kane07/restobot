import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import RestoDashboard from './pages/RestoDashboard';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/resto/:id" element={<RestoDashboard />} />  {/* ← Route publique */}

                    {/* Admin */}
                    <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<Dashboard />} />
                        <Route path="restaurants" element={<Restaurants />} />
                        <Route path="restaurants/:id" element={<RestaurantDetail />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}