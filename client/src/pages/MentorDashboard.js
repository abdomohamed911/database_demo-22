import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function MentorDashboard() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [mentorInfo, setMentorInfo] = useState({});
    const [studentsData, setStudentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth || !auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchMentorData = async () => {
            try {
                const response = await api.get('/mentor_dashboard_data');
                setMentorInfo(response.data.mentor_info || {});
                setStudentsData(response.data.students || []);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch mentor data.');
                console.error('Mentor dashboard error:', err);
                setLoading(false);
            }
        };
        fetchMentorData();
    }, [auth, navigate]);

    if (!auth || !auth.isAuthenticated) {
        return null;
    }

    if (loading) return <div className="text-center py-8">Loading mentor dashboard...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-lg shadow-lg"
        >
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Mentor Dashboard</h1>
            <p className="text-lg text-gray-700 mb-6">Welcome, Mentor! (SSN: {auth.userSsn})</p>
            
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Mentor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="text-lg font-medium text-gray-800">{mentorInfo.mentor_type || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="text-lg font-medium text-gray-800">{mentorInfo.position || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Company/Institution</p>
                        <p className="text-lg font-medium text-gray-800">{mentorInfo.mentor_company || 'N/A'}</p>
                    </div>
                </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Assigned Students</h2>
            {studentsData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Student Name</th>
                                <th className="py-3 px-6 text-left">Student Email</th>
                                <th className="py-3 px-6 text-left">Company</th>
                                <th className="py-3 px-6 text-left">Start Date</th>
                                <th className="py-3 px-6 text-left">End Date</th>
                                <th className="py-3 px-6 text-left">Grade</th>
                                <th className="py-3 px-6 text-left">Comments</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {studentsData.map((student, index) => (
                                <motion.tr 
                                    key={student.ssn || index} 
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <td className="py-3 px-6 text-left">{student.student_name}</td>
                                    <td className="py-3 px-6 text-left">{student.student_email}</td>
                                    <td className="py-3 px-6 text-left">{student.company_name || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left">
                                        {student.start_date ? new Date(student.start_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {student.end_date ? new Date(student.end_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-3 px-6 text-left">{student.final_grade || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left">{student.comments || 'No comments'}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No students currently assigned to you.</p>
            )}
        </motion.div>
    );
}

export default MentorDashboard; 