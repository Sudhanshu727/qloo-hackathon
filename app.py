import os
import sys
import json
import requests
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
import google.generativeai as genai
import random

GEMINI_API_KEY = "AIzaSyCmgKxKEWO4uEI5tlQ6XdlNGtjj6SWFUjI"
QLOO_API_KEY = "P47XJ-8yWaXrcxRkDu7XJPCeLXvNhGLGsMKcYLWTXkA"
QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2"
QDRANT_URL = "https://c977d41b-092f-4746-8055-e0c1974ed673.europe-west3-0.gcp.cloud.qdrant.io"
QDRANT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.-IpipKy3ymQr1qZIAvAzNZ87K1e0Qxd8B2MNKTWY07w"

QDRANT_COLLECTION_NAME = "fashion_clip_recommender"
GEMINI_EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIMENSION = 768

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Qloo Fashion AI API...")
    if not client_manager.initialize_clients():
        print("Failed to initialize clients")
        sys.exit(1)
    print("All clients initialized successfully")
    yield
    print("Shutting down Qloo Fashion AI API...")

app = FastAPI(
    title="Qloo Fashion AI API",
    description="A comprehensive fashion recommendation system using Qloo API, Qdrant vector search, and Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8080",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="data/image"), name="images")

class ClientManager:
    def __init__(self):
        self.qdrant_client = None
        self.gemini_configured = False
        
    def initialize_clients(self):
        try:
            self.qdrant_client = QdrantClient(
                url=QDRANT_URL,
                api_key=QDRANT_API_KEY,
            )
            print("Qdrant client initialized successfully")

            genai.configure(api_key=GEMINI_API_KEY)
            self.gemini_configured = True
            print("Gemini client configured successfully")
            
            return True
        except Exception as e:
            print(f"Failed to initialize clients: {e}")
            return False
    
    def get_qdrant_client(self):
        if self.qdrant_client is None:
            raise HTTPException(status_code=500, detail="Qdrant client not initialized")
        return self.qdrant_client
    
    def is_gemini_configured(self):
        return self.gemini_configured
        
    def get_embedding(self, text: str) -> List[float]:
        if not self.is_gemini_configured():
            raise HTTPException(status_code=500, detail="Gemini client not configured")
            
        result = genai.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            content=text,
            task_type="RETRIEVAL_QUERY"
        )
        embedding = result['embedding']
        
        if len(embedding) > 512:
            embedding = embedding[:512]
            
        return embedding

client_manager = ClientManager()

class UserPreferencesRequest(BaseModel):
    preferences: str = Field(..., example="I love minimalist style, prefer neutral colors, and like comfortable casual wear")

class CultureRequest(BaseModel):
    cultures: List[str] = Field(..., example=["Japanese", "Italian"])
    preferences: Optional[str] = Field(None, example="I prefer modern fusion styles")

class SearchRequest(BaseModel):
    query: str = Field(..., example="red summer dress")
    style_preferences: Optional[str] = Field(None, example="I prefer elegant, formal styles")

class AntiRecommendationRequest(BaseModel):
    current_item_description: str = Field(..., example="black formal suit")
    style_preferences: Optional[str] = Field(None, example="I usually wear conservative styles")

class ChoiceApprovalRequest(BaseModel):
    item_description: str = Field(..., example="floral summer dress")
    user_style: Optional[str] = Field(None, example="I love romantic, feminine styles")

class FashionItem(BaseModel):
    id: str
    original_id: str
    image_url: str
    clothing_type: str
    dominant_color: str
    secondary_color: Optional[str]
    pattern_type: Optional[str]
    occasion_suitability: List[str]
    gender_suitability: List[str]
    sleeve_type: Optional[str]
    neckline: Optional[str]
    closure_type: Optional[str]
    pattern_description: Optional[str]
    remarks: Optional[str]

