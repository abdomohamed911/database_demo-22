import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function EvaluationSubmissionPage() {
    const [formData, setFormData] = useState({
        student_id: '',
        final_grade: '',
        comments: '',
        performance_score: '',
        evaluator_id: '',
        coordinator_id: ''
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
            const response = await api.post('/submit_evaluation', formData);
            setMessage(response.data.message);
            setMessageType('success');
            setFormData({
                student_id: '',
                final_grade: '',
                comments: '',
                performance_score: '',
                evaluator_id: '',
                coordinator_id: ''
            });
            navigate('/evaluator/evaluations');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit evaluation.');
            setMessageType('error');
            console.error('Evaluation submission error:', err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Submit Evaluation</h1>
            
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
                    <label htmlFor="final_grade" className="block text-gray-700 text-sm font-bold mb-2">Final Grade:</label>
                    <select
                        id="final_grade"
                        name="final_grade"
                        value={formData.final_grade}
                        onChange={handleChange}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D+">D+</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="performance_score" className="block text-gray-700 text-sm font-bold mb-2">Performance Score (0-100):</label>
                    <input
                        type="number"
                        id="performance_score"
                        name="performance_score"
                        value={formData.performance_score}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="comments" className="block text-gray-700 text-sm font-bold mb-2">Comments:</label>
                    <textarea
                        id="comments"
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                </div>

                <div>
                    <label htmlFor="evaluator_id" className="block text-gray-700 text-sm font-bold mb-2">Evaluator ID:</label>
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

                <div>
                    <label htmlFor="coordinator_id" className="block text-gray-700 text-sm font-bold mb-2">Coordinator ID:</label>
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

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                    Submit Evaluation
                </button>
            </form>
        </div>
    );
}

export default EvaluationSubmissionPage; 