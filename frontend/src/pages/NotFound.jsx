import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
            <div className="relative mb-12">
                <h1 className="text-[200px] font-black text-gray-100 leading-none select-none">404</h1>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-primary-600 text-white rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-lg shadow-primary-500/30">
                        🎓
                    </div>
                </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-lg text-gray-500 max-w-md mb-12">
                The page you're looking for doesn't exist. Perhaps you'd like to explore our courses or talk to our AI assistant?
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                    to="/"
                    className="btn btn-primary px-10 py-4 flex items-center space-x-2"
                >
                    <Home size={20} />
                    <span>Go Home</span>
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="btn bg-white border border-gray-200 text-gray-600 px-10 py-4 flex items-center space-x-2 hover:bg-gray-50"
                >
                    <ArrowLeft size={20} />
                    <span>Go Back</span>
                </button>
            </div>
        </div>
    );
};

export default NotFound;
