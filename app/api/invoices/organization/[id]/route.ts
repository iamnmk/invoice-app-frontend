import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract organization ID from params (using awaited params)
    const organizationId = params?.id;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Get auth token from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/invoices/organization/${organizationId}`, {
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
    
    // Get the response data
    const data = await response.json();
    
    // Return the invoices as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in invoices API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 