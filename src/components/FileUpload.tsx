'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
    onUploadSuccess: (product: { id: string; name: string; rawText: string }) => void;
    initialProjectName?: string;
    onNext: () => void;
}

export default function FileUpload({ onUploadSuccess, initialProjectName, onNext }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-invalid-type') {
                setError('Only .txt, .pdf, or image files are accepted.');
            } else if (rejection.errors[0].code === 'file-too-large') {
                setError('A file is too large. Maximum size is 50MB.');
            } else if (rejection.errors[0].code === 'too-many-files') {
                setError('You can only upload up to 2 files (e.g., 1 doc + 1 image).');
            } else {
                setError(rejection.errors[0].message);
            }
            return;
        }
        if (acceptedFiles.length > 0) {
            setFiles(prev => {
                const newFiles = [...prev, ...acceptedFiles];
                return newFiles.slice(0, 2); // Max 2 files
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 2,
    });

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        if (initialProjectName) {
            formData.append('projectName', initialProjectName);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload file');
            }

            onUploadSuccess(data.product);
            setUploadSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred during upload.');
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full flex-1 mx-auto flex flex-col justify-center">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Upload Product Info & Image</h2>
                <p className="text-gray-400 max-w-lg mx-auto">Provide a .txt or .pdf file containing details, and an optional product image to enhance AI generation.</p>
            </div>

            <div
                {...getRootProps()}
                className={`relative mx-auto w-full max-w-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px]
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10'}
          ${files.length > 0 && !isDragActive ? 'border-green-500/50 bg-green-500/10' : ''}
        `}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {files.length === 0 ? (
                        <motion.div
                            key="upload-prompt"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center text-center w-full"
                        >
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg mb-6 text-blue-400">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-lg font-semibold text-gray-200">
                                Drag & drop up to 2 files here
                            </p>
                            <p className="text-sm text-gray-500 mt-2">1 Text/PDF document & 1 Product Image</p>
                            <p className="text-xs font-medium text-gray-400 mt-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                                TXT, PDF, JPG, PNG up to 50MB
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-wrap justify-center gap-6 w-full"
                        >
                            {files.map((f, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center p-4 bg-[#1A1823] rounded-xl border border-white/10 w-48 relative">
                                    <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center shadow-lg mb-4 text-green-400 relative">
                                        <FileText size={20} />
                                        <div className="absolute -bottom-1 -right-1 bg-[#1A1823] rounded-full p-[2px] shadow-sm">
                                            <CheckCircle2 size={12} className="text-green-500 fill-current" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-white truncate w-full px-2" title={f.name}>
                                        {f.name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {(f.size / 1024).toFixed(1)} KB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFiles(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="mt-4 text-xs text-red-400 font-medium hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-full absolute -top-2 -right-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="max-w-2xl mx-auto mt-4 p-4 bg-red-500/10 text-red-400 rounded-xl flex items-start gap-3 border border-red-500/20"
                    >
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 text-center text-sm">
                <p className="text-gray-400">
                    Not sure what to upload?{' '}
                    <a
                        href="https://docs.google.com/document/d/1YJyLD2pZT_tMm2RdS7hBr-7zUn-dCymtMdnRnY_zYPg/edit?tab=t.0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 transition-colors group"
                    >
                        <FileText size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                        View Example Template
                    </a>
                </p>
            </div>

            <div className="mt-8 flex justify-center w-full max-w-2xl mx-auto">
                {uploadSuccess ? (
                    <button
                        onClick={onNext}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        Next: Market Analysis →
                    </button>
                ) : (
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0 || isUploading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            'Confirm & Continue'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
