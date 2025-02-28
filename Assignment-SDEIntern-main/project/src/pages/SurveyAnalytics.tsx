import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, PieChart, FileText } from 'lucide-react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  type: string;
  totalResponses: number;
  optionCounts?: Record<string, number>;
  responses?: string[];
}

interface SurveyAnalytics {
  surveyId: string;
  surveyTitle: string;
  totalResponses: number;
  analytics: QuestionAnalytics[];
}

const SurveyAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/surveys/${id}/analytics`);
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalytics();
    }
  }, [id]);

  const getRandomColor = (index: number) => {
    const colors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 199, 199, 0.6)',
    ];
    return colors[index % colors.length];
  };

  const renderChartForQuestion = (question: QuestionAnalytics, index: number) => {
    if (!question.optionCounts) return null;

    const labels = Object.keys(question.optionCounts);
    const data = Object.values(question.optionCounts);
    const backgroundColor = labels.map((_, i) => getRandomColor(i));

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Responses',
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: question.questionText,
        },
      },
    };

    return (
      <div key={question.questionId} className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{question.questionText}</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-end mb-2">
            <div className="text-sm text-gray-500">
              {question.totalResponses} {question.totalResponses === 1 ? 'response' : 'responses'}
            </div>
          </div>
          <div className="h-64">
            {question.type === 'radio' ? (
              <Pie data={chartData} options={options} />
            ) : (
              <Bar data={chartData} options={options} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTextResponses = (question: QuestionAnalytics) => {
    if (!question.responses) return null;

    return (
      <div key={question.questionId} className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{question.questionText}</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="text-sm text-gray-500">
              {question.totalResponses} {question.totalResponses === 1 ? 'response' : 'responses'}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {question.responses.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No responses yet.</div>
            ) : (
              question.responses.map((response, idx) => (
                <div key={idx} className="p-4">
                  <p className="text-gray-800">{response}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

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

  if (!analytics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">Analytics not available.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Survey Analytics</h1>
          <p className="text-gray-600">{analytics.surveyTitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800 mr-4">
              Overview
            </h2>
            <Link
              to={`/surveys/${id}/responses`}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View All Responses
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Responses</p>
                  <p className="text-2xl font-semibold text-gray-800">{analytics.totalResponses}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Questions</p>
                  <p className="text-2xl font-semibold text-gray-800">{analytics.analytics.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <PieChart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {analytics.totalResponses > 0 
                      ? `${Math.round((analytics.analytics[0]?.totalResponses / analytics.totalResponses) * 100)}%` 
                      : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Questions
            </button>
            {analytics.analytics
              .filter(q => q.type === 'radio' || q.type === 'checkbox')
              .map(q => (
                <button
                  key={q.questionId}
                  onClick={() => setActiveTab(q.questionId)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === q.questionId
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {q.questionText.length > 20 ? q.questionText.substring(0, 20) + '...' : q.questionText}
                </button>
              ))}
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.analytics.map((question, index) => (
              <div key={question.questionId}>
                {question.type === 'text' 
                  ? renderTextResponses(question) 
                  : renderChartForQuestion(question, index)}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {renderChartForQuestion(
              analytics.analytics.find(q => q.questionId === activeTab)!,
              0
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyAnalytics;