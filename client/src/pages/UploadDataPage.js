import React, { useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

function UploadDataPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setMessageType('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setMessageType('');

        if (!selectedFile) {
            setMessage('Please select a file to upload.');
            setMessageType('error');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post('/upload_data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message);
            setMessageType('success');
            setSelectedFile(null); // Clear selected file
        } catch (err) {
            setMessage(err.response?.data?.message || 'File upload failed.');
            setMessageType('error');
            console.error('Upload error:', err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Upload Data from Sheet</h1>
            <p className="mb-4"><Link to="/admin" className="text-blue-500 hover:underline">Back to Admin Dashboard</Link></p>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="file-upload" className="block text-gray-700 text-sm font-bold mb-2">Choose CSV or Excel file:</label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        accept=".csv, .xlsx"
                    />
                </div>
                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Upload
                </button>
            </form>

            <p className="mt-6 text-gray-600 text-sm">
               <strong>Note:</strong> Currently, the upload logic in the backend (`server/app.py`) is configured to import data into the `User` table.
               It expects columns: `ssn`, `name`, `email`, `address`, `date_of_birth`.
               If you wish to upload data for other tables (e.g., Student, Internship), you MUST modify the `upload_data` API endpoint in `server/app.py` accordingly.
            </p>
        </div>
    );
}

export default UploadDataPage;