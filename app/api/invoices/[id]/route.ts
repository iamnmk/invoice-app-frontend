import { NextRequest, NextResponse } from 'next/server';

// Get a single invoice by ID
export async function GET(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const invoiceId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/invoices/${invoiceId}`, {
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
        console.log('Using mock invoice data in development mode');
        
        return NextResponse.json({
          id: invoiceId,
          organization_id: 'org-123',
          invoice_number: `INV-123456`,
          client_name: 'Mock Client',
          client_email: 'client@example.com',
          amount_total: 199.99,
          currency: 'USD',
          due_date: new Date().toISOString(),
          status: 'Pending',
          notes: 'Mock invoice notes',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in invoice GET API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// Update an invoice
export async function PUT(
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
    
    // Validate required fields
    if (!body.client_name || !body.client_email || 
        body.amount_total === undefined || body.amount_total === null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/invoices/${invoiceId}`, {
        method: 'PUT',
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
        console.log('Using mock invoice update in development mode');
        
        return NextResponse.json({
          id: invoiceId,
          ...body,
          updated_at: new Date().toISOString()
        });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in invoice PUT API route:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// Delete an invoice
export async function DELETE(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const invoiceId = context.params.id;
    const authHeader = request.headers.get('authorization');
    
    // Use a custom auth token for development
    const devAuthToken = process.env.NODE_ENV === 'development' ? 'Bearer dev-token' : null;
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/invoices/${invoiceId}`, {
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
        console.log('Using mock invoice deletion in development mode');
        return NextResponse.json({ success: true });
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Error in invoice DELETE API route:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
} 