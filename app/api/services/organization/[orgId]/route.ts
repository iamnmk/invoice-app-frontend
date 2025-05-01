import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { orgId: string } }
) {
  try {
    const orgId = context.params.orgId;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/services/organization/${orgId}`, {
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
        
        return NextResponse.json([
          {
            id: 'mock-service-1',
            organization_id: orgId,
            name: 'Web Development',
            description: 'Full-stack web application development services',
            payment_link: 'https://example.com/pay/web-dev',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-service-2',
            organization_id: orgId,
            name: 'UI/UX Design',
            description: 'User interface and experience design services',
            payment_link: null,
            created_at: new Date().toISOString()
          }
        ]);
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in services organization API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization services' },
      { status: 500 }
    );
  }
} 