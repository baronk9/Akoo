'use client';

import React, { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Download, Image as ImageIcon, Copy, Lock, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ImagePromptsProps {
    productId: string;
    onPromptsComplete: (text: string) => void;
    existingPrompts?: string | null;
    credits: number;
    onNext: () => void;
}

export default function ImagePrompts({ productId, onPromptsComplete, existingPrompts, credits, onNext }: ImagePromptsProps) {
    const [completed, setCompleted] = useState(!!existingPrompts);
    const [showConfirm, setShowConfirm] = useState(false);
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

    const { completion, isLoading, complete, error } = useCompletion({
        api: '/api/image-prompts',
        streamProtocol: 'text',
        body: { productId },
        onFinish: async (prompt, completion) => {
            setCompleted(true);
            onPromptsComplete(completion);

            // Save from client to ensure Vercel doesn't kill the background process
            try {
                await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagePrompts: completion }),
                });
            } catch (err) {
                console.error('Save failed:', err);
            }
        },
    });

    const displayContent = existingPrompts || completion;
    const isGenerating = isLoading;

    const handleGenerate = () => {
        setShowConfirm(false);
        complete('');
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedPromptId(id);
        setTimeout(() => setCopiedPromptId(null), 2000);
    };

    const parsePrompts = (text: string) => {
        if (!text) return [];

        // Support for old "---" delimiter format
        if (text.includes('---')) {
            const rawSegments = text.split('---');
            return rawSegments.map((segment, index) => {
                const match = segment.match(/###\s*(Prompt \d+:.*?)\n([\s\S]*)/);
                if (match) {
                    return {
                        id: `prompt-${index}`,
                        title: match[1].replace(/\*\*/g, '').trim(),
                        content: match[2].trim()
                    };
                }
                return null;
            }).filter(Boolean);
        }

        // Support for new format: "IMAGE 1 — TITLE\nPrompt content" or "**IMAGE 1 — TITLE**\nPrompt content"
        const newSegments = text.split(/(?=\**IMAGE \d+\s*—\s*[^\n]+)/);
        return newSegments.map((segment, index) => {
            const match = segment.match(/(\**IMAGE \d+\s*—\s*[^\n]+)\n([\s\S]*)/);
            if (match) {
                return {
                    id: `prompt-${index}`,
                    title: match[1].replace(/\*\*/g, '').trim(),
                    content: match[2].trim()
                };
            }
            return null;
        }).filter(Boolean);
    };

    const handleCopyAll = () => {
        if (displayContent) {
            const strippedText = displayContent.replace(/---/g, '\n\n');
            handleCopy(strippedText, 'all');
        }
    };

    const parsedPrompts = parsePrompts(displayContent);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ImageIcon size={20} className="text-blue-500" />
                        Image Prompts
                    </h2>
                    <p className="text-gray-400 mt-1">Ready-to-use Midjourney prompts with relevant variations generated.</p>
                </div>

                {!displayContent && !isLoading && !showConfirm && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={credits < 1}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate Prompts (1 Credit)
                    </button>
                )}

                {parsedPrompts.length > 0 && !isLoading && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyAll}
                            className="bg-white/5 hover:bg-white/10 text-gray-200 py-2.5 px-5 rounded-xl font-medium transition-all flex items-center gap-2 border border-white/10"
                        >
                            {copiedPromptId === 'all' ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                            {copiedPromptId === 'all' ? 'Copied All!' : 'Copy All'}
                        </button>
                        <button
                            onClick={onNext}
                            className="bg-green-600 hover:bg-green-500 text-white py-2.5 px-5 rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all flex items-center gap-2 border border-green-500/50"
                        >
                            Finish And Save →
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 text-red-400 bg-red-500/10 rounded-xl text-sm font-medium border border-red-500/20">
                    {error.message || 'Error executing request'}
                </div>
            )}

            {showConfirm && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center mb-8"
                >
                    <h3 className="text-lg font-bold text-blue-400 mb-2">Confirm Credit Deduction</h3>
                    <p className="text-gray-300 mb-6">You currently have <span className="font-bold text-white">{credits} credits</span>. This will consume 1 credit. Proceed?</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setShowConfirm(false)} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
                        <button onClick={handleGenerate} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:bg-blue-500 shadow-blue-500/20 transition-all">Confirm</button>
                    </div>
                </motion.div>
            )}

            {/* Instructions Panel */}
            {displayContent && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl flex items-start gap-4 mb-6">
                    <Info className="text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-1 text-white">Midjourney Best Practices</p>
                        <p className="text-gray-400 leading-relaxed">Copy each of the prompts below directly into Midjourney, Discord bot or other capable text-to-image generator tool to achieve the most accurate representation of the desired output based on your product variables.</p>
                    </div>
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
                        <p className="text-xl font-semibold text-white">Engineering creative prompts...</p>
                        <p className="text-sm text-gray-400 mt-2">Optimizing lighting, style, and composition for your target persona.</p>
                    </motion.div>
                )}

                {displayContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
                        {parsedPrompts.length > 0 ? (
                            parsedPrompts.map((prompt: any) => (
                                <div key={prompt.id} className="bg-[#13111C] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors shadow-inner">
                                    <div className="bg-[#181622]/30 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                        <span className="font-semibold text-white flex items-center gap-3">
                                            <ImageIcon size={18} className="text-blue-500" />
                                            {prompt.title}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(prompt.content, prompt.id)}
                                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
                                        >
                                            {copiedPromptId === prompt.id ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                            {copiedPromptId === prompt.id ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="p-6 text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {prompt.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#13111C] p-8 rounded-2xl border border-white/5 font-mono text-gray-200 text-sm shadow-inner">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-5 mb-3 border-b border-white/10 pb-2 font-sans" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-base font-bold text-white mt-5 mb-3 font-sans" {...props} />,
                                        h3: ({ node, ...props }) => {
                                            const text = String(props.children);
                                            const match = text.match(/^(\d+)\.?\s+(.*)$/);
                                            if (match) {
                                                return (
                                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white mt-5 mb-3 tracking-wide uppercase font-sans">
                                                        <span className="bg-blue-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-500/20">
                                                            {match[1]}
                                                        </span>
                                                        {match[2]}
                                                    </h3>
                                                );
                                            }
                                            return <h3 className="text-sm font-semibold text-white mt-4 mb-2 font-sans" {...props} />;
                                        },
                                        h4: ({ node, ...props }) => <h4 className="font-semibold text-gray-200 mt-3 mb-2 font-sans text-sm" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-300 marker:text-gray-500 font-sans" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-gray-300 marker:text-gray-500 font-sans" {...props} />,
                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-blue-500 pl-3 italic text-gray-400 my-3 font-sans" {...props} />,
                                        code: ({ node, className, ...props }) => {
                                            const isInline = !className;
                                            return isInline ?
                                                <code className="bg-white/10 text-gray-300 px-1 py-0.5 rounded text-xs font-medium font-mono" {...props} /> :
                                                <code className="block bg-white/5 p-3 rounded-xl text-xs overflow-x-auto whitespace-pre my-3 font-mono" {...props} />;
                                        }
                                    }}
                                >
                                    {displayContent}
                                </ReactMarkdown>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex items-center gap-2 mt-2 text-blue-400 text-sm font-medium animate-pulse px-2">
                                <Loader2 size={16} className="animate-spin" /> Receiving AI prompt stream...
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
