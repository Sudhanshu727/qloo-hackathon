# Qloo Fashion AI

A comprehensive fashion recommendation system that combines the power of Qloo API, Qdrant vector search, and Gemini AI to provide intelligent fashion insights and recommendations.

## 🌟 Features

### 🎯 Core Capabilities
- **Smart Search**: Natural language search for fashion items using vector embeddings
- **Anti-Recommendations**: Discover unique, off-the-beaten-path fashion places
- **Cultural Fusion**: Blend different cultural fashion styles using AI
- **Fashion Twin**: Find users with similar fashion taste
- **Choice Approval**: Get AI-powered approval ratings for fashion choices
- **Actionable Suggestions**: Get recommendations for fashion places and stores

### 🔧 Technical Stack
- **FastAPI**: Modern, fast web framework for building APIs
- **Qloo API**: Fashion insights and recommendations
- **Qdrant**: Vector similarity search for fashion items
- **Gemini AI**: Text embeddings and cultural style generation
- **CLI Support**: Complete command-line interface

## 🚀 Quick Start

### Prerequisites
```bash
pip install -r requirements.txt
```

### Running the FastAPI Server
```bash
python app.py
```

The server will start on `http://127.0.0.1:8000`

### API Documentation
- **Interactive Docs**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### Using the CLI
```bash
# Navigate to CLI_APP directory and run commands
cd CLI_APP
python -m cli_app.cli search --query "red summer dress"
```

## 📋 API Endpoints

### POST `/search`
Search for fashion items using natural language
```json
{
  "query": "red summer dress"
}
```

### GET `/actionable-suggestions/{user_id}`
Get fashion place recommendations for a user

### POST `/mixed-culture-recommendations`
Get fashion items blending cultural styles
```json
{
  "user_id": "user_123",
  "cultures": ["Japanese", "Italian"]
}
```

### POST `/anti-recommendations`
Get unique, less popular fashion recommendations
```json
{
  "user_id": "user_123",
  "current_item_id": "item_456"
}
```

### GET `/find-twin/{user_id}`
Find a fashion twin with similar taste

### POST `/choice-approval`
Get approval rating for a fashion choice
```json
{
  "user_id": "user_123",
  "item_id": "item_456"
}
```

### GET `/health`
Detailed health check for all services

## 🛠️ Development

### Project Structure
```
├── app.py              # FastAPI application
├── cli_app/            # CLI application modules
│   ├── __init__.py
│   ├── cli.py          # CLI interface
│   ├── clients.py      # API client management
│   ├── config.py       # Configuration
│   ├── features.py     # Core features
│   └── helpers.py      # Helper functions
├── requirements.txt    # Dependencies
└── README.md          # This file
```

### Environment Setup
For production, set these environment variables:
```bash
export GEMINI_API_KEY="your_gemini_key"
export QLOO_API_KEY="your_qloo_key"
export QDRANT_URL="your_qdrant_url"
export QDRANT_API_KEY="your_qdrant_key"
```

## 🔗 API Integration Details

### Qloo API
- **Base URL**: `https://hackathon.api.qloo.com/v2`
- **Authentication**: `X-Api-Key` header
- **Entity Types**: Places with fashion tags
- **Endpoints**: `/insights` for recommendations

### Qdrant Vector Database
- **Collection**: `fashion_clip_recommender`
- **Vectors**: 512-dimensional (truncated from Gemini's 768)
- **Search**: Cosine similarity for fashion item matching

### Gemini AI
- **Model**: `models/text-embedding-004`
- **Use Cases**: 
  - Text-to-vector embeddings for search
  - Cultural style query generation
  - Natural language processing

## 📊 Example Responses

### Search Results
```json
[
  {
    "clothing_type": "T-shirt",
    "gender_suitability": ["Unisex"],
    "occasion_suitability": ["Casual"],
    "dominant_color": "Red",
    "pattern_type": "Solid",
    "original_id": "12345_00"
  }
]
```

### Mixed Culture Recommendations
```json
{
  "type": "mixed_culture_recommendations",
  "cultures": ["Japanese", "Italian"],
  "message": "Fashion items blending Japanese and Italian styles:",
  "items": [...]
}
```

### Fashion Places
```json
{
  "suggestion_type": "fashion_places_discovery",
  "message": "Based on fashion trends, you might want to visit these places:",
  "places": ["Fashion Boutique Milano", "Tokyo Style House"]
}
```

## 🏃‍♂️ Running Examples

### FastAPI Examples
```bash
# Start the server
python app.py

# Test with curl
curl -X POST "http://127.0.0.1:8000/search" \
     -H "Content-Type: application/json" \
     -d '{"query": "blue jeans"}'

curl "http://127.0.0.1:8000/actionable-suggestions/user_123"
```

### CLI Examples
```bash
cd CLI_APP
python -m cli_app.cli search --query "blue jeans"
python -m cli_app.cli mixed-culture --user-id user_123 --cultures "Japanese,Italian"
```

## 🐛 Troubleshooting

### Common Issues
1. **Import Errors**: Make sure all dependencies are installed
2. **API Keys**: Verify all API keys are correctly configured
3. **Network Issues**: Check internet connection for API calls
4. **Vector Dimensions**: The app handles Gemini's 768→512 dimension conversion automatically

### Health Check
Visit `http://127.0.0.1:8000/health` to verify all services are working correctly.

## 🚀 Deployment

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
```

### Production Considerations
- Use environment variables for API keys
- Set up proper logging
- Configure rate limiting
- Add authentication/authorization
- Use a production ASGI server (Gunicorn + Uvicorn)

## 📝 License

This project was created for the Qloo LLM Hackathon.

## Authors
Soumya Sourav Das | Devyanshi Bansal | Mansi Gahlawat | Sudhanshu Shekhar
