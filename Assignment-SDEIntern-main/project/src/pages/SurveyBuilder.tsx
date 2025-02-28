import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text';
  required: boolean;
  options?: Option[];
}

interface SurveyForm {
  title: string;
  description: string;
  active: boolean;
  questions: Question[];
}

const SurveyBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [form, setForm] = useState<SurveyForm>({
    title: '',
    description: '',
    active: true,
    questions: []
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchSurvey = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/api/surveys/${id}`);
          setForm(response.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch survey. Please try again later.');
          setLoading(false);
        }
      };

      fetchSurvey();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: '',
      type: 'radio',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    };
    
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, [field]: value };
        }
        return q;
      })
    }));
  };

  const addOption = (questionId: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const options = q.options || [];
          return {
            ...q,
            options: [
              ...options,
              { value: `option${options.length + 1}`, label: `Option ${options.length + 1}` }
            ]
          };
        }
        return q;
      })
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.map((opt, idx) => {
              if (idx === optionIndex) {
                return { ...opt, [field]: value };
              }
              return opt;
            })
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex)
          };
        }
        return q;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/api/surveys/${id}`, form);
      } else {
        await axios.post('http://localhost:3001/api/surveys', form);
      }
      
      navigate('/');
    } catch (err) {
      setError('Failed to save survey. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Survey' : 'Create New Survey'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Survey Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter survey title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter survey description"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active (survey will be shown to customers)
            </label>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>
          
          {form.questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <AlertCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No questions added</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a question to your survey.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Question
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-md font-medium text-gray-900">Question {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor={`question-${question.id}-text`} className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <input
                      type="text"
                      id={`question-${question.id}-text`}
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter question text"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor={`question-${question.id}-type`} className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        id={`question-${question.id}-type`}
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="radio">Single Choice (Radio)</option>
                        <option value="checkbox">Multiple Choice (Checkbox)</option>
                        <option value="text">Text Input</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`question-${question.id}-required`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`question-${question.id}-required`} className="ml-2 block text-sm text-gray-700">
                        Required
                      </label>
                    </div>
                  </div>
                  
                  {(question.type === 'radio' || question.type === 'checkbox') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-900"
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Option
                        </button>
                      </div>
                      
                      {question.options && question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updateOption(question.id, optIndex, 'label', e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`Option ${optIndex + 1}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(question.id, optIndex)}
                            className="text-red-600 hover:text-red-900"
                            disabled={question.options && question.options.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {question.options && question.options.length < 2 && (
                        <p className="text-xs text-red-600 mt-1">At least 2 options are required</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || form.questions.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Survey
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyBuilder;