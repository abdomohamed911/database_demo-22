import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from './api/api'; // Your Axios instance
import logo from './images/aiu-logo.png'; // Import the logo
import { motion } from 'framer-motion';

// Import your pages/components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AddUserPage from './pages/AddUserPage';
import UsersListPage from './pages/UsersListPage';
import BusinessQueriesPage from './pages/BusinessQueriesPage';
import UploadDataPage from './pages/UploadDataPage';
import FailingStudentsPage from './pages/FailingStudentsPage';
import StudentRegistrationPage from './pages/StudentRegistrationPage';
import InternshipApplicationPage from './pages/InternshipApplicationPage';
import EvaluationSubmissionPage from './pages/EvaluationSubmissionPage';

// Create Auth Context
export const AuthContext = createContext(null);

// Custom hook for authentication
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userSsn, setUserSsn] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await api.get('/check_auth');
                if (response.data.isAuthenticated) {
                    setIsAuthenticated(true);
                    setUserRole(response.data.role);
                    setUserSsn(response.data.ssn);
                } else {
                    setIsAuthenticated(false);
                    setUserRole(null);
                    setUserSsn(null);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
                setUserRole(null);
                setUserSsn(null);
            }
        };
        checkAuthStatus();
    }, []); // Run once on component mount

    const login = async (ssn) => {
        try {
            const response = await api.post('/login', { ssn });
            if (response.status === 200) {
                setIsAuthenticated(true);
                setUserRole(response.data.role);
                setUserSsn(response.data.ssn);
                return { success: true, role: response.data.role };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
            setIsAuthenticated(false);
            setUserRole(null);
            setUserSsn(null);
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return { isAuthenticated, userRole, userSsn, login, logout };
};

// Header Component
const Header = () => {
    const { isAuthenticated, userRole, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-white text-gray-800 shadow-lg sticky top-0 z-50"
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center space-x-3">
                        <img 
                            src={logo} 
                            alt="AIU Logo" 
                            className="h-12"
                        />
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            FieldTraining
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        </motion.div>
                        {!isAuthenticated ? (
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <Link to="/login" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg">
                                    Login
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                {userRole === 'Admin' && (
                                    <div className="relative group">
                                        <motion.button whileHover={{ scale: 1.05 }} className="hover:text-blue-600 transition-colors">
                                            Admin
                                        </motion.button>
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-lg shadow-xl hidden group-hover:block"
                                        >
                                            <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors">Dashboard</Link>
                                            <Link to="/add-user" className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors">Add User</Link>
                                            <Link to="/users-list" className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors">Users List</Link>
                                            <Link to="/business-queries" className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors">Business Queries</Link>
                                        </motion.div>
                                    </div>
                                )}
                                {userRole === 'Student' && (
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link to="/student" className="hover:text-blue-600 transition-colors">Student Dashboard</Link>
                                    </motion.div>
                                )}
                                {userRole === 'InternshipCoordinator' && (
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link to="/coordinator" className="hover:text-blue-600 transition-colors">Coordinator Dashboard</Link>
                                    </motion.div>
                                )}
                                {userRole === 'Mentor' && (
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link to="/mentor" className="hover:text-blue-600 transition-colors">Mentor Dashboard</Link>
                                    </motion.div>
                                )}
                                <motion.button 
                                    onClick={logout}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
                                >
                                    Logout
                                </motion.button>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <motion.button 
                        className="md:hidden text-gray-800"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </motion.button>
                </div>

                {/* Mobile Navigation */}
                <motion.nav 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                        height: isMobileMenuOpen ? "auto" : 0,
                        opacity: isMobileMenuOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden overflow-hidden"
                >
                    <Link to="/" className="block hover:text-blue-600 transition-colors">Home</Link>
                    {!isAuthenticated ? (
                        <Link to="/login" className="block bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center">
                            Login
                        </Link>
                    ) : (
                        <>
                            {userRole === 'Admin' && (
                                <>
                                    <Link to="/admin" className="block hover:text-blue-600 transition-colors">Dashboard</Link>
                                    <Link to="/add-user" className="block hover:text-blue-600 transition-colors">Add User</Link>
                                    <Link to="/users-list" className="block hover:text-blue-600 transition-colors">Users List</Link>
                                    <Link to="/business-queries" className="block hover:text-blue-600 transition-colors">Business Queries</Link>
                                </>
                            )}
                            {userRole === 'Student' && (
                                <Link to="/student" className="block hover:text-blue-600 transition-colors">Student Dashboard</Link>
                            )}
                            {userRole === 'InternshipCoordinator' && (
                                <Link to="/coordinator" className="block hover:text-blue-600 transition-colors">Coordinator Dashboard</Link>
                            )}
                            {userRole === 'Mentor' && (
                                <Link to="/mentor" className="block hover:text-blue-600 transition-colors">Mentor Dashboard</Link>
                            )}
                            <button 
                                onClick={logout}
                                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </motion.nav>
            </div>
        </motion.header>
    );
};

// PrivateRoute component
const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login'); // Redirect to login if not authenticated
        } else if (allowedRoles && !allowedRoles.includes(userRole)) {
            navigate('/'); // Redirect to home or unauthorized page if role not allowed
        }
    }, [isAuthenticated, userRole, allowedRoles, navigate]);

    if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(userRole))) {
        return null; // Or a loading spinner / unauthorized message
    }
    return children;
};

// AppContent component that uses the hooks
const AppContent = () => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            
                            {/* Admin Routes */}
                            <Route path="/admin" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <AdminDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/add-user" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <AddUserPage />
                                </PrivateRoute>
                            } />
                            <Route path="/users-list" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <UsersListPage />
                                </PrivateRoute>
                            } />
                            <Route path="/business-queries" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <BusinessQueriesPage />
                                </PrivateRoute>
                            } />
                            <Route path="/upload-data" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <UploadDataPage />
                                </PrivateRoute>
                            } />
                            <Route path="/failing-students" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <FailingStudentsPage />
                                </PrivateRoute>
                            } />
                            <Route path="/register-student" element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <StudentRegistrationPage />
                                </PrivateRoute>
                            } />

                            {/* Student Routes */}
                            <Route path="/student" element={
                                <PrivateRoute allowedRoles={['Student']}>
                                    <StudentDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/apply-internship" element={
                                <PrivateRoute allowedRoles={['Student']}>
                                    <InternshipApplicationPage />
                                </PrivateRoute>
                            } />

                            {/* Coordinator Routes */}
                            <Route path="/coordinator" element={
                                <PrivateRoute allowedRoles={['InternshipCoordinator']}>
                                    <CoordinatorDashboard />
                                </PrivateRoute>
                            } />

                            {/* Mentor Routes */}
                            <Route path="/mentor" element={
                                <PrivateRoute allowedRoles={['Mentor']}>
                                    <MentorDashboard />
                                </PrivateRoute>
                            } />

                            {/* Evaluator Routes */}
                            <Route path="/submit-evaluation" element={
                                <PrivateRoute allowedRoles={['InternshipEvaluator']}>
                                    <EvaluationSubmissionPage />
                                </PrivateRoute>
                            } />

                            {/* NotFound component */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </AuthContext.Provider>
    );
};

// NotFound component
const NotFound = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
            <div className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</div>
            <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
            <Link 
                to="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
                Return Home
            </Link>
        </div>
    );
};

// Main App component
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
