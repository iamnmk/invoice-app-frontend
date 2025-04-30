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
    
    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/dashboard/organization/${organizationId}`, {
        headers: {
          'Authorization': authHeader || devAuthToken || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Backend returned status: ${response.status}`);
      }
      
      // Get the response data
      const data = await response.json();
      console.log('Dashboard data fetched from backend:', data);
      
      // Return the dashboard data as JSON
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // In development mode, create basic mock data only if backend is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.log('Using basic mock dashboard data in development');
        
        return NextResponse.json({
          organization: {
            id: organizationId,
            name: 'Development Organization',
            industry: 'Technology',
            subscription_plan: 'Professional',
            created_at: new Date().toISOString()
          },
          userStats: {
            total: 1,
            admins: 1,
            members: 0
          },
          invoiceStats: {
            total: 0,
            paid: 0,
            pending: 0,
            overdue: 0,
            totalAmount: 0,
            currency: 'USD'
          },
          recentInvoices: [],
          monthlyRevenue: []
        });
      }
      
      // In production, return the error
      return NextResponse.json(
        { error: 'Failed to load dashboard data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in dashboard API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 