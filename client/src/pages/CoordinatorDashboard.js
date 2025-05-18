import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

function CoordinatorDashboard() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [coordinatorData, setCoordinatorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth || !auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchCoordinatorData = async () => {
            try {
                const response = await api.get('/coordinator_dashboard_data');
                setCoordinatorData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch coordinator data.');
                console.error('Coordinator dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoordinatorData();
    }, [auth, navigate]);

    if (!auth || !auth.isAuthenticated) {
        return null;
    }

    if (loading) return <div className="text-center py-8">Loading coordinator dashboard...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Internship Coordinator Dashboard</h1>
            <p className="text-lg text-gray-700 mb-6">Welcome, Coordinator! (SSN: {auth.userSsn})</p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Reports Overview</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Coordinator Name</th>
                            <th className="py-3 px-6 text-left">Student Name</th>
                            <th className="py-3 px-6 text-left">Report Grade</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm font-light">
                        {coordinatorData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{row.coordinator_name}</td>
                                <td className="py-3 px-6 text-left">{row.student_name}</td>
                                <td className="py-3 px-6 text-left">{row.report_grade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CoordinatorDashboard;