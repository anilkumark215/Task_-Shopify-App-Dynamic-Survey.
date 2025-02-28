import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, X, Plus, Minus, CreditCard } from 'lucide-react';
import axios from 'axios';

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    name: 'Vintage T-Shirt',
    price: 29.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'Classic Denim Jeans',
    price: 59.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  }
];

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text';
  required: boolean;
  options?: { value: string; label: string }[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, any>>({});
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch survey on component mount
  React.useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/active-survey');
        if (response.data) {
          setSurvey(response.data);
          
          // Initialize survey responses
          const initialResponses: Record<string, any> = {};
          response.data.questions.forEach((question: SurveyQuestion) => {
            if (question.type === 'checkbox') {
              initialResponses[question.id] = [];
            } else {
              initialResponses[question.id] = '';
            }
          });
          setSurveyResponses(initialResponses);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load survey');
        setLoading(false);
      }
    };

    fetchSurvey();
  }, []);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleSurveyChange = (questionId: string, value: any, isCheckbox = false) => {
    setSurveyResponses(prev => {
      if (isCheckbox) {
        const currentValues = [...(prev[questionId] || [])];
        const valueIndex = currentValues.indexOf(value);
        
        if (valueIndex === -1) {
          // Add value if not present
          return { ...prev, [questionId]: [...currentValues, value] };
        } else {
          // Remove value if already present
          currentValues.splice(valueIndex, 1);
          return { ...prev, [questionId]: currentValues };
        }
      } else {
        // For radio and text inputs
        return { ...prev, [questionId]: value };
      }
    });
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey) return;
    
    // Validate required fields
    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => {
      const response = surveyResponses[q.id];
      return response === '' || (Array.isArray(response) && response.length === 0);
    });
    
    if (missingResponses.length > 0) {
      alert('Please answer all required questions');
      return;
    }
    
    try {
      // Format answers for API
      const answers = Object.entries(surveyResponses).map(([questionId, value]) => {
        const question = survey.questions.find(q => q.id === questionId);
        
        if (question?.type === 'checkbox') {
          return {
            questionId,
            values: value
          };
        } else {
          return {
            questionId,
            value
          };
        }
      });
      
      await axios.post('http://localhost:3001/api/responses', {
        surveyId: survey.id,
        customerId: `cust${Math.floor(Math.random() * 10000)}`, // Mock customer ID
        answers
      });
      
      setSurveySubmitted(true);
    } catch (err) {
      setError('Failed to submit survey');
    }
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Your Items</h2>
              </div>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="px-6 py-4 flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="mx-2 text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Survey and Checkout */}
        <div className="lg:col-span-1">
          {/* Survey Form */}
          {survey && !surveySubmitted && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{survey.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
              </div>
              
              <form onSubmit={handleSurveySubmit} className="p-6">
                {survey.questions.map(question => (
                  <div key={question.id} className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {question.type === 'radio' && question.options && (
                      <div className="space-y-2">
                        {question.options.map(option => (
                          <div key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              id={`${question.id}-${option.value}`}
                              name={question.id}
                              value={option.value}
                              checked={surveyResponses[question.id] === option.value}
                              onChange={() => handleSurveyChange(question.id, option.value)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              required={question.required}
                            />
                            <label
                              htmlFor={`${question.id}-${option.value}`}
                              className="ml-2 block text-sm text-gray-700"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'checkbox' && question.options && (
                      <div className="space-y-2">
                        {question.options.map(option => (
                          <div key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${question.id}-${option.value}`}
                              name={`${question.id}-${option.value}`}
                              value={option.value}
                              checked={(surveyResponses[question.id] || []).includes(option.value)}
                              onChange={() => handleSurveyChange(question.id, option.value, true)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`${question.id}-${option.value}`}
                              className="ml-2 block text-sm text-gray-700"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'text' && (
                      <textarea
                        id={question.id}
                        name={question.id}
                        value={surveyResponses[question.id] || ''}
                        onChange={(e) => handleSurveyChange(question.id, e.target.value)}
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Your answer"
                        required={question.required}
                      />
                    )}
                  </div>
                ))}
                
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Survey
                </button>
              </form>
            </div>
          )}
          
          {surveySubmitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" role="alert">
              <p className="font-bold">Thank you!</p>
              <p>Your survey responses have been submitted.</p>
            </div>
          )}
          
          {/* Checkout Button */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <button
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={cartItems.length === 0}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;