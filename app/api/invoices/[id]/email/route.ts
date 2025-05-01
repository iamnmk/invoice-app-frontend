import { NextRequest, NextResponse } from 'next/server';

// Send invoice via email
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const invoiceId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/invoices/${invoiceId}/send-email`, {
        method: 'POST',
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
      
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data);
    } catch (backendError) {
      console.error('Error connecting to backend:', backendError);
      
      // In development mode, return a mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock email response in development mode');
        
        return NextResponse.json({
          success: true,
          message: `Mock: Invoice sent to client's email`
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in invoice email API route:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
} 