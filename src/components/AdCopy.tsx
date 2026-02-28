'use client';

import React, { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Download, Megaphone, Copy, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface AdCopyProps {
    productId: string;
    onAdCopyComplete: (text: string) => void;
    existingAdCopy?: string | null;
}

export default function AdCopy({ productId, onAdCopyComplete, existingAdCopy }: AdCopyProps) {
    const [completed, setCompleted] = useState(!!existingAdCopy);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { completion, isLoading, complete, error } = useCompletion({
        api: '/api/ad-copy',
        streamProtocol: 'text',
        body: { productId },
        onFinish: async (prompt, completion) => {
            setCompleted(true);
            onAdCopyComplete(completion);

            // Save from client to ensure Vercel doesn't kill the background process
            try {
                await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adCopy: completion }),
                });
            } catch (err) {
                console.error('Save failed:', err);
            }
        },
    });

    const displayContent = existingAdCopy || completion;

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDownloadAll = () => {
        if (!displayContent) return;
        const blob = new Blob([displayContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ad-copy-${productId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const parseAds = (text: string) => {
        if (!text) return [];
        const segments = text.split('---');
        return segments.map((segment, index) => {
            const titleMatch = segment.match(/###\s*(.*?)\n/);
            if (!titleMatch) return null;

            const primaryTextMatch = segment.match(/\*\*Primary Text:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
            const headlineMatch = segment.match(/\*\*Headline:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
            const descriptionMatch = segment.match(/\*\*Description:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
            const ctaMatch = segment.match(/\*\*CTA:\*\*\s*([\s\S]*?)(?=\*\*|$)/);

            return {
                id: `ad-${index}`,
                title: titleMatch[1].trim(),
                primaryText: primaryTextMatch ? primaryTextMatch[1].trim() : '',
                headline: headlineMatch ? headlineMatch[1].trim() : '',
                description: descriptionMatch ? descriptionMatch[1].trim() : '',
                cta: ctaMatch ? ctaMatch[1].trim() : '',
                raw: segment.trim()
            };
        }).filter(Boolean);
    };

    const parsedAds = parseAds(displayContent);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Megaphone size={20} className="text-blue-500" />
                        Facebook & Instagram Ads
                    </h2>
                    <p className="text-gray-400 mt-1">High-converting ad copy formatted for immediate campaign launch.</p>
                </div>

                {!displayContent && !isLoading && (
                    <button
                        onClick={() => complete('')}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Play size={18} /> Generate Ads (Free)
                    </button>
                )}

                {(completed || displayContent) && (
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Step 5 of 5</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => complete('')}
                                disabled={isLoading}
                                className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 py-2.5 px-5 rounded-xl text-sm font-medium transition-all"
                            >
                                Regenerate
                            </button>
                            <button
                                onClick={handleDownloadAll}
                                className="bg-white/5 hover:bg-white/10 text-white py-2.5 px-5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border border-white/10"
                            >
                                <Download size={16} /> Download All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 text-red-400 bg-red-500/10 rounded-xl text-sm font-medium border border-red-500/20">
                    {error.message || 'Error executing request'}
                </div>
            )}

            <AnimatePresence mode="wait">
                {isLoading && !displayContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10"
                    >
                        <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
                        <p className="text-xl font-semibold text-white">Synthesizing winning ad angles...</p>
                        <p className="text-sm text-gray-400 mt-2">Writing direct-response copy based on Market Analysis.</p>
                    </motion.div>
                )}

                {displayContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {parsedAds.length > 0 ? (
                            parsedAds.map((ad: { id: string, title: string, primaryText: string, headline: string, description: string, cta: string, raw: string } | null) => (
                                ad && (
                                    <div key={ad.id} className="bg-[#13111C] border border-white/5 shadow-inner rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors flex flex-col">
                                        <div className="bg-[#181622]/30 px-5 py-4 border-b border-white/5 flex justify-between items-center">
                                            <span className="font-semibold text-white text-sm">
                                                {ad.title}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(ad.raw, ad.id)}
                                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
                                            >
                                                {copiedId === ad.id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                                {copiedId === ad.id ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <div className="p-6 flex-grow text-sm flex flex-col gap-4">
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Primary Text</span>
                                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{ad.primaryText}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 mt-auto">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Headline</span>
                                                <p className="font-semibold text-white mb-4 text-base">{ad.headline}</p>

                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Description</span>
                                                <p className="text-gray-400 mb-4">{ad.description}</p>

                                                <div className="mt-2 inline-block bg-blue-500/10 text-blue-400 font-medium px-4 py-1.5 rounded-lg border border-blue-500/20 text-xs shadow-sm">
                                                    CTA: {ad.cta}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 bg-[#13111C] p-8 rounded-2xl border border-white/5 font-sans text-gray-200 text-sm leading-relaxed custom-scrollbar max-h-[600px] overflow-y-auto shadow-inner">
                                <ReactMarkdown
                                    components={{
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-6 mb-3" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h3: ({ node, ...props }) => {
                                            const text = String(props.children);
                                            const match = text.match(/^(\d+)\.?\s+(.*)$/);
                                            if (match) {
                                                return (
                                                    <h3 className="flex items-center gap-2 text-base font-semibold text-white mt-6 mb-3 tracking-wide uppercase">
                                                        <span className="bg-blue-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-500/20">
                                                            {match[1]}
                                                        </span>
                                                        {match[2]}
                                                    </h3>
                                                );
                                            }
                                            return <h3 className="text-base font-semibold text-white mt-5 mb-2" {...props} />;
                                        },
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h4: ({ node, ...props }) => <h4 className="font-semibold text-gray-200 mt-4 mb-2" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-300 marker:text-gray-500" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-gray-300 marker:text-gray-500" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-blue-500 pl-3 italic text-gray-400 my-3" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        code: ({ node, className, ...props }) => {
                                            const isInline = !className;
                                            return isInline ?
                                                <code className="bg-white/10 text-gray-300 px-1 py-0.5 rounded text-xs font-medium" {...props} /> :
                                                <code className="block bg-white/5 p-3 rounded-xl text-xs overflow-x-auto whitespace-pre my-3" {...props} />;
                                        }
                                    }}
                                >
                                    {displayContent}
                                </ReactMarkdown>
                            </div>
                        )}

                        {isLoading && (
                            <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2 text-blue-400 text-sm font-medium animate-pulse px-2">
                                <Loader2 size={16} className="animate-spin" /> Receiving AI ad variants stream...
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
