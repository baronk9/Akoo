'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles, LogOut, Search,
    ArrowRight, Target, LayoutDashboard, Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateProjectModal from './CreateProjectModal';
import DashboardTopNav from './DashboardTopNav';

interface UserData {
    id: string;
    email: string;
    credits: number;
    role?: string;
    [key: string]: unknown;
}

interface Product {
    id: string;
    name: string;
    createdAt: string;
    _count?: { imagePrompts: number, adCopy: number };
}

export default function DashboardHome({ user }: { user: UserData }) {
    const router = useRouter();
    const [isCreateModalOpen, setModalOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products.slice(0, 4)); // Show only latest 4 on dashboard
                }
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoadingProducts(false);
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

    const creditsPercentage = Math.min((user.credits / 100) * 100, 100);

    return (
        <div className="min-h-screen flex bg-[#0B0A0F] text-gray-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#13111C] flex flex-col p-4 z-50 fixed h-full top-0 left-0">
                <div className="flex items-center gap-3 px-2 mb-10 group mt-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-lg border border-blue-400/20">
                        F
                    </div>
                    <span className="font-bold text-white tracking-wide">Floee AI</span>
                </div>

                <div className="space-y-1 mb-6">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/20 py-3 rounded-xl font-medium transition-all"
                    >
                        <Sparkles size={16} /> New Project
                    </button>
                </div>

                <div className="text-xs font-semibold text-gray-500 mt-4 mb-2 px-2 tracking-wider">GENERAL</div>
                <div className="space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 text-sm font-medium">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link href="/dashboard/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all text-sm font-medium">
                        <FolderOpen size={18} className="opacity-70" /> My Products
                    </Link>
                </div>

                {/* User/Credits Widget */}
                <div className="p-4 mt-auto rounded-2xl bg-[#1A1823] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-300">Personal</span>
                        </div>
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 shadow-sm">Upgrade</span>
                    </div>

                    <div className="relative z-10 mb-2 mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{user.credits} credits left</span>
                            <span>100</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#13111C] rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${creditsPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                <button onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    <LogOut size={16} /> Sign out
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 ml-64 relative">

                {/* Top Header */}
                <DashboardTopNav user={user}>
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects or analyses..."
                            className="w-full bg-[#1A1823] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </DashboardTopNav>

                <div className="flex-1 overflow-auto p-10 custom-scrollbar relative z-10 space-y-10">
                    {/* Header Block */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Hello {user.email.split('@')[0]},
                        </h1>
                        <p className="text-gray-400 text-sm">Explore your business metrics and ongoing projects effectively.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Box 1 */}
                        <div className="bg-[#1A1823] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-8">
                                <span className="text-gray-400 font-medium text-sm border-b border-gray-600/30 pb-1">Total Projects</span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                    <Target size={14} />
                                </div>
                            </div>
                            <div className="text-5xl font-light text-white">{products.length}</div>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-[#1A1823] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-8">
                                <span className="text-gray-400 font-medium text-sm border-b border-gray-600/30 pb-1">Credits Available</span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                    <Sparkles size={14} />
                                </div>
                            </div>
                            <div className="text-5xl font-light text-white">{user.credits}</div>
                        </div>

                        {/* Box 3 - Upgrade Promo */}
                        <div className="bg-gradient-to-tr from-[#13111C] to-blue-900/40 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-blue-900/10 group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-all"></div>
                            <span className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full border border-white/10 shadow-sm inline-block mb-4">PRO TIER</span>
                            <h3 className="text-white font-medium text-xl leading-snug">Switch to AI Content Professional today!</h3>
                            <button className="mt-6 flex items-center gap-2 text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors">
                                Upgrade Now <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Latest Projects Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Latest Projects</h2>
                            <Link href="/dashboard/products" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>

                        {loadingProducts ? (
                            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading projects...</div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-[#1A1823] hover:bg-[#1a1823]/80 border border-white/5 hover:border-white/10 transition-all rounded-3xl p-6 group flex flex-col relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-purple-500/10 transition-all"></div>

                                        <div className="flex justify-between items-start mb-6 z-10 relative">
                                            <div>
                                                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 mb-3 inline-block font-medium tracking-wide">AI Workflow</span>
                                                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                <FolderOpen size={18} className="text-purple-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-8 z-10 relative">
                                            <div className="flex items-center gap-2 text-sm text-gray-400 text-sm">
                                                <Target size={14} className="opacity-70" /> Niche: <span className="text-gray-300">Auto-detected</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 text-sm">
                                                <Sparkles size={14} className="opacity-70" /> Created: <span className="text-gray-300">{new Date(product.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/products/${product.id}`}
                                            className="mt-auto w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 z-10 relative shadow-lg shadow-blue-900/20"
                                        >
                                            Continue Project <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#1A1823] border border-white/5 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                                    <FolderOpen size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-white text-lg font-medium mb-2">No projects yet</h3>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">Create a new project to start managing your strategic AI workflows.</p>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    <Plus size={18} /> Create First Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}

// Importing FolderOpen explicitly as a fallback for standard icon imports above
function FolderOpen(props: React.SVGProps<SVGSVGElement> & { size?: number | string }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || "24"}
            height={props.size || "24"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            <path d="M22 10H2" />
        </svg>
    )
}
