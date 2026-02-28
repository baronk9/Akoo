'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Bell, Settings, LogOut, User, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
    email: string;
    [key: string]: unknown;
}

export default function DashboardTopNav({ user, children, rightContent }: { user?: UserData, children?: React.ReactNode, rightContent?: React.ReactNode }) {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSettingsToast, setShowSettingsToast] = useState(false);
    const router = useRouter();

    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            router.push('/login');
            router.refresh();
        }
    };

    const handleSettingsClick = () => {
        setShowSettingsToast(true);
        setTimeout(() => setShowSettingsToast(false), 3000);
    };

    return (
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B0A0F]/80 backdrop-blur-md sticky top-0 z-40">
            {/* Left side (Search, Back buttons, etc passed as children) */}
            <div className="flex-1 flex items-center">
                {children}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-4 relative">

                {rightContent}

                {/* Theme Toggle */}
                <div className="flex items-center gap-2 bg-[#1A1823] rounded-full p-1 border border-white/5">
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Dark Mode"
                    >
                        <Moon size={16} />
                    </button>
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Light Mode"
                    >
                        <Sun size={16} />
                    </button>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2.5 rounded-full border border-white/5 transition-colors relative ${showNotifications ? 'bg-white/10 text-white' : 'bg-[#1A1823] text-gray-400 hover:text-white'}`}
                    >
                        <Bell size={18} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 rounded-full border border-[#1A1823]"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-[#1A1823] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                <span className="font-semibold text-white">Notifications</span>
                                <span className="text-xs text-blue-400 cursor-pointer hover:underline">Mark all read</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                                    <div className="text-sm font-medium text-white mb-1">Welcome to Floee AI!</div>
                                    <div className="text-xs text-gray-400">Your account is active. Start generating high-converting product pages today.</div>
                                    <div className="text-[10px] text-gray-500 mt-2">Just now</div>
                                </div>
                                <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                                    <div className="text-sm font-medium text-white mb-1">50 Credits Added</div>
                                    <div className="text-xs text-gray-400">Your monthly AI credits have been successfully replenished.</div>
                                    <div className="text-[10px] text-gray-500 mt-2">2 days ago</div>
                                </div>
                            </div>
                            <div className="px-4 py-2 border-t border-white/5 text-center">
                                <button className="text-sm text-gray-400 hover:text-white transition-colors">View all</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <div className="relative">
                    <button
                        onClick={handleSettingsClick}
                        className="p-2.5 rounded-full bg-[#1A1823] border border-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                    {showSettingsToast && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 z-50 text-center">
                            Settings modal coming soon
                        </div>
                    )}
                </div>

                {/* User Profile Avatar */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/10 shadow-sm ml-2 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none"
                    >
                        {user?.email?.[0].toUpperCase() || 'S'}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#1A1823] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-white/5">
                                <div className="text-sm font-bold text-white truncate">{user?.email || 'user@example.com'}</div>
                                <div className="text-xs text-gray-400 mt-1">Pro Tier</div>
                            </div>
                            <div className="py-1">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                                    <User size={14} /> My Account
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                                    <Settings size={14} /> Preferences
                                </button>
                                {user?.role === 'ADMIN' && (
                                    <button onClick={() => router.push('/admin')} className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-white/5 hover:text-purple-300 transition-colors flex items-center gap-2 mt-1 border-t border-white/5 pt-3">
                                        <Shield size={14} /> Admin Panel
                                    </button>
                                )}
                            </div>
                            <div className="px-3 py-2 border-t border-white/5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <LogOut size={14} /> Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