def generate_user_profile(preferences: Optional[str] = None, context: Optional[str] = None) -> dict:
    try:
        if not client_manager.is_gemini_configured():
            return {
                "style_preference": "casual-modern",
                "color_preference": ["neutral", "earth-tones"],
                "occasion_focus": ["casual", "work"],
                "personality": "practical-minimalist"
            }
        
        prompt = f"""
        Based on the following information, create a detailed fashion user profile:
        
        User Preferences: {preferences or "No specific preferences mentioned"}
        Context: {context or "General fashion recommendations"}
        
        Generate a JSON response with these fields:
        - style_preference: (e.g., "minimalist", "bohemian", "classic", "trendy", "edgy")
        - color_preference: array of preferred colors
        - occasion_focus: array of occasions they dress for
        - personality: brief style personality description
        - age_group: estimated age group (young-adult, adult, mature)
        - lifestyle: (e.g., "active", "professional", "casual", "social")
        
        Return only valid JSON, no other text.
        """
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        try:
            return json.loads(response.text)
        except:
            return {
                "style_preference": "contemporary",
                "color_preference": ["versatile", "classic"],
                "occasion_focus": ["everyday", "work"],
                "personality": "adaptable-style",
                "age_group": "adult",
                "lifestyle": "balanced"
            }
            
    except Exception as e:
        print(f"Profile generation error: {e}")
        return {
            "style_preference": "versatile",
            "color_preference": ["neutral"],
            "occasion_focus": ["casual"],
            "personality": "practical"
        }

def qdrant_payload_to_fashion_item(point) -> FashionItem:
    payload = point.payload
    return FashionItem(
        id=str(point.id),
        original_id=payload.get('original_id', ''),
        image_url=f"/images/{payload.get('original_id', '')}.jpg",
        clothing_type=payload.get('clothing_type', ''),
        dominant_color=payload.get('dominant_color', ''),
        secondary_color=payload.get('secondary_color'),
        pattern_type=payload.get('pattern_type'),
        occasion_suitability=payload.get('occasion_suitability', []),
        gender_suitability=payload.get('gender_suitability', []),
        sleeve_type=payload.get('sleeve_type'),
        neckline=payload.get('neckline'),
        closure_type=payload.get('closure_type'),
        pattern_description=payload.get('pattern_description'),
        remarks=payload.get('remarks')
    )

class CulturalFusionRequest(BaseModel):
    user_id: str
    cultures: List[str]

