'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Search, FileText, ArrowLeft, FolderOpen, Target, ImageIcon as ImageIcon2, LineChart, Package, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DashboardTopNav from './DashboardTopNav';
import ImagePrompts from './ImagePrompts';

interface ProductDetail {
    id: string;
    name: string;
    rawText: string;
    marketAnalysis: string | null;
    productPageContent: string | null;
    imagePrompts: string | null;
    adCopy: string | null;
    createdAt: string;
}

interface UserData {
    id: string;
    email: string;
    credits: number;
    role?: string;
    [key: string]: unknown;
}

export default function ProductDetailDashboard({ user, product }: { user: UserData, product: ProductDetail }) {
    const [activeTab, setActiveTab] = useState<'analysis' | 'page' | 'images' | 'ads'>('analysis');
    const router = useRouter();

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

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const markdownComponents = {
        h1: ({ node, ...props }: React.ComponentPropsWithoutRef<'h1'> & { node?: unknown }) => <h1 className="text-xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2 font-sans" {...props} />,
        h2: ({ node, ...props }: React.ComponentPropsWithoutRef<'h2'> & { node?: unknown }) => <h2 className="text-lg font-bold text-white mt-8 mb-4 font-sans" {...props} />,
        h3: ({ node, ...props }: React.ComponentPropsWithoutRef<'h3'> & { node?: unknown }) => {
            const text = String(props.children);
            const match = text.match(/^(\d+)\.?\s+(.*)$/);
            if (match) {
                return (
                    <h3 className="flex items-center gap-2 text-base font-semibold text-white mt-6 mb-3 tracking-wide uppercase font-sans">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-500/20">
                            {match[1]}
                        </span>
                        {match[2]}
                    </h3>
                );
            }
            return <h3 className="text-base font-semibold text-white mt-6 mb-3 font-sans" {...props} />;
        },
        p: ({ node, ...props }: React.ComponentPropsWithoutRef<'p'> & { node?: unknown }) => <p className="mb-4 leading-relaxed text-gray-300" {...props} />,
        ul: ({ node, ...props }: React.ComponentPropsWithoutRef<'ul'> & { node?: unknown }) => <ul className="space-y-2 mb-6 text-gray-300 list-disc ml-5 marker:text-blue-500" {...props} />,
        ol: ({ node, ...props }: React.ComponentPropsWithoutRef<'ol'> & { node?: unknown }) => <ol className="space-y-2 mb-6 text-gray-300 list-decimal ml-5 marker:text-blue-500 font-semibold" {...props} />,
        li: ({ node, ...props }: React.ComponentPropsWithoutRef<'li'> & { node?: unknown }) => <li className="pl-1" {...props} />,
        code: ({ node, className, ...props }: React.ComponentPropsWithoutRef<'code'> & { node?: unknown }) => {
            const isInline = !className;
            return isInline ?
                <code className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-xs font-medium font-mono" {...props} /> :
                <code className="block bg-white/5 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre my-4 font-mono text-gray-300 border border-white/5" {...props} />;
        },
        strong: ({ node, ...props }: React.ComponentPropsWithoutRef<'strong'> & { node?: unknown }) => <strong className="font-semibold text-white" {...props} />
    };
    /* eslint-enable @typescript-eslint/no-unused-vars */

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

                    <Link href="/dashboard/products" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200">
                        <FolderOpen size={18} className="opacity-70" />
                        Saved Products
                    </Link>

                    <div className="mt-4 text-xs font-semibold text-gray-500 mb-2 px-2 tracking-wider">THIS PRODUCT</div>

                    <button onClick={() => setActiveTab('analysis')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'analysis' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <LineChart size={18} className={activeTab === 'analysis' ? 'text-blue-500' : 'opacity-70'} />
                        Market Analysis
                    </button>
                    <button onClick={() => setActiveTab('page')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'page' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <FileText size={18} className={activeTab === 'page' ? 'text-blue-500' : 'opacity-70'} />
                        Product Page
                    </button>
                    <button onClick={() => setActiveTab('images')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'images' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <ImageIcon2 size={18} className={activeTab === 'images' ? 'text-blue-500' : 'opacity-70'} />
                        Image Prompts
                    </button>
                    <button onClick={() => setActiveTab('ads')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === 'ads' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <Target size={18} className={activeTab === 'ads' ? 'text-blue-500' : 'opacity-70'} />
                        Ad Copy
                    </button>
                </div>

                <div className="p-4 mt-auto">
                    <button onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0B0A0F]">
                <DashboardTopNav user={user} rightContent={
                    <Link href="/dashboard/products" className="text-gray-400 hover:text-white transition-colors text-sm font-medium mr-2">
                        Close Product
                    </Link>
                }>
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search in product..."
                            className="w-full bg-[#1A1823] border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </DashboardTopNav>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-blue-500 mb-2">
                                <Package size={20} />
                                <span className="font-semibold tracking-wide uppercase text-sm">Product Folder</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                <Calendar size={14} /> Created on {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A1823] border border-white/5 rounded-3xl p-8 min-h-[500px] shadow-2xl relative">
                        {activeTab === 'analysis' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Market Analysis</h2>
                                {product.marketAnalysis ? (
                                    <div className="text-gray-300">
                                        <ReactMarkdown components={markdownComponents}>{product.marketAnalysis}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No market analysis generated for this product.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'page' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Product Page Copy</h2>
                                {product.productPageContent ? (
                                    <div className="text-gray-300">
                                        <ReactMarkdown components={markdownComponents}>{product.productPageContent}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No product page copy generated for this product.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'images' && (
                            <div className="animate-in fade-in duration-300">
                                <ImagePrompts
                                    productId={product.id}
                                    existingPrompts={product.imagePrompts}
                                    credits={user.credits}
                                    onPromptsComplete={() => {
                                        // Product is typically refreshed on page load, 
                                        // but we can let them know it saved
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'ads' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Ad Copy (Facebook & Instagram)</h2>
                                {product.adCopy ? (
                                    <div className="text-gray-300">
                                        <ReactMarkdown components={markdownComponents}>{product.adCopy}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No ad copy generated for this product.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
