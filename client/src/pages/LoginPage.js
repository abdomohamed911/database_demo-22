import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';

function LoginPage() {
    const [ssn, setSsn] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth?.isAuthenticated) {
            switch (auth.userRole) {
                case 'Admin':
                    navigate('/admin');
                    break;
                case 'Student':
                    navigate('/student');
                    break;
                case 'InternshipCoordinator':
                    navigate('/coordinator');
                    break;
                default:
                    navigate('/');
            }
        }
    }, [auth, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await auth.login(ssn);
            if (result.success) {
                switch (result.role) {
                    case 'Admin':
                        navigate('/admin');
                        break;
                    case 'Student':
                        navigate('/student');
                        break;
                    case 'InternshipCoordinator':
                        navigate('/coordinator');
                        break;
                    default:
                        setError('Invalid role');
                }
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (auth?.isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-8 border border-white/20">
                    {/* Glass effect top highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                    
                    <div>
                        <h2 className="mt-2 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter your SSN to access the Field Training System
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md -space-y-px">
                            <div className="relative group">
                                <input
                                    id="ssn"
                                    name="ssn"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    placeholder="Enter your SSN"
                                    value={ssn}
                                    onChange={(e) => setSsn(e.target.value)}
                                    autoComplete="off"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </form>

                    {/* Bottom decorative line */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;