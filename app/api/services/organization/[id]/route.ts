import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract organization ID from params
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
    
    try {
      // Forward the request to the backend API
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/services/organization/${organizationId}`, {
        headers: {
          'Authorization': authHeader || devAuthToken || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Backend returned status: ${response.status}`);
      }
      
      // Get the response data
      const data = await response.json();
      
      // Return the services as JSON
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching services from backend:', error);
      
      // In development mode, return mock data if the backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock service data for development');
        const mockServices = [
          {
            id: '1',
            organization_id: organizationId,
            name: 'Web Development',
            description: 'Full-stack web application development',
            price: 120.00,
            currency: 'USD',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            organization_id: organizationId,
            name: 'UI/UX Design',
            description: 'User interface and experience design',
            price: 95.00,
            currency: 'USD',
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            organization_id: organizationId,
            name: 'SEO Optimization',
            description: 'Search engine optimization services',
            price: 75.00,
            currency: 'USD',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        return NextResponse.json(mockServices);
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in services API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
} 