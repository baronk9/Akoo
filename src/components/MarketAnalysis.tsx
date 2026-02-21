'use client';

import React, { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Download, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketAnalysisProps {
    productId: string;
    onAnalysisComplete: (analysisText: string) => void;
    existingAnalysis?: string | null;
    onNext: () => void;
}

export default function MarketAnalysis({ productId, onAnalysisComplete, existingAnalysis, onNext }: MarketAnalysisProps) {
    const [completed, setCompleted] = useState(!!existingAnalysis);

    const { completion, isLoading, complete } = useCompletion({
        api: '/api/market-analysis',
        streamProtocol: 'text',
        body: { productId },
        onFinish: (prompt, completion) => {
            setCompleted(true);
            onAnalysisComplete(completion);
        },
        onError: (error) => {
            console.error('Market analysis error:', error);
            alert('Failed to generate market analysis. Please try again.');
        },
    });

    const displayContent = existingAnalysis || completion;

    const handleDownload = () => {
        if (!displayContent) return;
        const blob = new Blob([displayContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market-analysis-${productId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">📊</span> Market Analysis
                    </h2>
                    <p className="text-gray-400 mt-1">10-section AI-powered market research based on your product data.</p>
                </div>

                {!displayContent && !isLoading && (
                    <button
                        onClick={() => complete('')}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Play size={18} /> Run Analysis (Free)
                    </button>
                )}

                {(completed || displayContent) && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            className="bg-white/5 hover:bg-white/10 text-gray-200 py-2.5 px-5 rounded-xl font-medium transition-all flex items-center gap-2 border border-white/10"
                        >
                            <Download size={18} /> Download Report
                        </button>
                        <button
                            onClick={onNext}
                            className="bg-green-600 hover:bg-green-500 text-white py-2.5 px-5 rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            Next: Product Page →
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isLoading && !displayContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10"
                    >
                        <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
                        <p className="text-xl font-semibold text-white">Gemini is analyzing your product...</p>
                        <p className="text-sm text-gray-400 mt-2">Generating 10-section market blueprint mapping.</p>
                    </motion.div>
                )}

                {displayContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-blue max-w-none w-full"
                    >
                        <div className="bg-[#13111C] p-8 rounded-2xl border border-white/5 max-h-[600px] overflow-y-auto whitespace-pre-wrap font-sans text-gray-200 leading-relaxed custom-scrollbar shadow-inner">
                            {displayContent}
                        </div>

                        {isLoading && (
                            <div className="flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium animate-pulse px-2">
                                <Loader2 size={16} className="animate-spin" /> Stream in progress...
                            </div>
                        )}

                        {completed && !isLoading && (
                            <div className="flex items-center gap-2 mt-4 text-green-400 text-sm font-medium px-2">
                                <CheckCircle2 size={16} /> Analysis complete and saved securely.
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
