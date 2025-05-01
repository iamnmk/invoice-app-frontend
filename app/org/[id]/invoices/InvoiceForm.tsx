'use client';

import { useState, useEffect } from 'react';

// Add custom button styles
const buttonBaseStyles = "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 focus:ring-offset-zinc-900";
const primaryButtonStyles = `${buttonBaseStyles} bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg hover:shadow-orange-500/20`;
const outlineButtonStyles = `${buttonBaseStyles} bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-white`;

interface Service {
  id: string;
  name: string;
  description: string | null;
  payment_link: string | null;
}

interface InvoiceFormProps {
  organizationId: string;
  invoiceId?: string | null;
  onInvoiceCreated: (invoice: any) => void;
  onCancel: () => void;
}

export default function InvoiceForm({ organizationId, invoiceId, onInvoiceCreated, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    amount_total: '',
    due_date: '',
    currency: 'USD',
    notes: '',
    status: 'Draft',
    service_id: '',
    include_payment_button: false
  });
  
  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, [organizationId]);
  
  // Fetch invoice data if editing an existing invoice
  useEffect(() => {
    if (invoiceId) {
      setIsEdit(true);
      fetchInvoiceData();
    }
  }, [invoiceId]);
  
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/services/organization/${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      // Don't show error to user, just log it
    } finally {
      setLoadingServices(false);
    }
  };
  
  const fetchInvoiceData = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const invoice = await response.json();
      
      // Format the date to match the input format (YYYY-MM-DD)
      const dueDate = new Date(invoice.due_date);
      const formattedDueDate = dueDate.toISOString().split('T')[0];
      
      setFormData({
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        amount_total: invoice.amount_total.toString(),
        due_date: formattedDueDate,
        currency: invoice.currency || 'USD',
        notes: invoice.notes || '',
        status: invoice.status,
        service_id: invoice.service_id || '',
        include_payment_button: invoice.include_payment_button || false
      });
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Validate amount
      const amountValue = parseFloat(formData.amount_total);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }
      
      // Prepare request data
      const invoiceData = {
        organization_id: organizationId,
        client_name: formData.client_name,
        client_email: formData.client_email,
        status: formData.status,
        amount_total: parseFloat(formData.amount_total),
        due_date: formData.due_date,
        currency: formData.currency,
        notes: formData.notes,
        service_id: formData.service_id || null,
        include_payment_button: formData.include_payment_button
      };
      
      let response;
      let responseData;
      
      if (isEdit && invoiceId) {
        // Update existing invoice
        response = await fetch(`/api/invoices/${invoiceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(invoiceData)
        });
      } else {
        // Create new invoice with generated invoice number
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        
        response = await fetch(`/api/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...invoiceData,
            invoice_number: invoiceNumber
          })
        });
      }
      
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing invoice JSON:', jsonError);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(responseData?.error || `Failed to ${isEdit ? 'update' : 'create'} invoice`);
      }
      
      onInvoiceCreated(responseData);
    } catch (err: unknown) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} invoice:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Find the selected service name if service_id is set
  const selectedService = services.find(service => service.id === formData.service_id);
  const hasPaymentLink = selectedService?.payment_link ? true : false;

  // Toggle payment button option
  const handlePaymentButtonToggle = () => {
    if (hasPaymentLink) {
      setFormData(prev => ({
        ...prev,
        include_payment_button: !prev.include_payment_button
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-lg p-5">
          <h3 className="text-lg font-medium mb-4 text-white">Client Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="client_name" className="block text-sm font-medium text-zinc-400 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="client_email" className="block text-sm font-medium text-zinc-400 mb-1">
                Client Email *
              </label>
              <input
                type="email"
                id="client_email"
                name="client_email"
                value={formData.client_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-lg p-5">
          <h3 className="text-lg font-medium mb-4 text-white">Invoice Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="service_id" className="block text-sm font-medium text-zinc-400 mb-1">
                Service
              </label>
              <select
                id="service_id"
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="">-- Select a service --</option>
                {loadingServices ? (
                  <option disabled>Loading services...</option>
                ) : services.length > 0 ? (
                  services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No services available</option>
                )}
              </select>
            </div>
            
            <div>
              <label htmlFor="amount_total" className="block text-sm font-medium text-zinc-400 mb-1">
                Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-zinc-400">
                    {formData.currency === 'USD' ? '$' : 
                     formData.currency === 'EUR' ? '€' : 
                     formData.currency === 'GBP' ? '£' : 
                     formData.currency}
                  </span>
                </div>
                <input
                  type="number"
                  id="amount_total"
                  name="amount_total"
                  min="0.01"
                  step="0.01"
                  value={formData.amount_total}
                  onChange={handleInputChange}
                  className="w-full pl-8 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-zinc-400 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-zinc-400 mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-zinc-400 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-lg p-5 mb-6">
        <h3 className="text-lg font-medium mb-4 text-white">Additional Details</h3>
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-400 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white resize-none"
          ></textarea>
        </div>
        
        <div className="flex items-center mt-4">
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasPaymentLink ? 'bg-zinc-700 cursor-pointer' : 'bg-zinc-800 opacity-50 cursor-not-allowed'}`}
               onClick={handlePaymentButtonToggle}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.include_payment_button && hasPaymentLink ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
          <label className="ml-2 text-sm font-medium text-zinc-400">
            Include "Pay Now" button in PDF
            {!hasPaymentLink && (
              <span className="ml-2 text-xs text-zinc-500">(Requires a service with payment link)</span>
            )}
          </label>
        </div>
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-lg p-5 mb-6">
        <h3 className="font-medium mb-2 text-white">Invoice Summary</h3>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium text-white">Total Amount</div>
            <div className="text-sm text-zinc-400">
              {formData.client_name ? `For ${formData.client_name}` : 'Enter client name above'}
              {selectedService && ` • ${selectedService.name}`}
            </div>
          </div>
          <div className="text-xl font-bold text-white">
            {formData.amount_total ? 
              new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: formData.currency 
              }).format(parseFloat(formData.amount_total)) : 
              '0.00'
            }
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`${outlineButtonStyles} px-4 py-2`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${primaryButtonStyles} px-6 py-2 flex items-center`}
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isEdit ? 'Update' : 'Create'} Invoice
        </button>
      </div>
    </form>
  );
} 