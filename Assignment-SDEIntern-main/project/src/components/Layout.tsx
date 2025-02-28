import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart3, ShoppingCart, Settings, PlusCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-800' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8" />
            <h1 className="text-xl font-bold">Survey Cart</h1>
          </div>
          <p className="text-xs text-indigo-300 mt-1">Shopify Survey App</p>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Main
          </div>
          <Link 
            to="/" 
            className={`flex items-center px-4 py-3 text-indigo-300 hover:bg-indigo-800 hover:text-white ${isActive('/')}`}
          >
            <LayoutGrid className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link 
            to="/surveys/new" 
            className={`flex items-center px-4 py-3 text-indigo-300 hover:bg-indigo-800 hover:text-white ${isActive('/surveys/new')}`}
          >
            <PlusCircle className="h-5 w-5 mr-3" />
            Create Survey
          </Link>
          <Link 
            to="/cart-preview" 
            className={`flex items-center px-4 py-3 text-indigo-300 hover:bg-indigo-800 hover:text-white ${isActive('/cart-preview')}`}
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            Cart Preview
          </Link>
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Settings
          </div>
          <Link 
            to="/settings" 
            className="flex items-center px-4 py-3 text-indigo-300 hover:bg-indigo-800 hover:text-white"
          >
            <Settings className="h-5 w-5 mr-3" />
            App Settings
          </Link>
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Account
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-indigo-300 hover:bg-indigo-800 hover:text-white text-left"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Shopify Survey App</h2>
              {isAuthenticated && user && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                        <User className="h-5 w-5 text-indigo-500" />
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user.name}
                      {user.role ===  'admin' && (
                        <span className="ml-1 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;