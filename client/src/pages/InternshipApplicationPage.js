import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function InternshipApplicationPage() {
    const [formData, setFormData] = useState({
        student_id: '',
        company_name: '',
        start_date: '',
        end_date: '',
        mentor_id: '',
        coordinator_id: '',
        evaluator_id: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            const response = await api.post('/apply_internship', formData);
            setMessage(response.data.message);
            setMessageType('success');
            setFormData({
                student_id: '',
                company_name: '',
                start_date: '',
                end_date: '',
                mentor_id: '',
                coordinator_id: '',
                evaluator_id: ''
            });
            navigate('/student/applications');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit internship application.');
            setMessageType('error');
            console.error('Internship application error:', err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Internship Application</h1>
            
            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${
                    messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`} role="alert">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="student_id" className="block text-gray-700 text-sm font-bold mb-2">Student ID:</label>
                    <input
                        type="text"
                        id="student_id"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="company_name" className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                    <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="end_date" className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
                    <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="mentor_id" className="block text-gray-700 text-sm font-bold mb-2">Preferred Mentor:</label>
                    <input
                        type="text"
                        id="mentor_id"
                        name="mentor_id"
                        value={formData.mentor_id}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="coordinator_id" className="block text-gray-700 text-sm font-bold mb-2">Coordinator:</label>
                    <input
                        type="text"
                        id="coordinator_id"
                        name="coordinator_id"
                        value={formData.coordinator_id}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="evaluator_id" className="block text-gray-700 text-sm font-bold mb-2">Evaluator:</label>
                    <input
                        type="text"
                        id="evaluator_id"
                        name="evaluator_id"
                        value={formData.evaluator_id}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                    Submit Application
                </button>
            </form>
        </div>
    );
}

export default InternshipApplicationPage; 