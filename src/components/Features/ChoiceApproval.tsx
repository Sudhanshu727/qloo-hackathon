import React, { useState } from 'react';
import { CheckCircle, ThumbsUp, Star, User, Sparkles } from 'lucide-react';
import { apiService, ApiError } from '../../services/api';
import { ChoiceApprovalResponse } from '../../types';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Card } from '../UI/Card';

export const ChoiceApproval: React.FC = () => {
  const [itemDescription, setItemDescription] = useState('');
  const [userStyle, setUserStyle] = useState('');
  const [approval, setApproval] = useState<ChoiceApprovalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleGetApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDescription.trim()) return;

    setLoading(true);
    setError(null);
    setShowResult(false);

    try {
      const response = await apiService.getChoiceApproval({
        item_description: itemDescription,
        user_style: userStyle || undefined
      });
      setApproval(response);
      setShowResult(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to get choice approval');
    } finally {
      setLoading(false);
    }
  };

  const getAffinityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAffinityEmoji = (score: number) => {
    if (score >= 0.8) return '🔥';
    if (score >= 0.6) return '👍';
    if (score >= 0.4) return '👌';
    return '🤔';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Should I Wear This?</h2>
        <p className="text-gray-600">Get AI-powered approval for your fashion choices</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleGetApproval} className="space-y-4">
          <div>
            <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Describe the item you're considering
            </label>
            <textarea
              id="itemDescription"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g., 'a floral summer dress with short sleeves' or 'black leather jacket with jeans'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={loading}
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="userStyle" className="block text-sm font-medium text-gray-700 mb-2">
              Your style preferences (optional)
            </label>
            <textarea
              id="userStyle"
              value={userStyle}
              onChange={(e) => setUserStyle(e.target.value)}
              placeholder="e.g., 'I prefer minimalist, professional styles' or 'I love bohemian, artistic looks'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={loading}
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !itemDescription.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <ThumbsUp className="w-5 h-5" />
                <span>Get Style Approval</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage message={error} onRetry={() => handleGetApproval({ preventDefault: () => {} } as React.FormEvent)} />
        </div>
      )}

      {showResult && approval && (
        <div className="max-w-2xl mx-auto">
          <Card className="text-center space-y-6 transform transition-all duration-500 scale-100">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {approval.approval}
              </h3>
              
              <div className="mb-4">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getAffinityColor(approval.affinity_score)}`}>
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">
                    Affinity Score: {Math.round(approval.affinity_score * 100)}% {getAffinityEmoji(approval.affinity_score)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">AI Analysis:</h4>
                <p className="text-gray-700">{approval.message}</p>
                {approval.style_analysis && (
                  <p className="text-gray-600 mt-2 text-sm">{approval.style_analysis}</p>
                )}
              </div>

              {approval.user_profile && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Style Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Style:</span>
                      <span className="ml-2 text-gray-600 capitalize">{approval.user_profile.style_preference}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Colors:</span>
                      <span className="ml-2 text-gray-600">{approval.user_profile.color_preference.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Occasions:</span>
                      <span className="ml-2 text-gray-600">{approval.user_profile.occasion_focus.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Personality:</span>
                      <span className="ml-2 text-gray-600 capitalize">{approval.user_profile.personality}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};