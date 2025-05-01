import { NextRequest, NextResponse } from 'next/server';

// Get a service by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const serviceId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/services/${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
      
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock service data in development mode');
        
        return NextResponse.json({
          id: serviceId,
          organization_id: 'mock-org-id',
          name: 'Mock Service',
          description: 'This is a mock service for development',
          payment_link: 'https://example.com/pay/mock',
          created_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in service GET API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// Update a service
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const serviceId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/services/${serviceId}`, {
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
      
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock service update in development mode');
        
        return NextResponse.json({
          id: serviceId,
          organization_id: 'mock-org-id',
          name: body.name || 'Mock Service',
          description: body.description || 'This is a mock service for development',
          payment_link: body.payment_link || 'https://example.com/pay/mock',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in service PUT API route:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// Delete a service
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const serviceId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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
      
      // In development mode, return mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock service deletion in development mode');
        
        return NextResponse.json({
          message: 'Service deleted successfully'
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in service DELETE API route:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
} 