'use client';

import React, { useState } from 'react';
import FileUpload from './FileUpload';
import MarketAnalysis from './MarketAnalysis';
import ProductPage from './ProductPage';
import ImagePrompts from './ImagePrompts';
import AdCopy from './AdCopy';
import {
    LogOut, CheckCircle2, Search,
    FileText, Image as ImageIcon,
    Target, LineChart, FileUp, Loader2, FolderOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardTopNav from './DashboardTopNav';

interface UserData {
    id: string;
    email: string;
    credits: number;
    role?: string;
    [key: string]: unknown;
}

export default function DashboardWizard({ user, initialProjectName }: { user: UserData; initialProjectName?: string }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [maxStepReached, setMaxStepReached] = useState(1);
    const [productId, setProductId] = useState<string | null>(null);
    const [credits, setCredits] = useState(user.credits);
    const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);
    const [productName, setProductName] = useState(initialProjectName || '');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleFileUploadSuccess = (product: { id: string }) => {
        setProductId(product.id);
        setMaxStepReached((prev) => Math.max(prev, 2));
    };

    const handleMarketAnalysisComplete = () => {
        setMaxStepReached((prev) => Math.max(prev, 3));
    };

    const handleProductPageComplete = () => {
        setCredits((prev) => Math.max(0, prev - 1));
        setMaxStepReached((prev) => Math.max(prev, 4));
    };

    const handleImagePromptsComplete = () => {
        setCredits((prev) => Math.max(0, prev - 1));
        setMaxStepReached((prev) => Math.max(prev, 5));
    };

    const handleAdCopyComplete = () => {
        setIsWorkflowComplete(true);
    };

    const handleSaveProduct = async () => {
        if (!productId || !productName.trim()) return;
        setIsSaving(true);
        try {
            await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: productName }),
            });
            router.push('/dashboard/products');
        } catch (error) {
            console.error('Save failed:', error);
            setIsSaving(false);
        }
    };

    const handleBuyCredits = async () => {
        try {
            const res = await fetch('/api/credits/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credits: 10 }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Failed to initiate checkout', err);
        }
    };

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

    const menuItems = [
        { id: 1, label: 'Upload Product', icon: FileUp },
        { id: 2, label: 'Market Analysis', icon: LineChart },
        { id: 3, label: 'Product Page', icon: FileText },
        { id: 4, label: 'Image Prompts', icon: ImageIcon },
        { id: 5, label: 'Ad Copy', icon: Target },
    ];

    return (
        <div className="min-h-screen bg-[#13111C] flex text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col bg-[#13111C]">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                        F
                    </div>
                    <span className="font-semibold text-lg tracking-wide text-white">Floee AI</span>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 py-8 px-4 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2 tracking-wider">MY PRODUCTS</div>
                    <Link href="/dashboard/products" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200">
                        <FolderOpen size={18} className="opacity-70" />
                        My Products
                    </Link>

                    <div className="text-xs font-semibold text-gray-500 mt-4 mb-2 px-2 tracking-wider">WORKFLOW</div>
                    {menuItems.map((item) => {
                        const active = currentStep === item.id;
                        const accessible = maxStepReached >= item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                disabled={!accessible && !active}
                                onClick={() => accessible && setCurrentStep(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                                    ${active
                                        ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
                                        : accessible
                                            ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                            : 'text-gray-600 cursor-not-allowed'
                                    }
                                `}
                            >
                                <Icon size={18} className={active ? 'text-blue-500' : 'opacity-70'} />
                                {item.label}
                                {maxStepReached > item.id && (
                                    <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* User/Credits Widget */}
                <div className="p-4 mt-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-sm font-medium text-gray-300">Your Usage</span>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-400">PRO</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">{credits}</span>
                                <span className="text-xs text-gray-500">credits left</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <button onClick={handleBuyCredits} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors mt-2 relative z-10 shadow-lg shadow-blue-900/20 text-center">
                            Upgrade
                        </button>
                    </div>
                    <button onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0B0A0F]">
                {/* Top Header */}
                <DashboardTopNav user={user}>
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                        </Link>
                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search products, analyses, or copy..."
                                className="w-full bg-[#1A1823] border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </DashboardTopNav>

                {/* Dashboard Inner Scroll */}
                <div className="flex-1 overflow-auto p-8 custom-scrollbar">

                    {/* Greeting & Quick Stats */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Hello {user.email.split('@')[0]},
                        </h1>
                        <p className="text-gray-400 text-sm">Automate your e-commerce growth with advanced AI content generation.</p>

                        <div className="grid grid-cols-3 gap-6 mt-8">
                            <div className="bg-[#1A1823] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-4 -mt-4 transition-all group-hover:bg-blue-500/10"></div>
                                <span className="text-sm font-medium text-gray-400 mb-1">Products Uploaded</span>
                                <span className="text-4xl font-light text-white my-2">{productId ? '1' : '0'}</span>
                                <span className="text-xs text-green-500 flex items-center gap-1 mt-auto">↑ Active session</span>
                            </div>
                            <div className="bg-[#1A1823] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-4 -mt-4 transition-all group-hover:bg-purple-500/10"></div>
                                <span className="text-sm font-medium text-gray-400 mb-1">Analyses Generated</span>
                                <span className="text-4xl font-light text-white my-2">{currentStep > 2 ? '1' : '0'}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-auto">Saved across {productId ? '1' : '0'} product(s)</span>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl shadow-blue-900/20 border border-blue-500/30">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                                <span className="text-sm font-medium text-white/80 mb-1 relative z-10">AI Superpower</span>
                                <h3 className="text-xl font-bold text-white relative z-10 mt-1">Switch to Pro Tier today!</h3>
                                <button onClick={handleBuyCredits} className="mt-auto relative z-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg py-2 text-sm font-medium transition-colors">
                                    View Pricing Plans
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Workflow Area */}
                    <div className="bg-[#1A1823] border border-white/5 rounded-3xl p-8 min-h-[500px] shadow-2xl relative">
                        <div className="absolute top-4 right-6 text-xs font-semibold tracking-widest text-gray-600 uppercase">
                            Step {currentStep} of 5
                        </div>

                        {currentStep === 1 && (
                            <FileUpload onUploadSuccess={handleFileUploadSuccess} initialProjectName={initialProjectName} onNext={() => setCurrentStep(2)} />
                        )}

                        {maxStepReached >= 2 && productId && (
                            <div className="fade-in">
                                {currentStep === 2 && (
                                    <MarketAnalysis
                                        productId={productId}
                                        onAnalysisComplete={handleMarketAnalysisComplete}
                                        onNext={() => setCurrentStep(3)}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <ProductPage
                                        productId={productId}
                                        credits={credits}
                                        onContentComplete={handleProductPageComplete}
                                        onNext={() => setCurrentStep(4)}
                                    />
                                )}
                                {currentStep === 4 && (
                                    <ImagePrompts
                                        productId={productId}
                                        credits={credits}
                                        onPromptsComplete={handleImagePromptsComplete}
                                        onNext={() => setCurrentStep(5)}
                                    />
                                )}
                                {currentStep === 5 && (
                                    <div className="flex flex-col gap-6">
                                        <AdCopy
                                            productId={productId}
                                            onAdCopyComplete={handleAdCopyComplete}
                                        />

                                        {isWorkflowComplete && (
                                            <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 mt-4 shadow-xl shadow-blue-900/10 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                        <CheckCircle2 size={20} className="text-blue-400" />
                                                        Workflow Complete
                                                    </h3>
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        {initialProjectName
                                                            ? "All assets have been automatically saved to your product folder."
                                                            : "Great job! Name your product to save all generated assets in your folder."}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 w-1/2 justify-end">
                                                    {!initialProjectName && (
                                                        <input
                                                            type="text"
                                                            placeholder="Enter product name..."
                                                            value={productName}
                                                            onChange={(e) => setProductName(e.target.value)}
                                                            className="flex-1 bg-[#13111C] border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={initialProjectName ? () => router.push(`/dashboard/products/${productId}`) : handleSaveProduct}
                                                        disabled={isSaving || (!initialProjectName && !productName.trim())}
                                                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 whitespace-nowrap min-w-[140px] justify-center"
                                                    >
                                                        {isSaving ? (
                                                            <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                                        ) : (
                                                            <><FolderOpen size={16} /> {initialProjectName ? 'Open Folder' : 'Save & Finish'}</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