@app.post("/cultural-fusion")
async def get_cultural_fusion_recommendations(request: CulturalFusionRequest):
    try:
        # Generate a cultural fusion query using Gemini
        culture_prompt = f"""
        Create a fashion blend description combining these cultural styles: {', '.join(request.cultures)}.
        Focus on how these cultures uniquely mix in terms of:
        - Colors
        - Patterns
        - Silhouettes
        - Materials
        Keep it concise but descriptive.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        fusion_description = model.generate_content(culture_prompt).text
        
        # Use the generated description to find relevant fashion items
        query_vector = get_gemini_embedding(fusion_description)
        search_results = client_manager.qdrant_client.search(
            collection_name=QDRANT_COLLECTION_NAME,
            query_vector=query_vector,
            limit=9
        )
        
        # Convert the results to fashion items
        items = [qdrant_payload_to_fashion_item(point) for point in search_results]
        
        # Generate a cultural blend name
        blend_name = ' × '.join(culture.capitalize() for culture in request.cultures)
        
        return {
            "items": items,
            "cultural_blend": blend_name,
            "description": fusion_description
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_gemini_embedding(text: str) -> List[float]:
    try:
        if not client_manager.is_gemini_configured():
            raise HTTPException(status_code=500, detail="Gemini client not configured")
            
        result = genai.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            content=text,
            task_type="RETRIEVAL_QUERY"
        )
        embedding = result['embedding']
        
        if len(embedding) > 512:
            embedding = embedding[:512]
            
        return embedding
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini embedding failed: {e}")

def search_fashion_items_in_qdrant(query: str, limit: int = 10, user_profile: Optional[dict] = None) -> List[FashionItem]:
    try:
        enhanced_query = query
        if user_profile:
            style_context = f" {user_profile.get('style_preference', '')} style"
            color_context = f" in {', '.join(user_profile.get('color_preference', []))} colors"
            enhanced_query = f"{query}{style_context}{color_context}"
        
        query_vector = get_gemini_embedding(enhanced_query)
        
        qdrant_client = client_manager.get_qdrant_client()
        hits = qdrant_client.search(
            collection_name=QDRANT_COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )
        
        fashion_items = []
        for hit in hits:
            try:
                item = qdrant_payload_to_fashion_item(hit)
                fashion_items.append(item)
            except Exception as e:
                print(f"Error converting item: {e}")
                continue
                
        return fashion_items
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fashion search failed: {e}")

def get_qdrant_item_details(item_ids: List[int]) -> List[dict]:
    try:
        qdrant_client = client_manager.get_qdrant_client()
        records = qdrant_client.retrieve(
            collection_name=QDRANT_COLLECTION_NAME,
            ids=item_ids,
            with_payload=True
        )
        return [record.payload for record in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant retrieval failed: {e}")

def get_anti_recommendations(current_item_description: str, style_preferences: Optional[str] = None):
    try:
        user_profile = generate_user_profile(style_preferences, f"Finding opposite styles to: {current_item_description}")
        
        prompt = f"""
        Current item: {current_item_description}
        User style: {style_preferences or 'Not specified'}
        
        Generate a search query for fashion items that would be the OPPOSITE style/aesthetic.
        Consider opposite colors, formality levels, patterns, and overall vibe.
        Return only the search query, no other text.
        """
        
        if client_manager.is_gemini_configured():
            model = genai.GenerativeModel('gemini-1.5-flash') 
            response = model.generate_content(prompt)
            opposite_query = response.text.strip()
        else:
            opposite_query = "unique alternative fashion styles"
        
        items = search_fashion_items_in_qdrant(opposite_query, limit=8)
        
        return {
            "type": "anti_recommendations",
            "message": f"Here are some unique alternatives to '{current_item_description}':",
            "original_item": current_item_description,
            "items": [item.dict() for item in items],
            "search_context": opposite_query
        }
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Anti-recommendation generation failed: {e}")


def get_actionable_suggestions(style_preferences: Optional[str] = None):
    try:
        print(f"Generating suggestions for style preferences: {style_preferences}")
        user_profile = generate_user_profile(style_preferences, "General fashion recommendations")
        print(f"Generated user profile: {user_profile}")
        
        queries = []
        
        style = user_profile.get('style_preference', 'contemporary')
        colors = user_profile.get('color_preference', ['versatile'])
        occasions = user_profile.get('occasion_focus', ['everyday'])
        
        base_query = f"{style} {colors[0]} {occasions[0]} outfit"
        print(f"Base query: {base_query}")
        queries.append(base_query)
        
        if len(occasions) > 1:
            queries.append(f"{style} {occasions[1]} wear")
        if len(colors) > 1:
            queries.append(f"{colors[1]} {style} clothing")
        
        print(f"Generated queries: {queries}")
        
        all_items = []
        for query in queries[:2]:
            try:
                items = search_fashion_items_in_qdrant(query, limit=4, user_profile=user_profile)
                print(f"Found {len(items)} items for query: {query}")
                all_items.extend(items)
            except Exception as query_error:
                print(f"Error searching for query '{query}': {query_error}")
                continue
        
        if not all_items:
            # Fallback to a simpler query if no items found
            fallback_query = "versatile fashion clothing"
            print(f"No items found, trying fallback query: {fallback_query}")
            try:
                items = search_fashion_items_in_qdrant(fallback_query, limit=8)
                all_items.extend(items)
            except Exception as fallback_error:
                print(f"Fallback query failed: {fallback_error}")
        
        seen_ids = set()
        unique_items = []
        for item in all_items:
            if item.id not in seen_ids:
                unique_items.append(item)
                seen_ids.add(item.id)
        
        print(f"Found {len(unique_items)} unique items")
        
        return {
            "suggestion_type": "personalized_recommendations",
            "message": "Based on your style preferences, here are some suggestions:",
            "user_profile": user_profile,
            "items": [item.dict() for item in unique_items[:8]]
        }
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Suggestion generation failed: {e}")


def get_mixed_culture_recommendations(cultures: List[str], preferences: Optional[str] = None):
    try:
        cultural_context = f"Interested in blending {' and '.join(cultures)} cultural fashion elements"
        user_profile = generate_user_profile(preferences, cultural_context)
        
        culture_query = f"fashion style combining {' and '.join(cultures)} cultural elements"
        
        if client_manager.is_gemini_configured():
            prompt = f"""
            Create a fashion search query that blends these cultural styles: {', '.join(cultures)}
            User preferences: {preferences or 'Not specified'}
            
            Focus on clothing items that authentically represent elements from these cultures.
            Return only the search query, no other text.
            """
            
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            enhanced_query = response.text.strip()
        else:
            enhanced_query = culture_query
        
        items = search_fashion_items_in_qdrant(enhanced_query, limit=10, user_profile=user_profile)
        
        return {
            "type": "mixed_culture_recommendations",
            "cultures": cultures,
            "message": f"Fashion items blending {' and '.join(cultures)} styles:",
            "search_query": enhanced_query,
            "items": [item.dict() for item in items]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mixed culture recommendation failed: {e}")


def find_fashion_twin(style_preferences: Optional[str] = None):
    try:
        user_profile = generate_user_profile(style_preferences, "Finding similar style items")
        
        style_query = f"{user_profile.get('style_preference', 'contemporary')} "
        style_query += f"{user_profile.get('personality', 'versatile')} style clothing"
        
        if user_profile.get('lifestyle'):
            style_query += f" for {user_profile.get('lifestyle')} lifestyle"
        
        twin_items = search_fashion_items_in_qdrant(style_query, limit=6, user_profile=user_profile)
        
        return {
            "message": "Found fashion items that match your style profile!",
            "style_profile": user_profile,
            "twin_items": [item.dict() for item in twin_items],
            "note": "These items reflect your fashion personality and preferences."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fashion twin search failed: {e}")


def search_fashion_items(query: str, style_preferences: Optional[str] = None):
    try:
        user_profile = generate_user_profile(style_preferences, f"Searching for: {query}")
        
        items = search_fashion_items_in_qdrant(query, limit=12, user_profile=user_profile)
        
        return {
            "query": query,
            "personalization": user_profile if style_preferences else None,
            "items": [item.dict() for item in items],
            "total_results": len(items)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fashion search failed: {e}")


def get_choice_approval(item_description: str, user_style: Optional[str] = None):
    try:
        user_profile = generate_user_profile(user_style, f"Evaluating: {item_description}")
        
        if not client_manager.is_gemini_configured():
            return {
                "item_description": item_description,
                "affinity_score": 0.75,
                "approval": "Good Choice!",
                "message": "This looks like a solid choice for you.",
                "user_profile": user_profile
            }
        
        prompt = f"""
        Analyze this fashion choice for someone with this style profile:
        
        Item: {item_description}
        User Style Profile: {json.dumps(user_profile, indent=2)}
        User Preferences: {user_style or 'Not specified'}
        
        Provide a fashion recommendation with:
        1. Compatibility score (0.0 to 1.0)
        2. Approval level (Excellent/Good/Maybe Not)
        3. Brief explanation why it fits or doesn't fit their style
        
        Format as JSON:
        {{
            "affinity_score": 0.85,
            "approval": "Excellent Choice!",
            "message": "Brief explanation here",
            "style_analysis": "Detailed style analysis here"
        }}
        
        Return only valid JSON.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        try:
            ai_analysis = json.loads(response.text)
        except:
            ai_analysis = {
                "affinity_score": 0.7,
                "approval": "Good Choice!",
                "message": "This item aligns with your style preferences.",
                "style_analysis": "AI analysis unavailable, but this appears to be a suitable choice."
            }
        
        return {
            "item_description": item_description,
            "user_profile": user_profile,
            **ai_analysis
        }
        
    except Exception as e:
        return {
            "item_description": item_description,
            "affinity_score": 0.6,
            "approval": "Unable to Analyze",
            "message": f"Analysis failed: {str(e)}",
            "user_profile": user_profile if 'user_profile' in locals() else {}
        }

