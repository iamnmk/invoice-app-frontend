import { NextRequest, NextResponse } from 'next/server';

// Get all signatures for a user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Get user_id from query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const organizationId = url.searchParams.get('organization_id');
    
    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User ID and Organization ID are required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/signatures?user_id=${userId}&organization_id=${organizationId}`, {
        headers: {
          'Authorization': authHeader || devAuthToken || ''
        }
      });
      
      if (!response.ok) {
        return NextResponse.json(
          { error: `Backend returned status: ${response.status}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (backendError) {
      console.error('Error connecting to backend:', backendError);
      
      // In development mode, return a mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock signature data in development mode');
        
        return NextResponse.json([
          {
            id: 'dev-signature-id',
            user_id: userId,
            organization_id: organizationId,
            signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // A minimal transparent PNG
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in signatures API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}

// Create a new signature
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.organization_id || !body.signature_image) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, organization_id, and signature_image are required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || devAuthToken || ''
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
      }
      
      return NextResponse.json(data);
    } catch (backendError) {
      console.error('Error connecting to backend:', backendError);
      
      // In development mode, return a mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock signature creation in development mode');
        
        return NextResponse.json({
          id: 'dev-' + Date.now().toString(),
          user_id: body.user_id,
          organization_id: body.organization_id,
          signature_image: body.signature_image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in signatures API route:', error);
    return NextResponse.json(
      { error: 'Failed to create signature' },
      { status: 500 }
    );
  }
} 