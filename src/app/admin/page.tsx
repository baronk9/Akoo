'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Edit2, Save, X } from 'lucide-react';

interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    credits: number;
    createdAt: string;
    _count: { products: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCredits, setEditCredits] = useState<number>(0);
    const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to load users');
            const data = await res.json();
            setUsers(data.users);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setEditingId(user.id);
        setEditCredits(user.credits);
        setEditRole(user.role);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveUser = async (userId: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, credits: editCredits, role: editRole })
            });

            if (!res.ok) throw new Error('Failed to update user');

            const data = await res.json();
            setUsers(users.map(u => u.id === userId ? { ...u, role: data.user.role, credits: data.user.credits } : u));
            setEditingId(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('An unknown error occurred');
            }
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center">Loading users...</div>;
    if (error) return <div className="text-red-500 flex items-center"><ShieldAlert className="mr-2" /> {error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-gray-500 dark:text-gray-400">View and manage all registered users.</p>
            </div>

            <div className="bg-white dark:bg-zinc-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products Gened</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === user.id ? (
                                        <select
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value as 'USER' | 'ADMIN')}
                                            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-300'}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {editingId === user.id ? (
                                        <input
                                            type="number"
                                            min="0"
                                            value={editCredits}
                                            onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                                            className="block w-20 pl-3 pr-3 py-1 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                                        />
                                    ) : (
                                        <span className="font-mono">{user.credits}</span>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {user._count.products}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingId === user.id ? (
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleSaveUser(user.id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
