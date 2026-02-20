'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Search, Moon, Sun, Bell, Settings, FileText, ArrowLeft, FolderOpen, Calendar, Package } from 'lucide-react';
import DashboardTopNav from './DashboardTopNav';

interface Product {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface UserData {
    id: string;
    email: string;
    credits: number;
    role?: string;
}

export default function ProductsDashboard({ user }: { user: UserData }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.products) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
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

    return (
        <div className="min-h-screen bg-[#13111C] flex text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col bg-[#13111C]">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">F</div>
                    <span className="font-semibold text-lg tracking-wide text-white">Floee AI</span>
                </div>

                <div className="flex-1 py-8 px-4 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2 tracking-wider">NAVIGATION</div>

                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200">
                        <ArrowLeft size={18} className="opacity-70" />
                        Back to Generator
                    </Link>

                    <Link href="/dashboard/products" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium bg-blue-600/10 text-blue-500 border border-blue-500/20">
                        <FolderOpen size={18} className="text-blue-500" />
                        Saved Products
                    </Link>
                </div>

                <div className="p-4 mt-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-sm font-medium text-gray-300">Your Usage</span>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-400">PRO</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">{user.credits}</span>
                                <span className="text-xs text-gray-500">credits left</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0B0A0F]">
                <DashboardTopNav user={user as any}>
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-[#1A1823] border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </DashboardTopNav>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            <FolderOpen className="text-blue-500" size={32} />
                            Your Saved Products
                        </h1>
                        <p className="text-gray-400 text-sm">View all your saved product generations and ad copy in one place.</p>
                    </div>

                    <div className="bg-[#1A1823] border border-white/5 rounded-3xl p-8 min-h-[500px] shadow-2xl relative">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="text-blue-500 animate-pulse">Loading products...</div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link key={product.id} href={`/dashboard/products/${product.id}`} className="block group">
                                        <div className="bg-[#13111C] border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 shadow-inner group-hover:shadow-blue-500/10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
                                                    <Package size={24} />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                {product.name || 'Untitled Product'}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                                <Calendar size={14} />
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <Package size={48} className="text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No products saved yet</h3>
                                <p className="text-gray-400 mb-6 max-w-sm">Complete a generation workflow in the dashboard and save it to see it appear here.</p>
                                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                                    Start Generating
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
