import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const organizationId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/organizations/${organizationId}`, {
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
        console.log('Using mock organization data in development mode');
        
        return NextResponse.json({
          id: organizationId,
          name: 'Sample Organization Inc.',
          industry: 'Technology',
          subscription_plan: 'Premium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in organization GET API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
} 