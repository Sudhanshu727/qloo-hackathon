import React, { useState } from 'react';
import { Users, Heart, Zap } from 'lucide-react';
import { apiService, ApiError } from '../../services/api';
import { TwinResponse } from '../../types';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Card } from '../UI/Card';

export const FashionTwin: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [twinData, setTwinData] = useState<TwinResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindTwin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.findTwin(userId);
      setTwinData(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to find your fashion twin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Fashion Twin</h2>
        <p className="text-gray-600">Connect with someone who shares your unique style</p>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleFindTwin} className="space-y-4">
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
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Find My Twin</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage message={error} onRetry={() => handleFindTwin({ preventDefault: () => {} } as React.FormEvent)} />
        </div>
      )}

      {twinData && (
        <div className="max-w-2xl mx-auto">
          <Card className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You've found your Fashion Twin!
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Twin ID: <span className="font-semibold text-pink-600">{twinData.twin_user_id}</span>
              </p>
              
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-rose-100 px-4 py-2 rounded-full">
                <Zap className="w-5 h-5 text-pink-600" />
                <span className="text-pink-800 font-medium">
                  {Math.round(twinData.similarity_score * 100)}% Style Match
                </span>
              </div>
            </div>

            {twinData.shared_preferences && twinData.shared_preferences.length > 0 && (
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-3">Shared Style Preferences:</h4>
                <div className="flex flex-wrap gap-2">
                  {twinData.shared_preferences.map((preference, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-700 text-sm font-medium rounded-full"
                    >
                      {preference}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};