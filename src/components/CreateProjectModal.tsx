'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [projectName, setProjectName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setIsSubmitting(true);
        // Route to the new workflow page, passing the name as a URL parameter
        router.push(`/dashboard/new?name=${encodeURIComponent(projectName.trim())}`);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="w-full max-w-lg bg-[#13111C] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Create new project</h2>
                                <p className="text-sm text-gray-400 mt-1">Kickstart an AI workflow for your product</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Project Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g., Q4 TikTok Winners — Men's Grooming Funnel"
                                    maxLength={50}
                                    autoFocus
                                    className="w-full bg-[#1A1823] border border-blue-500/30 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-blue-500/10 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors">
                                    <Sparkles size={12} /> Inspire me
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">Give your project a memorable name</p>
                                <p className="text-xs text-gray-600 font-medium">{projectName.length}/50</p>
                            </div>
                        </div>

                        <div className="bg-[#1A1823] border border-white/5 rounded-xl p-4 flex gap-3 mb-8">
                            <Sparkles size={18} className="text-purple-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-400 leading-relaxed">
                                <span className="text-gray-200 font-medium">AI Workflow</span> organizes your business strategy with intelligent market research, automated content generation, and contextual chat assistance.
                                <a href="#" className="text-blue-400 hover:text-blue-300 ml-2 font-medium">Learn more</a>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!projectName.trim() || isSubmitting}
                                className="flex-1 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles size={16} /> Create project
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
