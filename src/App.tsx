import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { SmartSearch } from './components/Features/SmartSearch';
import { ActionableSuggestions } from './components/Features/ActionableSuggestions';
import { CulturalFusion } from './components/Features/CulturalFusion';
import { UniqueStyle } from './components/Features/UniqueStyle';
import { FashionTwin } from './components/Features/FashionTwin';
import { ChoiceApproval } from './components/Features/ChoiceApproval';
import { apiService } from './services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('search');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await apiService.healthCheck();
        setBackendStatus('online');
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'search':
        return <SmartSearch />;
      case 'suggestions':
        return <ActionableSuggestions />;
      case 'culture':
        return <CulturalFusion />;
      case 'unique':
        return <UniqueStyle />;
      case 'twin':
        return <FashionTwin />;
      case 'approval':
        return <ChoiceApproval />;
      default:
        return <SmartSearch />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Backend Status Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
          backendStatus === 'online' 
            ? 'bg-green-100 text-green-700'
            : backendStatus === 'offline'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {backendStatus === 'online' ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          <span>
            Backend API: {backendStatus === 'checking' ? 'Checking...' : backendStatus}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {backendStatus === 'offline' && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-medium">Backend API Unavailable</h3>
              <p className="text-red-700 text-sm mt-1">
                The Fashion AI backend at http://127.0.0.1:8000 is not responding. 
                Please ensure the backend server is running.
              </p>
            </div>
          </div>
        )}
        
        {renderActiveSection()}
      </main>

      {/* Floating Choice Approval Button */}
      {activeSection !== 'approval' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setActiveSection('approval')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            title="Should I wear this?"
          >
            <CheckCircle className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;