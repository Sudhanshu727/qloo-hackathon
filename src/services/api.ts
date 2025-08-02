const API_BASE_URL = "http://127.0.0.1:8000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FashionItemResponse {
  id: string;
  original_id: string;
  image_url: string;
  clothing_type: string;
  dominant_color: string;
  pattern_type?: string;
  occasion_suitability: string[];
  style?: string;
}

export interface InspirationResponse {
  suggestion_type: string;
  message: string;
  items: FashionItemResponse[];
}

// Custom error class that implements the ApiError interface
export class ApiError extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export const apiService = {
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Health check failed" }));
        throw new ApiError(
          error.message || "Health check failed",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Health check failed", "NETWORK_ERROR");
    }
  },

  async getInspiration(userId: string): Promise<InspirationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/actionable-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: userId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to get inspiration",
          details: `Server responded with status ${response.status}`,
        }));

        if (
          response.status === 404 &&
          error.message?.includes("models/gemini-pro")
        ) {
          console.warn(
            "Gemini model not available, using fallback suggestions"
          );
        }

        throw new ApiError(
          error.message || "Failed to get inspiration",
          response.status.toString(),
          error.details
        );
      }

      const data = await response.json();
      if (!data.items || !Array.isArray(data.items)) {
        throw new ApiError(
          "Invalid response format from server",
          "INVALID_RESPONSE"
        );
      }

      return {
        suggestion_type: data.suggestion_type || "fashion_recommendations",
        message: data.message || "Here are some fashion suggestions:",
        items: data.items,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : "Failed to get inspiration",
        "NETWORK_ERROR"
      );
    }
  },

  async search(query: string, stylePreferences?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, stylePreferences }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.detail) {
          throw new ApiError(errorData.detail, response.status.toString());
        } else {
          throw new ApiError(
            `Search failed with status ${response.status}`,
            response.status.toString()
          );
        }
      }

      const data = await response.json();
      if (!data.items || !Array.isArray(data.items)) {
        throw new ApiError(
          "Invalid response format from server",
          "INVALID_RESPONSE"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : "Search request failed",
        "NETWORK_ERROR"
      );
    }
  },

  async filterItems(filters: {
    clothing_type?: string;
    dominant_color?: string;
    pattern_type?: string;
    occasion_suitability?: string;
    gender_suitability?: string;
    sleeve_type?: string;
    neckline?: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/filter-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Filter request failed" }));
        throw new ApiError(
          error.message || "Filter request failed",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Filter request failed", "NETWORK_ERROR");
    }
  },

  async getRecommendations() {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`);
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to fetch recommendations" }));
        throw new ApiError(
          error.message || "Failed to fetch recommendations",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Failed to fetch recommendations", "NETWORK_ERROR");
    }
  },

  async getCulturalInsights(style: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/cultural-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ style }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to fetch cultural insights",
          details: `Server responded with status ${response.status}`,
        }));

        if (
          response.status === 404 &&
          error.message?.includes("models/gemini-pro")
        ) {
          console.warn(
            "Gemini model not available for cultural insights, using fallback system"
          );
        }

        throw new ApiError(
          error.message || "Failed to fetch cultural insights",
          response.status.toString(),
          error.details
        );
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new ApiError(
          "Invalid response format from server",
          "INVALID_RESPONSE",
          "Response missing required cultural insights data"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Failed to fetch cultural insights", "NETWORK_ERROR");
    }
  },

  async analyzeFashionStyle(imageData: FormData) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-style`, {
        method: "POST",
        body: imageData,
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Style analysis failed" }));
        throw new ApiError(
          error.message || "Style analysis failed",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Style analysis failed", "NETWORK_ERROR");
    }
  },

  // Corrected function for FashionTwin.tsx
  async findTwin(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/find-twin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Fashion twin search failed" }));
        throw new ApiError(
          error.message || "Fashion twin search failed",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Fashion twin search failed", "NETWORK_ERROR");
    }
  },

  // Corrected function for ChoiceApproval.tsx
  async getChoiceApproval({
    item_description,
    user_style,
  }: {
    item_description: string;
    user_style?: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/get-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_description, user_style }),
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Approval request failed" }));
        throw new ApiError(
          error.message || "Approval request failed",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Approval request failed", "NETWORK_ERROR");
    }
  },

  async getMixedCultureRecommendations({
    user_id,
    cultures,
  }: {
    user_id: string;
    cultures: string[];
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/cultural-fusion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, cultures }),
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({
            message: "Failed to get cultural fusion recommendations",
          }));
        throw new ApiError(
          error.message || "Failed to get cultural fusion recommendations",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        "Failed to get cultural fusion recommendations",
        "NETWORK_ERROR"
      );
    }
  },

  // Added function for UniqueStyle.tsx
  async getAntiRecommendations({
    user_id,
    current_item_id,
  }: {
    user_id: string;
    current_item_id: string;
  }) {
    try {
      // Note: The '/anti-recommendations' endpoint is an assumption. 
      // Please verify this with your backend API.
      const response = await fetch(`${API_BASE_URL}/anti-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, current_item_id }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to find unique style recommendations",
        }));
        throw new ApiError(
          error.message || "Failed to find unique style recommendations",
          response.status.toString()
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        "Failed to find unique style recommendations",
        "NETWORK_ERROR"
      );
    }
  },
};