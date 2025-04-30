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
      const response = await fetch(`${backendUrl}/api/clients/organization/${organizationId}`, {
        headers: {
          'Authorization': authHeader || devAuthToken || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Backend returned status: ${response.status}`);
      }
      
      // Get the response data
      const data = await response.json();
      
      // Return the clients as JSON
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching clients from backend:', error);
      
      // In development mode, return mock data if the backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock client data for development');
        const mockClients = [
          {
            id: '1',
            organization_id: organizationId,
            name: 'Acme Corporation',
            email: 'contact@acme.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business Ave, Suite 100, New York, NY 10001',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            organization_id: organizationId,
            name: 'Stark Industries',
            email: 'info@stark.com',
            phone: '+1 (555) 987-6543',
            address: '200 Park Avenue, New York, NY 10166',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            organization_id: organizationId,
            name: 'Wayne Enterprises',
            email: 'support@wayne.com',
            phone: '+1 (555) 456-7890',
            address: '1007 Mountain Drive, Gotham, NJ 12345',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        return NextResponse.json(mockClients);
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in clients API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
} 