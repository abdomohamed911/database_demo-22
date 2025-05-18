import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

function UsersListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users.');
                console.error('Users list error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="text-center py-8">Loading users...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">All System Users</h1>
            <p className="mb-4"><Link to="/admin" className="text-blue-500 hover:underline">Back to Admin Dashboard</Link></p>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">SSN</th>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Address</th>
                            <th className="py-3 px-6 text-left">Date of Birth</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm font-light">
                        {users.map((user, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{user.ssn}</td>
                                <td className="py-3 px-6 text-left">{user.name}</td>
                                <td className="py-3 px-6 text-left">{user.email}</td>
                                <td className="py-3 px-6 text-left">{user.address}</td>
                                <td className="py-3 px-6 text-left">{user.date_of_birth}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersListPage;