import React from 'react';
import Link from 'next/link';
import { Shield, Users, LayoutDashboard, LogOut, Package } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-700">
                    <Shield className="w-6 h-6 text-purple-600 mr-2" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        Admin Panel
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <Users className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                        Users
                    </Link>
                    <Link href="/admin/products" className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                        <Package className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                        System Products
                    </Link>
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white rounded-lg">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" />
                        Exit to App
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
