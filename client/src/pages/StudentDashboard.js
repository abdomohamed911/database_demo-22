import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth || !auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchStudentData = async () => {
            try {
                const response = await api.get('/student_dashboard_data');
                setStudentData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch student data.');
                console.error('Student dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [auth, navigate]);

    if (!auth || !auth.isAuthenticated) {
        return null;
    }

    if (loading) return <div className="text-center py-8">Loading student dashboard...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Student Dashboard</h1>
            <p className="text-lg text-gray-700 mb-6">Welcome, Student! (SSN: {auth.userSsn})</p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Internship Details</h2>
            {studentData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Student ID</th>
                                <th className="py-3 px-6 text-left">Full Name</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-left">Grade</th>
                                <th className="py-3 px-6 text-left">Company Name</th>
                                <th className="py-3 px-6 text-left">Mentor Position</th>
                                <th className="py-3 px-6 text-left">Mentor Type</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {studentData.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{row.student_id}</td>
                                    <td className="py-3 px-6 text-left">{row.full_name}</td>
                                    <td className="py-3 px-6 text-left">{row.email}</td>
                                    <td className="py-3 px-6 text-left">{row.grade}</td>
                                    <td className="py-3 px-6 text-left">{row.company_name}</td>
                                    <td className="py-3 px-6 text-left">{row.mentor_position}</td>
                                    <td className="py-3 px-6 text-left">{row.mentor_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No internship details found for your SSN.</p>
            )}
        </div>
    );
}

export default StudentDashboard;