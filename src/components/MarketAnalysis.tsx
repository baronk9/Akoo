'use client';

import React, { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Download, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

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
                        <div className="bg-[#13111C] p-8 rounded-2xl border border-white/5 max-h-[600px] overflow-y-auto font-sans text-gray-200 leading-relaxed custom-scrollbar shadow-inner">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mt-8 mb-4" {...props} />,
                                    h3: ({ node, ...props }) => {
                                        const text = String(props.children);
                                        const match = text.match(/^(\d+)\.?\s+(.*)$/);
                                        if (match) {
                                            return (
                                                <h3 className="flex items-center gap-3 text-lg font-semibold text-white mt-8 mb-4 tracking-wide uppercase">
                                                    <span className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-sm font-bold shadow-sm shadow-blue-500/20">
                                                        {match[1]}
                                                    </span>
                                                    {match[2]}
                                                </h3>
                                            );
                                        }
                                        return <h3 className="text-lg font-semibold text-white mt-6 mb-3" {...props} />;
                                    },
                                    h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-200 mt-4 mb-2" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-300 marker:text-gray-500" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-2 mb-6 text-gray-300 marker:text-gray-500" {...props} />,
                                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-blue-500 pl-4 italic text-gray-400 my-4" {...props} />,
                                    code: ({ node, className, ...props }) => {
                                        const isInline = !className;
                                        return isInline ?
                                            <code className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-xs font-medium" {...props} /> :
                                            <code className="block bg-white/5 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre my-4" {...props} />;
                                    }
                                }}
                            >
                                {displayContent}
                            </ReactMarkdown>
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
