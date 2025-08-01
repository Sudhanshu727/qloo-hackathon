import React, { useState } from 'react';
import { Palette, Globe, Plus, X } from 'lucide-react';
import { apiService, ApiError } from '../../services/api';
import { FashionItem } from '../../types';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Card } from '../UI/Card';

const popularCultures = [
  'French', 'Japanese', 'Korean', 'Italian', 'Moroccan', 'Indian', 
  'Mexican', 'Scandinavian', 'Brazilian', 'British', 'Spanish', 'African'
];

export const CulturalFusion: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [customCulture, setCustomCulture] = useState('');
  const [recommendations, setRecommendations] = useState<FashionItem[]>([]);
  const [culturalBlend, setCulturalBlend] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCulture = (culture: string) => {
    if (!selectedCultures.includes(culture) && selectedCultures.length < 5) {
      setSelectedCultures([...selectedCultures, culture]);
    }
  };

  const removeCulture = (culture: string) => {
    setSelectedCultures(selectedCultures.filter(c => c !== culture));
  };

  const addCustomCulture = () => {
    if (customCulture.trim() && !selectedCultures.includes(customCulture.trim())) {
      addCulture(customCulture.trim());
      setCustomCulture('');
    }
  };

  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || selectedCultures.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getMixedCultureRecommendations({
        user_id: userId,
        cultures: selectedCultures
      });
      setRecommendations(response.items);
      setCulturalBlend(response.cultural_blend);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to get cultural fusion recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cultural Style Blender</h2>
        <p className="text-gray-600">Mix different cultural styles to create your unique fusion</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleGetRecommendations} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Cultures (up to 5)
            </label>
            
            {selectedCultures.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCultures.map((culture) => (
                  <span
                    key={culture}
                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full flex items-center space-x-2"
                  >
                    <span>{culture}</span>
                    <button
                      type="button"
                      onClick={() => removeCulture(culture)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-purple-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {popularCultures.map((culture) => (
                <button
                  key={culture}
                  type="button"
                  onClick={() => addCulture(culture)}
                  disabled={selectedCultures.includes(culture) || selectedCultures.length >= 5}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {culture}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={customCulture}
                onChange={(e) => setCustomCulture(e.target.value)}
                placeholder="Add custom culture"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={selectedCultures.length >= 5}
              />
              <button
                type="button"
                onClick={addCustomCulture}
                disabled={!customCulture.trim() || selectedCultures.length >= 5}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !userId.trim() || selectedCultures.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Palette className="w-5 h-5" />
                <span>Blend Cultures</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage message={error} onRetry={() => handleGetRecommendations({ preventDefault: () => {} } as React.FormEvent)} />
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Your {culturalBlend} Fusion Collection
            </h3>
            <div className="flex justify-center items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="text-purple-600 font-medium">
                {selectedCultures.join(' × ')} Blend
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item) => (
              <Card key={item.id} hover className="space-y-3">
                <div className="h-48 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-12 h-12 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">{item.clothing_type}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description || 'Cultural fusion piece'}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {item.dominant_color}
                    </span>
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                      {item.occasion_suitability}
                    </span>
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