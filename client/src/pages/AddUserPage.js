import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function AddUserPage() {
    const [formData, setFormData] = useState({
        ssn: '',
        name: '',
        email: '',
        address: '',
        date_of_birth: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
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
            const response = await api.post('/add_user', formData);
            setMessage(response.data.message);
            setMessageType('success');
            setFormData({ ssn: '', name: '', email: '', address: '', date_of_birth: '' }); // Clear form
            navigate('/users-list'); // Redirect to user list after success
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to add user.');
            setMessageType('error');
            console.error('Add user error:', err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Add New User</h1>
            
            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="ssn" className="block text-gray-700 text-sm font-bold mb-2">SSN:</label>
                    <input type="text" id="ssn" name="ssn" value={formData.ssn} onChange={handleChange} required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                    <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-6">
                    <label htmlFor="date_of_birth" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth:</label>
                    <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Add User
                </button>
            </form>
            <p className="mt-4"><Link to="/admin" className="text-blue-500 hover:underline">Back to Admin Dashboard</Link></p>
        </div>
    );
}

export default AddUserPage;