import React, { useState } from "react";
import { Users, Heart, Zap } from "lucide-react";
import { apiService, ApiError } from "../../services/api";
import { TwinResponse, FashionItem } from "../../types";
import { LoadingSpinner } from "../UI/LoadingSpinner";
import { ErrorMessage } from "../UI/ErrorMessage";
import { Card } from "../UI/Card";

export const FashionTwin: React.FC = () => {
  const [preferences, setPreferences] = useState("");
  const [twinData, setTwinData] = useState<TwinResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindTwin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.trim()) return;

    setLoading(true);
    setError(null);
    setTwinData(null);

    try {
      // The findTwin function in api.ts should be updated to take the preferences string
      const response = await apiService.findTwin(preferences);
      setTwinData(response);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to find your fashion twin"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Fashion Vibe
        </h2>
        <p className="text-gray-600">
          Discover items that perfectly match your style profile
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleFindTwin} className="space-y-4">
          <div>
            <label
              htmlFor="preferences"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Describe Your Style
            </label>
            <textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., 'I love minimalist, professional styles' or 'bohemian and artistic'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !preferences.trim()}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Find My Vibe</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            message={error}
            onRetry={() =>
              handleFindTwin({ preventDefault: () => {} } as React.FormEvent)
            }
          />
        </div>
      )}

      {twinData && twinData.twin_items.length > 0 && (
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {twinData.message}
          </h3>
          <p className="text-gray-600 mb-6">{twinData.note}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {twinData.twin_items.map((item) => (
              <Card key={item.id} hover className="space-y-3 text-left">
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`http://127.0.0.1:8000${item.image_url}`}
                    alt={`${item.clothing_type} - ${item.dominant_color}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {item.clothing_type}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.dominant_color}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
