'use client';

import React, { useState } from 'react';
import { Search, Moon, Sun, LogOut, PlusCircle, BookOpen } from 'lucide-react';
import useStore from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { theme, toggleTheme, toggleAddContentModal } = useStore();
    const { user, isAdmin, signInWithGoogle, logout, loading } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsUserMenuOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="h-16 w-full bg-white/70 dark:bg-black/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 md:px-6 z-50 relative">
            {/* Left: Logo */}
            <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    <BookOpen size={20} className="md:w-6 md:h-6" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Reader
                </span>
            </div>

            {/* Center: Search (hidden on small mobile) */}
            <div className="hidden sm:flex flex-1 max-w-xl mx-2 md:mx-4 relative">
                <div className="relative group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-full py-2 pl-10 pr-4 outline-none transition-all shadow-inner focus:shadow-lg focus:bg-white dark:focus:bg-black text-gray-900 dark:text-white text-sm"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={18} className="md:w-5 md:h-5" /> : <Sun size={18} className="md:w-5 md:h-5" />}
                </button>

                {/* Auth */}
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-1 md:gap-2 p-1 pr-2 md:pr-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <span className="text-xs md:text-sm font-medium hidden sm:block text-gray-900 dark:text-white">{user.name}</span>
                        </button>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden py-1"
                                >
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-xs text-gray-500">Signed in as</p>
                                        <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user.email}</p>
                                        {isAdmin && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                                                Admin
                                            </span>
                                        )}
                                    </div>

                                    {/* Show Add Content only for admin users */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => { toggleAddContentModal(); setIsUserMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm text-gray-900 dark:text-white"
                                        >
                                            <PlusCircle size={16} /> Add Content
                                        </button>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2 text-sm"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {loading ? 'Loading...' : 'Sign In'}
                    </button>
                )}
            </div>
        </nav>
    );
}
