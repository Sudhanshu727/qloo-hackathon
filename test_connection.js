// Simple test to verify frontend can connect to backend
async function testConnection() {
    try {
        console.log('Testing connection to FastAPI backend...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://127.0.0.1:8000/health');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        // Test search endpoint
        const searchResponse = await fetch('http://127.0.0.1:8000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: 'red dress' })
        });
        const searchData = await searchResponse.json();
        console.log('Search test:', searchData);
        
        console.log('✅ Connection successful!');
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

testConnection();
