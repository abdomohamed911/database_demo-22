import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function StudentRegistrationPage() {
    const [formData, setFormData] = useState({
        ssn: '',
        name: '',
        email: '',
        level: '',
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
            const response = await api.post('/register_student', formData);
            setMessage(response.data.message);
            setMessageType('success');
            setFormData({
                ssn: '',
                name: '',
                email: '',
                level: '',
                mentor_id: '',
                coordinator_id: '',
                evaluator_id: ''
            });
            navigate('/admin/students');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to register student.');
            setMessageType('error');
            console.error('Student registration error:', err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Student Registration</h1>
            
            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${
                    messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`} role="alert">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="ssn" className="block text-gray-700 text-sm font-bold mb-2">SSN:</label>
                    <input
                        type="text"
                        id="ssn"
                        name="ssn"
                        value={formData.ssn}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="level" className="block text-gray-700 text-sm font-bold mb-2">Level:</label>
                    <select
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select Level</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="mentor_id" className="block text-gray-700 text-sm font-bold mb-2">Mentor:</label>
                    <input
                        type="text"
                        id="mentor_id"
                        name="mentor_id"
                        value={formData.mentor_id}
                        onChange={handleChange}
                        required
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
                    Register Student
                </button>
            </form>
        </div>
    );
}

export default StudentRegistrationPage; 