import React, { useState } from 'react';
import { Search, Sparkles, User, Settings } from 'lucide-react';
import { apiService, ApiError } from '../../services/api';
import { FashionItem, UserProfile } from '../../types';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Card } from '../UI/Card';

export const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [stylePreferences, setStylePreferences] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [results, setResults] = useState<FashionItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.search(query, stylePreferences || undefined);
      setResults(response.items);
      setUserProfile(response.personalization || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Smart Fashion Search</h2>
        <p className="text-gray-600">Describe what you're looking for and let AI personalize the results</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'a red summer dress for casual occasions'"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Personalize with your style preferences (optional)</span>
            </button>
            
            {showPreferences && (
              <div className="mt-3">
                <textarea
                  value={stylePreferences}
                  onChange={(e) => setStylePreferences(e.target.value)}
                  placeholder="e.g., 'I love minimalist style, prefer business casual wear, and like neutral colors'"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Find Fashion</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage message={error} onRetry={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)} />
        </div>
      )}

      {userProfile && (
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Style Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Style:</span>
                  <span className="ml-2 text-gray-600 capitalize">{userProfile.style_preference}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Colors:</span>
                  <span className="ml-2 text-gray-600">{userProfile.color_preference.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Occasions:</span>
                  <span className="ml-2 text-gray-600">{userProfile.occasion_focus.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Personality:</span>
                  <span className="ml-2 text-gray-600 capitalize">{userProfile.personality}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Found {results.length} items for "{query}"
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((item) => (
              <Card key={item.id} hover className="space-y-3">
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`http://127.0.0.1:8000${item.image_url}`}
                    alt={`${item.clothing_type} - ${item.dominant_color}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs font-medium rounded-full">
                      #{item.original_id}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">{item.clothing_type}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {item.pattern_description || item.remarks || 'Stylish fashion item'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {item.dominant_color}
                    </span>
                    {item.secondary_color && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {item.secondary_color}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.occasion_suitability.map((occasion, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};