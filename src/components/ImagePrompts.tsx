'use client';

import React, { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Download, Image as ImageIcon, Copy, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ImagePromptsProps {
    productId: string;
    onPromptsComplete: (text: string) => void;
    existingPrompts?: string | null;
    credits: number;
    onNext?: () => void;
}

export default function ImagePrompts({ productId, onPromptsComplete, existingPrompts, credits, onNext }: ImagePromptsProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
    const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});

    // New Create Image Form State
    const [formPrompt, setFormPrompt] = useState('');
    const [formAspectRatio, setFormAspectRatio] = useState('1:1');
    const [formResolution, setFormResolution] = useState('1K');
    const [formFormat, setFormFormat] = useState('PNG');
    const [formImage, setFormImage] = useState<File | null>(null);
    const [isGeneratingOutput, setIsGeneratingOutput] = useState(false);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [imageHistory, setImageHistory] = useState<string[]>([]);

    // Load initial history when component mounts or productId changes
    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.product && data.product.generatedImages) {
                    setImageHistory(data.product.generatedImages);
                    // Select most recent as output
                    if (data.product.generatedImages.length > 0 && !outputImage) {
                        setOutputImage(data.product.generatedImages[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to load history:", err);
            }
        };
        fetchHistory();
    }, [productId, outputImage]);

    const togglePrompt = (id: string) => {
        setExpandedPrompts(prev => ({
            ...prev,
            [id]: prev[id] === false ? true : false
        }));
    };

    const { completion, isLoading, complete, error } = useCompletion({
        api: '/api/image-prompts',
        streamProtocol: 'text',
        body: { productId },
        onFinish: async (prompt, completion) => {
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

    const [generationError, setGenerationError] = useState<string | null>(null);

    const handleRunGeneration = async () => {
        if (!formPrompt) {
            setGenerationError("Please enter a text description for the image.");
            return;
        }

        setIsGeneratingOutput(true);
        setGenerationError(null);

        try {
            // STEP 1: Fetch the uploaded product image to use as a reference
            const productRes = await fetch(`/api/products/${productId}`);
            const productData = await productRes.json();

            let baseImageObj = undefined;
            const pd = productData.product as { imageBase64?: string };
            if (pd && pd.imageBase64) {
                const parts = pd.imageBase64.split(',');
                const rawBase64 = parts.length === 2 ? parts[1] : parts[0];
                if (rawBase64) {
                    baseImageObj = { bytesBase64Encoded: rawBase64 };
                }
            }

            // If the user uploaded a custom file in the new form, use it
            if (formImage) {
                const reader = new FileReader();
                reader.readAsDataURL(formImage);
                await new Promise((resolve, reject) => {
                    reader.onloadend = () => {
                        if (!reader.result) return resolve(null);
                        const base64data = (reader.result as string).split(',')[1];
                        baseImageObj = { bytesBase64Encoded: base64data };
                        resolve(null);
                    };
                    reader.onerror = reject;
                });
            }

            const safePrompt = formPrompt.substring(0, 1500);

            const payload: Record<string, unknown> = {
                instances: [{ prompt: safePrompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: formAspectRatio
                }
            };

            if (formFormat === 'JPG') {
                (payload.parameters as Record<string, unknown>).outputOptions = { mimeType: "image/jpeg" };
            }

            // Use editConfig with product-image mode if we have a base image
            if (baseImageObj) {
                (payload.parameters as Record<string, unknown>).editConfig = {
                    editMode: 'product-image',
                    baseImage: baseImageObj
                };
            }

            let data: Record<string, unknown> | null = null;
            let retries = 0;
            const maxRetries = 3;
            let responseOk = false;

            while (!responseOk && retries <= maxRetries) {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                try {
                    data = await response.json() as Record<string, unknown>;
                } catch {
                    throw new Error(`API returned invalid JSON. Status: ${response.status}`);
                }

                if (!response.ok || (data && data.error)) {
                    const errObj = data?.error as { code?: number; message?: string } | undefined;
                    if (errObj?.code === 429 && retries < maxRetries) {
                        retries++;
                        console.warn(`Nano Banana API capacity reached, retrying in ${retries * 2}s...`);
                        await new Promise(r => setTimeout(r, retries * 2000));
                        continue;
                    }
                    const errorMessage = errObj?.message || `HTTP ${response.status} - Unknown API error`;
                    console.error("Nano Banana Pro API error details:", data);
                    throw new Error(errorMessage);
                }
                responseOk = true;
            }

            if (data?.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
                const pred = data.predictions[0] as { bytesBase64Encoded: string; mimeType?: string };
                const base64Image = pred.bytesBase64Encoded;
                const mimeType = pred.mimeType || (formFormat === 'JPG' ? 'image/jpeg' : 'image/png');
                const imageUri = `data:${mimeType};base64,${base64Image}`;

                setOutputImage(imageUri);

                // Update history and save to DB
                const newHistory = [imageUri, ...imageHistory];
                setImageHistory(newHistory);

                // Fire-and-forget save to backend
                fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ generatedImages: newHistory }),
                }).catch(err => console.error("Failed to save image history:", err));

            } else {
                throw new Error("No image generated by Nano Banana Pro.");
            }

        } catch (err) {
            console.error("Image generation flow error:", err);
            setGenerationError(err instanceof Error ? err.message : "Capacity exceeded. Try again later.");
        } finally {
            setIsGeneratingOutput(false);
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
                    <p className="text-gray-400 mt-1">Ready-to-use Nanobanana pro prompts with relevant variations generated.</p>
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
                        {onNext && (
                            <button
                                onClick={onNext}
                                className="bg-green-600 hover:bg-green-500 text-white py-2.5 px-5 rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all flex items-center gap-2 border border-green-500/50"
                            >
                                Finish / Go To Next Step →
                            </button>
                        )}
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
                        <p className="font-semibold mb-1 text-white">Nanobanana pro Best Practices</p>
                        <p className="text-gray-400 leading-relaxed">Copy each of the prompts below directly into Nanobanana pro, Discord bot or other capable text-to-image generator tool to achieve the most accurate representation of the desired output based on your product variables.</p>
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
                            parsedPrompts.map((prompt: { id: string, title: string, content: string } | null, index: number) => {
                                if (!prompt) return null;
                                const isExpanded = expandedPrompts[prompt.id] !== false;
                                return (
                                    <div key={prompt.id || index} className="bg-[#13111C] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors shadow-inner">
                                        <div
                                            className="bg-[#181622]/30 px-6 py-4 border-b border-white/5 flex justify-between items-center cursor-pointer select-none"
                                            onClick={() => togglePrompt(prompt.id)}
                                        >
                                            <span className="font-semibold text-white flex items-center gap-3">
                                                <ImageIcon size={18} className="text-blue-500" />
                                                {prompt.title}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(prompt.content, prompt.id);
                                                        setFormPrompt(prompt.content);
                                                    }}
                                                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
                                                >
                                                    {copiedPromptId === prompt.id ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                                    {copiedPromptId === prompt.id ? 'Use Prompt' : 'Use Prompt'}
                                                </button>
                                                <div className="text-gray-400 hover:text-white transition-colors">
                                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </div>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                                        {prompt.content}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="bg-[#13111C] p-8 rounded-2xl border border-white/5 font-mono text-gray-200 text-sm shadow-inner">
                                <ReactMarkdown
                                    components={{
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h3: ({ node, ...props }) => {
                                            const text = String(props.children);
                                            const match = text.match(/^(\d+)\.?\s+(.*)$/);
                                            if (match) {
                                                return (
                                                    <h3 className="flex items-center gap-3 text-base font-semibold text-white mt-6 mb-3 tracking-wide uppercase">
                                                        <span className="bg-blue-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-500/20">
                                                            {match[1]}
                                                        </span>
                                                        {match[2]}
                                                    </h3>
                                                );
                                            }
                                            return <h3 className="text-sm font-semibold text-white mt-4 mb-2 font-sans" {...props} />;
                                        },
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        h4: ({ node, ...props }) => <h4 className="font-semibold text-gray-200 mt-3 mb-2 font-sans text-sm" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-300 marker:text-gray-500 font-sans" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-gray-300 marker:text-gray-500 font-sans" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-blue-500 pl-3 italic text-gray-400 my-3 font-sans" {...props} />,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

                        {/* CREATE IMAGE SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            {/* LEFT SIDE: INPUT FORM */}
                            <div className="bg-[#1C1A27] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-[#242133]">
                                    <h3 className="font-bold text-white text-lg">Input</h3>
                                    <div className="flex bg-[#13111C] p-1 rounded-lg">
                                        <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-white">Form</button>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-5">
                                    {/* Prompt Field */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            prompt <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formPrompt}
                                            onChange={(e) => setFormPrompt(e.target.value)}
                                            className="w-full h-32 bg-[#13111C] border border-white/10 rounded-xl p-3 text-sm text-gray-200 outline-none focus:border-blue-500/50 resize-y"
                                            placeholder="A text description of the image you want to generate"
                                        />
                                        <p className="text-xs text-gray-500">A text description of the image you want to generate</p>
                                    </div>

                                    {/* Image Input Field */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-300">image_input</label>
                                        <div className="h-32 border border-dashed border-white/20 rounded-xl bg-[#13111C] flex flex-col items-center justify-center gap-3 relative hover:bg-white/5 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/jpeg, image/png, image/webp"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setFormImage(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <ImageIcon size={20} className="text-gray-400" />
                                            </div>
                                            {formImage ? (
                                                <span className="text-sm text-white font-medium">{formImage.name}</span>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-300">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, WEBP. Maximum file size: 30MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Aspect Ratio */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-300">aspect_ratio</label>
                                        <select
                                            value={formAspectRatio}
                                            onChange={(e) => setFormAspectRatio(e.target.value)}
                                            className="w-full bg-[#13111C] border border-white/10 rounded-xl p-3 text-sm text-gray-200 outline-none focus:border-blue-500/50 appearance-none"
                                        >
                                            <option value="1:1">1:1</option>
                                            <option value="16:9">16:9</option>
                                            <option value="9:16">9:16</option>
                                            <option value="4:3">4:3</option>
                                        </select>
                                    </div>

                                    {/* Resolution */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-300">resolution</label>
                                        <div className="flex gap-3">
                                            {['1K', '2K', '4K'].map(res => (
                                                <button
                                                    key={res}
                                                    onClick={() => setFormResolution(res)}
                                                    className={`px-6 py-2 rounded-lg text-sm font-medium border ${formResolution === res ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                                                >
                                                    {res}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Output Format */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-300">output_format</label>
                                        <div className="flex gap-3">
                                            {['PNG', 'JPG'].map(fmt => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => setFormFormat(fmt)}
                                                    className={`px-6 py-2 rounded-lg text-sm font-medium border ${formFormat === fmt ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                                                >
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 border-t border-white/10 bg-[#242133] flex justify-end gap-4 mt-auto">
                                    <button
                                        className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5"
                                        onClick={() => {
                                            setFormPrompt('');
                                            setFormImage(null);
                                        }}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleRunGeneration}
                                        disabled={isGeneratingOutput}
                                        className="px-6 py-2.5 rounded-xl bg-[#2A6FF0] hover:bg-[#2055C1] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isGeneratingOutput ? <Loader2 size={16} className="animate-spin" /> : <span>✨</span>}
                                        18 Run
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT SIDE: OUTPUT FORM */}
                            <div className="bg-[#1C1A27] border border-white/10 rounded-2xl flex flex-col shadow-xl">
                                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-[#242133]">
                                    <h3 className="font-bold text-white text-lg">Output</h3>
                                    <div className="flex bg-[#13111C] p-1 rounded-lg">
                                        <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-white">Preview</button>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-6 flex-1">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-sm text-gray-400">output type</span>
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-md font-medium">image</span>
                                    </div>

                                    {generationError && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium">
                                            <p className="font-bold mb-1">Generation Failed</p>
                                            <p>{generationError}</p>
                                        </div>
                                    )}

                                    <div className="flex-1 bg-[#13111C] border border-white/5 rounded-xl flex items-center justify-center p-4 relative overflow-hidden min-h-[300px]">
                                        {isGeneratingOutput ? (
                                            <div className="flex flex-col items-center gap-4 text-blue-500">
                                                <Loader2 size={40} className="animate-spin" />
                                                <p className="text-sm font-medium">Generating via Nano Banana Pro...</p>
                                            </div>
                                        ) : outputImage ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={outputImage} alt="Generated output" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                        ) : (
                                            <p className="text-gray-500 text-sm">No output yet. Fill the left form and hit Run.</p>
                                        )}
                                    </div>

                                    {outputImage && (
                                        <div className="flex justify-end gap-3 mt-auto">
                                            <button
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = outputImage;
                                                    a.download = `nano-banana-pro-generation.${formFormat.toLowerCase()}`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                }}
                                                className="w-10 h-10 rounded-xl bg-[#2A6FF0] hover:bg-[#2055C1] text-white flex items-center justify-center flex-shrink-0"
                                            >
                                                <Download size={18} />
                                            </button>
                                            {imageHistory.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        // Simple cycle through history for viewing
                                                        const currentIndex = imageHistory.indexOf(outputImage || '');
                                                        const nextIndex = (currentIndex + 1) % imageHistory.length;
                                                        setOutputImage(imageHistory[nextIndex]);
                                                    }}
                                                    className="px-5 py-2 rounded-xl border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-sm font-medium flex items-center gap-2"
                                                >
                                                    View Older Generation ({imageHistory.length - 1} more)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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
