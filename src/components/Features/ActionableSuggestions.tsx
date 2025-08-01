import React, { useState } from 'react';
import { Lightbulb, MapPin, Star } from 'lucide-react';
import { apiService, ApiError } from '../../services/api';
import { FashionPlace } from '../../types';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Card } from '../UI/Card';

export const ActionableSuggestions: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [suggestions, setSuggestions] = useState<FashionPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getActionableSuggestions(userId);
      setSuggestions(response.suggestions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Inspired</h2>
        <p className="text-gray-600">Discover personalized fashion recommendations</p>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleGetSuggestions} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              Your User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !userId.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Lightbulb className="w-5 h-5" />
                <span>Get Inspired</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage message={error} onRetry={() => handleGetSuggestions({ preventDefault: () => {} } as React.FormEvent)} />
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((place) => (
            <Card key={place.id} hover className="space-y-3">
              <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{place.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{place.location}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{place.rating || 4.5}</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {place.style_focus}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};