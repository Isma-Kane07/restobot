import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Store, Receipt, Settings, 
    LogOut, Menu, X, Bot, Sparkles, ChevronRight
} from 'lucide-react';

const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/restaurants', icon: Store, label: 'Restaurants' },
    { to: '/admin/orders', icon: Receipt, label: 'Commandes' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-dark overflow-hidden">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-dark border-r border-white/5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/5">
                        <NavLink to="/admin" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                                <Bot className="text-white" size={22} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">RestoBot</h1>
                                <p className="text-gray-500 text-xs">Administration</p>
                            </div>
                        </NavLink>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 p-4 space-y-1">
                        <p className="text-xs text-gray-600 uppercase tracking-wider px-4 mb-3">Menu</p>
                        {menuItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => 
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                                        isActive 
                                            ? 'bg-brand/10 text-brand border border-brand/20' 
                                            : 'text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                <span className="font-medium flex-1">{item.label}</span>
                                {({ isActive }) => isActive && <ChevronRight size={16} className="text-brand" />}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <span className="text-white text-sm font-bold">
                                        {user?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium truncate w-32">{user?.name || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-xl">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="glass-strong border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                        <Menu size={22} />
                    </button>
                    
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Système actif
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm">
                            <Sparkles size={14} className="text-brand" />
                            <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}