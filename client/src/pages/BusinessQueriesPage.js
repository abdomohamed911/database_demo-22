import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

function BusinessQueriesPage() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQueries = async () => {
            try {
                const response = await api.get('/business_queries');
                setResults(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch business queries.');
                console.error('Business queries error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQueries();
    }, []);

    const handleExport = async (reportName) => {
        try {
            const response = await api.get(`/export_report/${reportName}`, { responseType: 'blob' }); // Important: responseType 'blob'
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportName}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the object URL
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to export report.');
            console.error('Export error:', err);
        }
    };

    if (loading) return <div className="text-center py-8">Loading business queries...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Business Queries</h1>
            <p className="mb-4"><Link to="/admin" className="text-blue-500 hover:underline">Back to Admin Dashboard</Link></p>

            {/* Query 1: Internship with highest grade */}
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">1. Internship with Highest Grade</h2>
            {results.highest_grade_internship ? (
                <p className="text-gray-700">Company: {results.highest_grade_internship.company_name}, Highest Grade: {results.highest_grade_internship.highest_grade}</p>
            ) : (
                <p className="text-gray-600">No data available.</p>
            )}

            {/* Query 2: Most selected mentor by high-score students */}
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">2. Most Selected Mentor by High-Score Students</h2>
            {results.most_selected_mentor && results.most_selected_mentor.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Mentor Position</th>
                                <th className="py-3 px-6 text-left">Count</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {results.most_selected_mentor.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 text-left">{row.position}</td>
                                    <td className="py-3 px-6 text-left">{row.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No data available.</p>
            )}

            {/* Query 3: Number of students per internship coordinator */}
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">3. Number of Students per Internship Coordinator</h2>
            {results.students_per_coordinator && results.students_per_coordinator.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Coordinator Name</th>
                                <th className="py-3 px-6 text-left">Total Students</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {results.students_per_coordinator.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 text-left">{row.coordinator_name}</td>
                                    <td className="py-3 px-6 text-left">{row.total_students}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No data available.</p>
            )}

            {/* Query 4: External evaluations and internal mentor guidance */}
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">4. External Evaluations and Internal Mentor Guidance</h2>
            {results.evaluations_mentor_guidance && results.evaluations_mentor_guidance.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Student ID</th>
                                <th className="py-3 px-6 text-left">Evaluation Comments</th>
                                <th className="py-3 px-6 text-left">Mentor Position</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {results.evaluations_mentor_guidance.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 text-left">{row.student_id}</td>
                                    <td className="py-3 px-6 text-left">{row.evaluation}</td>
                                    <td className="py-3 px-6 text-left">{row.mentor_position}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No data available.</p>
            )}

            {/* Query 5: Internship duration and reports per company */}
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">5. Internship Duration and Reports per Company</h2>
            {results.internship_duration_reports && results.internship_duration_reports.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Company Name</th>
                                <th className="py-3 px-6 text-left">Duration (Days)</th>
                                <th className="py-3 px-6 text-left">Reports Count</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {results.internship_duration_reports.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 text-left">{row.company_name}</td>
                                    <td className="py-3 px-6 text-left">{row.duration}</td>
                                    <td className="py-3 px-6 text-left">{row.reports}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No data available.</p>
            )}

            {/* Query 6: Students with low grades to be warned */}
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">6. Students with Low Grades (D or F) to be Warned</h2>
            {results.low_grade_students && results.low_grade_students.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-blue-100 text-blue-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Student ID</th>
                                <th className="py-3 px-6 text-left">Student Name</th>
                                <th className="py-3 px-6 text-left">Final Grade</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {results.low_grade_students.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 text-left">{row.student_id}</td>
                                    <td className="py-3 px-6 text-left">{row.name}</td>
                                    <td className="py-3 px-6 text-left">{row.final_grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No students with D or F grades found.</p>
            )}

            <hr className="my-8"/>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Export Reports</h3>
            <p className="text-gray-700 mb-4">Select a report to export:</p>
            <ul className="flex flex-wrap gap-4">
                <li>
                    <button 
                        onClick={() => handleExport('low_grade_students')} 
                        className="btn-secondary"
                    >
                        Export Low Grade Students (CSV)
                    </button>
                </li>
                {/* Add more buttons here for other reports to export if you implement them */}
            </ul>
        </div>
    );
}

export default BusinessQueriesPage;