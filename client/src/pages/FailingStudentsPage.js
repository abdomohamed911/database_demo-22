import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

function FailingStudentsPage() {
    const [failingCount, setFailingCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFailingStudents = async () => {
            try {
                const response = await api.get('/failing_students_count');
                setFailingCount(response.data.failing_students_count);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch failing students count.');
                console.error('Failing students count error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFailingStudents();
    }, []);

    if (loading) return <div className="text-center py-8">Loading count...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Failing Students Count</h1>
            <p className="mb-4"><Link to="/admin" className="text-blue-500 hover:underline">Back to Admin Dashboard</Link></p>
            
            <p className="text-xl text-gray-700">
                The total number of students with a final grade of 'F' is: 
                <strong className="text-blue-600 text-2xl ml-2">{failingCount}</strong>
            </p>
        </div>
    );
}

export default FailingStudentsPage;