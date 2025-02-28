import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, CheckCircle, AlertCircle, PlusCircle, Edit, BarChart, FileText } from 'lucide-react';
import axios from 'axios';

interface Survey {
  id: string;
  title: string;
  description: string;
  active: boolean;
  questions: any[];
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/surveys');
        setSurveys(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch surveys. Please try again later.');
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link 
          to="/surveys/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create New Survey
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Surveys</p>
              <p className="text-2xl font-semibold text-gray-800">{surveys.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Responses</p>
              <p className="text-2xl font-semibold text-gray-800">42</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Surveys</p>
              <p className="text-2xl font-semibold text-gray-800">
                {surveys.filter(survey => survey.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Your Surveys</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {surveys.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <AlertCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new survey.</p>
              <div className="mt-6">
                <Link
                  to="/surveys/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Survey
                </Link>
              </div>
            </div>
          ) : (
            surveys.map((survey) => (
              <div key={survey.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{survey.description}</p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        survey.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {survey.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        Created: {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {survey.questions.length} questions
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/surveys/${survey.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 p-2"
                      title="Edit Survey"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/surveys/${survey.id}/responses`}
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="View Responses"
                    >
                      <FileText className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/surveys/${survey.id}/analytics`}
                      className="text-green-600 hover:text-green-900 p-2"
                      title="View Analytics"
                    >
                      <BarChart className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;