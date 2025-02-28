import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <ShieldAlert className="h-16 w-16 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">403</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
      <p className="text-gray-600 max-w-md mb-8">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        <Home className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;