@app.get("/", summary="Root endpoint for health check")
def read_root():
    return {
        "status": "ok", 
        "message": "Welcome to the Qloo Fashion AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.post("/anti-recommendations", summary="Get Unique Fashion Recommendations")
def api_get_anti_recommendations(request: AntiRecommendationRequest):
    return get_anti_recommendations(request.current_item_description, request.style_preferences)

@app.get("/actionable-suggestions", summary="Get Personalized Fashion Suggestions")
@app.post("/actionable-suggestions", summary="Get Personalized Fashion Suggestions")
def api_get_actionable_suggestions(preferences: UserPreferencesRequest = None):
    try:
        print("Received request for actionable suggestions")
        print(f"Preferences object: {preferences}")
        
        style_prefs = preferences.preferences if preferences else None
        print(f"Extracted style preferences: {style_prefs}")
        
        # Try a simple fallback suggestion if no preferences provided
        if not style_prefs:
            print("No preferences provided, using fallback suggestions")
            try:
                qdrant_client = client_manager.get_qdrant_client()
                query_vector = get_gemini_embedding("versatile casual fashion items")
                hits = qdrant_client.search(
                    collection_name=QDRANT_COLLECTION_NAME,
                    query_vector=query_vector,
                    limit=8,
                    with_payload=True
                )
                
                items = []
                for hit in hits:
                    try:
                        item = qdrant_payload_to_fashion_item(hit)
                        items.append(item.dict())
                    except Exception as e:
                        print(f"Error converting item: {e}")
                        continue
                
                return {
                    "suggestion_type": "general_recommendations",
                    "message": "Here are some versatile fashion suggestions:",
                    "items": items
                }
            except Exception as e:
                print(f"Fallback suggestion failed: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to get fallback suggestions: {str(e)}")
        
        result = get_actionable_suggestions(style_prefs)
        print("Successfully generated suggestions")
        return result
        
    except Exception as e:
        print(f"Error in api_get_actionable_suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")

@app.post("/mixed-culture-recommendations", summary="Get Recommendations Blending Cultures")
def api_get_mixed_culture_recommendations(request: CultureRequest):
    return get_mixed_culture_recommendations(request.cultures, request.preferences)

@app.get("/find-twin", summary="Find Fashion Items Matching Your Style")
@app.post("/find-twin", summary="Find Fashion Items Matching Your Style")
def api_find_fashion_twin(preferences: UserPreferencesRequest = None):
    style_prefs = preferences.preferences if preferences else None
    return find_fashion_twin(style_prefs)

@app.post("/search", summary="Search for Fashion Items with Natural Language")
def api_search_fashion_items(request: SearchRequest):
    return search_fashion_items(request.query, request.style_preferences)

@app.get("/search/{query}", summary="Search for Fashion Items (GET)")
def api_search_fashion_items_get(query: str):
    return search_fashion_items(query)

@app.post("/choice-approval", summary="Get AI Fashion Approval Rating")
def api_get_choice_approval(request: ChoiceApprovalRequest):
    return get_choice_approval(request.item_description, request.user_style)

@app.get("/browse-items", summary="Browse Random Fashion Items")
def api_browse_items(limit: int = 20):
    try:
        qdrant_client = client_manager.get_qdrant_client()
        
        random_offset = random.randint(0, 1500)
        
        points, _ = qdrant_client.scroll(
            collection_name=QDRANT_COLLECTION_NAME,
            limit=limit,
            offset=random_offset,
            with_payload=True
        )
        
        items = []
        for point in points:
            try:
                item = qdrant_payload_to_fashion_item(point)
                items.append(item.dict())
            except Exception as e:
                print(f"Error converting browse item: {e}")
                continue
        
        return {
            "message": "Random fashion items for browsing",
            "items": items,
            "total": len(items)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Browse failed: {e}")

@app.get("/items/by-color/{color}", summary="Get Items by Color")
def api_get_items_by_color(color: str, limit: int = 15):
    try:
        qdrant_client = client_manager.get_qdrant_client()
        
        query = f"{color} colored clothing fashion"
        query_vector = get_gemini_embedding(query)
        
        hits = qdrant_client.search(
            collection_name=QDRANT_COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )
        
        items = []
        for hit in hits:
            try:
                item = qdrant_payload_to_fashion_item(hit)
                items.append(item.dict())
            except Exception as e:
                print(f"Error converting color item: {e}")
                continue
        
        return {
            "color": color,
            "message": f"Fashion items in {color}",
            "items": items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Color search failed: {e}")

@app.get("/health", summary="Detailed Health Check")
def health_check():
    health_status = {
        "status": "healthy",
        "services": {
            "qdrant": "unknown",
            "gemini": "unknown",
            "qloo": "unknown"
        }
    }
    
    try:
        client_manager.get_qdrant_client()
        health_status["services"]["qdrant"] = "healthy"
    except Exception:
        health_status["services"]["qdrant"] = "unhealthy"
        health_status["status"] = "degraded"
    
    if client_manager.is_gemini_configured():
        health_status["services"]["gemini"] = "healthy"
    else:
        health_status["services"]["gemini"] = "unhealthy"
        health_status["status"] = "degraded"
    
    try:
        headers = {"X-Api-Key": QLOO_API_KEY}
        response = requests.get(f"{QLOO_BASE_URL}/insights", headers=headers, params={"filter.type": "urn:entity:place", "take": 1}, timeout=5)
        if response.status_code in [200, 400]:
            health_status["services"]["qloo"] = "healthy"
        else:
            health_status["services"]["qloo"] = "unhealthy"
            health_status["status"] = "degraded"
    except Exception:
        health_status["services"]["qloo"] = "unhealthy"
        health_status["status"] = "degraded"
    
    return health_status

if __name__ == "__main__":
    import uvicorn
    print("Starting Qloo Fashion AI FastAPI server...")
    print("API Documentation will be available at: http://127.0.0.1:8000/docs")
    print("ReDoc Documentation will be available at: http://127.0.0.1:8000/redoc")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)