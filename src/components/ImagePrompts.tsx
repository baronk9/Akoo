'use client';

import React, { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Download, Image as ImageIcon, Copy, Lock, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        onFinish: (prompt, completion) => {
            setCompleted(true);
            onPromptsComplete(completion);
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
        // Split by the delimiter "---" defined in the system prompt
        const rawSegments = text.split('---');
        return rawSegments.map((segment, index) => {
            const match = segment.match(/###\s*(Prompt \d+:.*?)\n([\s\S]*)/);
            if (match) {
                return {
                    id: `prompt-${index}`,
                    title: match[1].trim(),
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
                        <Lock size={20} className="text-blue-500" />
                        Image Prompts
                    </h2>
                    <p className="text-gray-400 mt-1">Ready-to-use prompts optimized for Nano Banana (Google).</p>
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
                            className="bg-green-600 hover:bg-green-500 text-white py-2.5 px-5 rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            Next: Ad Copy →
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
                        <p className="font-semibold mb-1 text-white">How to use with Nano Banana</p>
                        <p className="text-gray-400 leading-relaxed">Copy each prompt below and paste it directly into the prompt box in Google's Nano Banana tool. Set aspect ratio as preferred and enable high resolution.</p>
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
                                    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                        <span className="font-semibold text-white flex items-center gap-3">
                                            <ImageIcon size={18} className="text-blue-500" />
                                            {prompt.title}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(prompt.content, prompt.id)}
                                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10"
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
                            <div className="bg-[#13111C] p-8 rounded-2xl border border-white/5 whitespace-pre-wrap font-mono text-gray-300 text-sm shadow-inner">
                                {displayContent}
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
