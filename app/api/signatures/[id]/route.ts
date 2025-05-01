import { NextRequest, NextResponse } from 'next/server';

// Get a signature by ID
export async function GET(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const signatureId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/signatures/${signatureId}`, {
        headers: {
          'Authorization': authHeader || devAuthToken || ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          errorData.error ? errorData : { error: `Backend returned status: ${response.status}` },
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
        return NextResponse.json({
          id: signatureId,
          user_id: 'dev-user-id',
          organization_id: 'dev-org-id',
          signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // A minimal transparent PNG
          signature_name: 'Development Signature',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in signature GET API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signature' },
      { status: 500 }
    );
  }
}

// Update a signature by ID
export async function PUT(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const signatureId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.signature_image) {
      return NextResponse.json(
        { error: 'Signature image is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/signatures/${signatureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || devAuthToken || ''
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          errorData.error ? errorData : { error: `Backend returned status: ${response.status}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (backendError) {
      console.error('Error connecting to backend:', backendError);
      
      // In development mode, return a mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock signature update in development mode');
        return NextResponse.json({
          id: signatureId,
          user_id: body.user_id || 'dev-user-id',
          organization_id: body.organization_id || 'dev-org-id',
          signature_image: body.signature_image,
          signature_name: body.signature_name || 'Updated Signature',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in signature PUT API route:', error);
    return NextResponse.json(
      { error: 'Failed to update signature' },
      { status: 500 }
    );
  }
}

// Delete a signature by ID
export async function DELETE(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const signatureId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/signatures/${signatureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader || devAuthToken || ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          errorData.error ? errorData : { error: `Backend returned status: ${response.status}` },
          { status: response.status }
        );
      }
      
      return NextResponse.json({ success: true });
    } catch (backendError) {
      console.error('Error connecting to backend:', backendError);
      
      // In development mode, return a success response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock signature deletion in development mode');
        return NextResponse.json({ success: true });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in signature DELETE API route:', error);
    return NextResponse.json(
      { error: 'Failed to delete signature' },
      { status: 500 }
    );
  }
} 