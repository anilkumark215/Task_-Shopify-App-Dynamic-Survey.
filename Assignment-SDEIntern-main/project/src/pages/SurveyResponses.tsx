import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Search, Filter } from 'lucide-react';
import axios from 'axios';

interface Answer {
  questionId: string;
  value?: string;
  values?: string[];
}

interface Response {
  id: string;
  surveyId: string;
  customerId: string;
  answers: Answer[];
  submittedAt: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    type: string;
    options?: { value: string; label: string }[];
  }[];
}

const SurveyResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyRes, responsesRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/surveys/${id}`),
          axios.get(`http://localhost:3001/api/surveys/${id}/responses`)
        ]);
        
        setSurvey(surveyRes.data);
        setResponses(responsesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const getQuestionText = (questionId: string) => {
    if (!survey) return '';
    const question = survey.questions.find(q => q.id === questionId);
    return question ? question.text : '';
  };

  const getOptionLabel = (questionId: string, value: string) => {
    if (!survey) return value;
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.options) return value;
    
    const option = question.options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const formatAnswer = (answer: Answer) => {
    if (answer.values) {
      return answer.values.map(v => getOptionLabel(answer.questionId, v)).join(', ');
    }
    return answer.value ? getOptionLabel(answer.questionId, answer.value) : '';
  };

  const filteredResponses = responses.filter(response => {
    if (!searchTerm) return true;
    
    // Search by customer ID
    if (response.customerId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    
    // Search in answers
    return response.answers.some(answer => {
      const formattedAnswer = formatAnswer(answer);
      return formattedAnswer.toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const exportToCSV = () => {
    if (!survey || responses.length === 0) return;
    
    // Create CSV header
    const headers = ['Response ID', 'Customer ID', 'Submitted At'];
    survey.questions.forEach(q => {
      headers.push(q.text);
    });
    
    // Create CSV rows
    const rows = filteredResponses.map(response => {
      const row = [
        response.id,
        response.customerId,
        new Date(response.submittedAt).toLocaleString()
      ];
      
      survey.questions.forEach(question => {
        const answer = response.answers.find(a => a.questionId === question.id);
        row.push(answer ? formatAnswer(answer) : '');
      });
      
      return row;
    });
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${survey.title}-responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!survey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">Survey not found.</span>
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
          <h1 className="text-2xl font-bold text-gray-800">Survey Responses</h1>
          <p className="text-gray-600">{survey.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800 mr-4">
              {responses.length} {responses.length === 1 ? 'Response' : 'Responses'}
            </h2>
            <Link
              to={`/surveys/${id}/analytics`}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View Analytics
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No responses yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  {survey.questions.map(question => (
                    <th key={question.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {question.text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map(response => (
                  <tr key={response.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {response.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.submittedAt).toLocaleString()}
                    </td>
                    {survey.questions.map(question => {
                      const answer = response.answers.find(a => a.questionId === question.id);
                      return (
                        <td key={question.id} className="px-6 py-4 text-sm text-gray-500">
                          {answer ? formatAnswer(answer) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses;