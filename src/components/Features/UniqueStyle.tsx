// import React, { useState } from 'react';
// import { Gem, Sparkles } from 'lucide-react';
// import { apiService, ApiError } from '../../services/api';
// import { FashionPlace } from '../../types';
// import { LoadingSpinner } from '../UI/LoadingSpinner';
// import { ErrorMessage } from '../UI/ErrorMessage';
// import { Card } from '../UI/Card';

// export const UniqueStyle: React.FC = () => {
//   const [userId, setUserId] = useState('');
//   const [currentItemId, setCurrentItemId] = useState('');
//   const [uniquePlaces, setUniquePlaces] = useState<FashionPlace[]>([]);
//   const [uniquenessScore, setUniquenessScore] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleFindUniqueStyle = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!userId.trim() || !currentItemId.trim()) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await apiService.getAntiRecommendations({
//         user_id: userId,
//         current_item_id: currentItemId
//       });
//       setUniquePlaces(response.places);
//       setUniquenessScore(response.uniqueness_score);
//     } catch (err) {
//       setError(err instanceof ApiError ? err.message : 'Failed to find unique style recommendations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Unique Style</h2>
//         <p className="text-gray-600">Discover hidden gems that match your individual taste</p>
//       </div>

//       <Card className="max-w-md mx-auto">
//         <form onSubmit={handleFindUniqueStyle} className="space-y-4">
//           <div>
//             <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
//               Your User ID
//             </label>
//             <input
//               type="text"
//               id="userId"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//               placeholder="Enter your user ID"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label htmlFor="currentItemId" className="block text-sm font-medium text-gray-700 mb-2">
//               Current Item ID
//             </label>
//             <input
//               type="text"
//               id="currentItemId"
//               value={currentItemId}
//               onChange={(e) => setCurrentItemId(e.target.value)}
//               placeholder="Enter current item ID"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               disabled={loading}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !userId.trim() || !currentItemId.trim()}
//             className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//           >
//             {loading ? (
//               <LoadingSpinner size="sm" className="text-white" />
//             ) : (
//               <>
//                 <Gem className="w-5 h-5" />
//                 <span>Discover Unique</span>
//               </>
//             )}
//           </button>
//         </form>
//       </Card>

//       {error && (
//         <div className="max-w-2xl mx-auto">
//           <ErrorMessage message={error} onRetry={() => handleFindUniqueStyle({ preventDefault: () => {} } as React.FormEvent)} />
//         </div>
//       )}

//       {uniquePlaces.length > 0 && (
//         <div className="space-y-6">
//           {uniquenessScore !== null && (
//             <div className="text-center">
//               <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-3 rounded-full">
//                 <Sparkles className="w-6 h-6 text-emerald-600" />
//                 <span className="text-emerald-800 font-semibold">
//                   Uniqueness Score: {Math.round(uniquenessScore * 100)}%
//                 </span>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {uniquePlaces.map((place) => (
//               <Card key={place.id} hover className="space-y-3">
//                 <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
//                   <Gem className="w-8 h-8 text-emerald-500" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-900">{place.name}</h3>
//                   <p className="text-sm text-gray-600 mb-2">{place.location}</p>
//                   <p className="text-xs text-gray-500 mb-2">{place.description}</p>
//                   <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
//                     {place.style_focus}
//                   </span>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import React, { useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { apiService, ApiError } from "../../services/api";
import { FashionPlace, FashionItem } from "../../types"; // Assuming FashionItem can be used for the results
import { LoadingSpinner } from "../UI/LoadingSpinner";
import { ErrorMessage } from "../UI/ErrorMessage";
import { Card } from "../UI/Card";

// This is a simplified type for the anti-recommendation items. Adjust if needed.
interface AntiRecItem extends FashionItem {}

export const UniqueStyle: React.FC = () => {
  const [currentItemDescription, setCurrentItemDescription] = useState("");
  const [stylePreferences, setStylePreferences] = useState("");
  const [uniquePlaces, setUniquePlaces] = useState<AntiRecItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindUniqueStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItemDescription.trim()) return;

    setLoading(true);
    setError(null);
    setUniquePlaces([]);

    try {
      const response = await apiService.getAntiRecommendations({
        current_item_description: currentItemDescription,
        style_preferences: stylePreferences || undefined,
      });
      setUniquePlaces(response.items); // Assuming the response has an 'items' array
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to find unique style recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Unique Style
        </h2>
        <p className="text-gray-600">
          Discover hidden gems by describing an item you're tired of
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleFindUniqueStyle} className="space-y-4">
          <div>
            <label
              htmlFor="currentItemDescription"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Describe a Current Item
            </label>
            <textarea
              id="currentItemDescription"
              value={currentItemDescription}
              onChange={(e) => setCurrentItemDescription(e.target.value)}
              placeholder="e.g., 'a black formal suit' or 'plain white sneakers'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor="stylePreferences"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your General Style (Optional)
            </label>
            <input
              type="text"
              id="stylePreferences"
              value={stylePreferences}
              onChange={(e) => setStylePreferences(e.target.value)}
              placeholder="e.g., 'I usually wear conservative styles'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !currentItemDescription.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Gem className="w-5 h-5" />
                <span>Discover Alternatives</span>
              </>
            )}
          </button>
        </form>
      </Card>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            message={error}
            onRetry={() =>
              handleFindUniqueStyle({
                preventDefault: () => {},
              } as React.FormEvent)
            }
          />
        </div>
      )}

      {uniquePlaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {uniquePlaces.map((item) => (
            <Card key={item.id} hover className="space-y-3">
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
