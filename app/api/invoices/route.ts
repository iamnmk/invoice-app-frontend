import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/invoices`, {
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
  } catch (error) {
    console.error('Error in invoices API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.organization_id || !body.client_name || !body.client_email || 
        body.amount_total === undefined || body.amount_total === null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Ensure amount_total is a valid number
    if (isNaN(parseFloat(body.amount_total)) || parseFloat(body.amount_total) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/invoices`, {
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
        console.log('Using mock invoice creation in development mode');
        
        return NextResponse.json({
          id: 'dev-' + Date.now().toString(),
          organization_id: body.organization_id,
          invoice_number: body.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
          client_name: body.client_name,
          client_email: body.client_email,
          service_id: body.service_id || null,
          include_payment_button: body.include_payment_button || false,
          amount_total: parseFloat(body.amount_total),
          currency: body.currency || 'USD',
          due_date: body.due_date,
          status: body.status || 'Draft',
          notes: body.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in invoices API route:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 