import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="-m-6">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 px-6 overflow-hidden"
            >
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0] 
                    }}
                    transition={{ 
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="absolute inset-0 bg-blue-900 mix-blend-multiply"
                />
                <div className="relative max-w-7xl mx-auto">
                    <motion.h1 
                        {...fadeInUp}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4"
                    >
                        Field Training Management System
                    </motion.h1>
                    <motion.p 
                        {...fadeInUp}
                        className="text-xl text-blue-100 text-center max-w-3xl mx-auto mb-8"
                    >
                        Streamline your internship and training programs with our comprehensive management solution
                    </motion.p>
                    <motion.div 
                        {...fadeInUp}
                        className="flex justify-center space-x-4"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/login"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-all duration-300 hover:shadow-lg"
                            >
                                Get Started
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <a
                                href="#features"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 bg-opacity-30 hover:bg-opacity-40 transition-all duration-300 hover:shadow-lg"
                            >
                                Learn More
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Features Section */}
            <div id="features" className="py-16 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Comprehensive Training Management
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our platform provides all the tools needed to manage and track field training programs effectively
                        </p>
                    </motion.div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {/* Feature Cards */}
                        {[
                            {
                                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                                title: "Easy Tracking",
                                description: "Monitor student progress, evaluations, and internship status in real-time"
                            },
                            {
                                icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
                                title: "Seamless Communication",
                                description: "Facilitate communication between students, coordinators, and mentors"
                            },
                            {
                                icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                                title: "Detailed Analytics",
                                description: "Generate comprehensive reports and analytics for better decision making"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"
                                >
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                    </svg>
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* CTA Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-gray-50 py-16 px-6"
            >
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h2 
                        {...fadeInUp}
                        className="text-3xl font-bold text-gray-900 mb-4"
                    >
                        Ready to Get Started?
                    </motion.h2>
                    <motion.p 
                        {...fadeInUp}
                        className="text-lg text-gray-600 mb-8"
                    >
                        Join our platform today and transform your field training management
                    </motion.p>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/login"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-all duration-300 hover:shadow-lg"
                        >
                            Sign In Now
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

export default HomePage;