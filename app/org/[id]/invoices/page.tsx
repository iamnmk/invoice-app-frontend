'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Plus, Download, ArrowUpRight, MoreVertical, Check, Mail } from 'lucide-react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import InvoiceForm from './InvoiceForm';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define color functions before their use in components
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20';
    case 'Overdue':
      return 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/20';
    case 'Draft':
      return 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/20';
    case 'Sent':
    case 'Pending':
      return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/20';
    default:
      return 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/20';
  }
};

// Portal component for rendering dropdowns outside of parent containers
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

// Status Dropdown with Portal implementation
const StatusDropdown = ({ 
  currentStatus, 
  onStatusChange,
  position
}: { 
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  position: { x: number; y: number };
}) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(position);
  const statuses = ['Draft', 'Sent', 'Pending', 'Paid', 'Overdue'];
  
  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    setOpen(!open);
  };
  
  return (
    <>
      <Badge 
        className={`cursor-pointer transition-all duration-200 hover:opacity-90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${getStatusColor(currentStatus)}`}
        onClick={handleClick}
      >
        <div className="flex items-center">
          <span className="mr-1">{currentStatus}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </Badge>
      
      {open && (
        <Portal>
          <div 
            className="fixed inset-0 h-full w-full bg-transparent"
            style={{ zIndex: 9998 }} 
            onClick={() => setOpen(false)} 
          />
          <div 
            className="fixed rounded-md shadow-lg bg-zinc-900/95 border border-zinc-800 backdrop-blur-sm"
            style={{ 
              zIndex: 9999,
              top: dropdownPosition.y + 5,
              left: dropdownPosition.x,
              width: '180px',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <style jsx global>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="py-1" role="menu" aria-orientation="vertical">
              {statuses.map(status => (
                <button
                  key={status}
                  className={`flex items-center w-full text-left px-4 py-2.5 text-sm transition-all duration-150 
                    ${status === currentStatus 
                      ? 'bg-zinc-800 text-white font-medium' 
                      : 'text-zinc-300 hover:bg-zinc-800/70 hover:pl-5 hover:text-white'
                    }`}
                  role="menuitem"
                  onClick={() => {
                    onStatusChange(status);
                    setOpen(false);
                  }}
                >
                  <div className={`h-2 w-2 rounded-full mr-2 ${getStatusDotColor(status)}`}></div>
                  {status === currentStatus && (
                    <Check className="h-3.5 w-3.5 mr-1.5 text-purple-400 animate-fadeIn" />
                  )}
                  <span>
                    {status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

// Add a function to get status dot colors
const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-400';
    case 'Overdue':
      return 'bg-rose-400';
    case 'Draft':
      return 'bg-gray-400';
    case 'Sent':
    case 'Pending':
      return 'bg-amber-400';
    default:
      return 'bg-gray-400';
  }
};

interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  status: string;
  amount_total: number;
  currency: string;
  due_date: string;
  created_at: string;
  service_id?: string;
  notes?: string;
  service_name?: string;
}

// Add a custom button styles for a consistent look and feel
const buttonBaseStyles = "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-2 focus:ring-offset-black";
const primaryButtonStyles = `${buttonBaseStyles} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/20`;
const outlineButtonStyles = `${buttonBaseStyles} bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-white`;
const ghostButtonStyles = `${buttonBaseStyles} text-zinc-400 hover:text-white hover:bg-zinc-800/70`;

export default function InvoicesPage() {
  const params = useParams();
  const organizationId = params.id as string;
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<{ id: string, name: string }>({ id: '', name: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [services, setServices] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    fetchInvoices();
    fetchOrganizationData();
    fetchServices();
  }, [organizationId]);
  
  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      try {
        const response = await fetch(`/api/invoices/organization/${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }
        
        const data = await response.json();
        setInvoices(data);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // For development - handle network errors and API unavailability
        setError('Could not connect to the server. Please ensure the backend service is running.');
        setInvoices([]);
      }
    } catch (err) {
      console.error('Error in fetchInvoices:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found for organization fetch');
        return;
      }
      
      console.log('Fetching organization data for ID:', organizationId);
      const response = await fetch(`/api/organizations/${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Organization fetch failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Organization data received:', data);
      setOrganization(data);
    } catch (err) {
      console.error('Error fetching organization data:', err);
    }
  };
  
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found for services fetch');
        return;
      }
      
      const response = await fetch(`/api/services/organization/${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Services fetch failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };
  
  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    setShowInvoiceForm(false);
    setEditInvoiceId(null);
  };
  
  const updateInvoiceStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      // Update the invoices state with the new status
      setInvoices(invoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: newStatus } : invoice
      ));
      
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      // Remove the deleted invoice from state
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleEditInvoice = (id: string) => {
    setEditInvoiceId(id);
    setShowInvoiceForm(true);
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Summary statistics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'Sent' || inv.status === 'Pending').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;
  
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount_total, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount_total, 0);
  const pendingAmount = invoices.filter(inv => ['Sent', 'Pending'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount_total, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount_total, 0);
  
  // Helper function to get service name by ID
  const getServiceName = (serviceId: string | undefined) => {
    if (!serviceId) return '';
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : '';
  };
  
  const handleDownloadInvoice = async (invoice: Invoice) => {
    let orgName = "Unnamed Organization";
    
    // First try to use the organization name from state
    if (organization && organization.name) {
      orgName = organization.name;
      console.log("Using cached organization name:", orgName);
    } else {
      // If not available, fetch it directly
      try {
        console.log("Fetching fresh organization data for PDF");
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');
        
        const response = await fetch(`/api/organizations/${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch organization: ${response.status}`);
        
        const data = await response.json();
        if (data && data.name) {
          orgName = data.name;
          console.log("Fresh organization name fetched:", orgName);
          // Update state for future use
          setOrganization(data);
        }
      } catch (err) {
        console.error('Error fetching fresh organization data:', err);
      }
    }
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(128, 0, 128); // Purple color
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Use the organization name, with appropriate fallback
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    console.log("Using organization name in PDF:", orgName);
    doc.text(orgName, 14, 30);
    
    // Add invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 140, 30);
    doc.text(`Date: ${formatDate(invoice.created_at)}`, 140, 35);
    doc.text(`Due Date: ${formatDate(invoice.due_date)}`, 140, 40);
    doc.text(`Status: ${invoice.status}`, 140, 45);
    
    // Add client info
    doc.setFontSize(12);
    doc.text('Bill To:', 14, 65);
    doc.setFontSize(10);
    doc.text(invoice.client_name, 14, 70);
    doc.text(invoice.client_email, 14, 75);
    
    // Add service info if available
    const serviceName = getServiceName(invoice.service_id);
    if (serviceName) {
      doc.setFontSize(12);
      doc.text('Service:', 14, 85);
      doc.setFontSize(10);
      doc.text(serviceName, 14, 90);
      // Adjust table position
      var tableY = 100;
    } else {
      var tableY = 85;
    }
    
    // Add invoice items table
    const itemTableData = [
      ['Description', 'Quantity', 'Unit Price', 'Amount'],
      [(serviceName || 'Professional Services'), '1', formatCurrency(invoice.amount_total, invoice.currency).replace(invoice.currency, ''), formatCurrency(invoice.amount_total, invoice.currency)]
    ];
    
    autoTable(doc, {
      startY: tableY,
      head: [itemTableData[0]],
      body: [itemTableData[1]],
      theme: 'grid',
      headStyles: { fillColor: [100, 50, 150], textColor: [255, 255, 255] },
      styles: { lineColor: [200, 200, 200] }
    });
    
    // Get the y position where the table ended
    const finalY = (doc as any).lastAutoTable.finalY || 85 + 20;
    
    // Add total amount
    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY + 10);
    doc.text('Tax:', 140, finalY + 15);
    doc.text('Total:', 140, finalY + 25);
    
    doc.text(formatCurrency(invoice.amount_total, invoice.currency), 175, finalY + 10, { align: 'right' });
    doc.text(formatCurrency(0, invoice.currency), 175, finalY + 15, { align: 'right' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(invoice.amount_total, invoice.currency), 175, finalY + 25, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Add notes
    if (invoice.notes) {
      doc.text('Notes:', 14, finalY + 40);
      doc.text(invoice.notes, 14, finalY + 45);
    }
    
    // Add footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
  };
  
  const handleSendInvoiceEmail = async (invoice: Invoice) => {
    try {
      setIsSendingEmail(true);
      setEmailSuccess(null);
      setEmailError(null);
      
      // First generate the PDF
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(128, 0, 128); // Purple color
      doc.text('INVOICE', 105, 20, { align: 'center' });
      
      // Organization name
      let orgName = organization?.name || "Your Organization";
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(orgName, 14, 30);
      
      // Add invoice details
      doc.setFontSize(10);
      doc.text(`Invoice Number: ${invoice.invoice_number}`, 140, 30);
      doc.text(`Date: ${formatDate(invoice.created_at)}`, 140, 35);
      doc.text(`Due Date: ${formatDate(invoice.due_date)}`, 140, 40);
      doc.text(`Status: ${invoice.status}`, 140, 45);
      
      // Add client info
      doc.setFontSize(12);
      doc.text('Bill To:', 14, 65);
      doc.setFontSize(10);
      doc.text(invoice.client_name, 14, 70);
      doc.text(invoice.client_email, 14, 75);
      
      // Add service info if available
      const serviceName = getServiceName(invoice.service_id);
      if (serviceName) {
        doc.setFontSize(12);
        doc.text('Service:', 14, 85);
        doc.setFontSize(10);
        doc.text(serviceName, 14, 90);
        // Adjust table position
        var tableY = 100;
      } else {
        var tableY = 85;
      }
      
      // Add invoice items table
      const itemTableData = [
        ['Description', 'Quantity', 'Unit Price', 'Amount'],
        [(serviceName || 'Professional Services'), '1', formatCurrency(invoice.amount_total, invoice.currency).replace(invoice.currency, ''), formatCurrency(invoice.amount_total, invoice.currency)]
      ];
      
      autoTable(doc, {
        startY: tableY,
        head: [itemTableData[0]],
        body: [itemTableData[1]],
        theme: 'grid',
        headStyles: { fillColor: [100, 50, 150], textColor: [255, 255, 255] },
        styles: { lineColor: [200, 200, 200] }
      });
      
      // Get the y position where the table ended
      const finalY = (doc as any).lastAutoTable.finalY || 85 + 20;
      
      // Add total amount
      doc.setFontSize(10);
      doc.text('Subtotal:', 140, finalY + 10);
      doc.text('Tax:', 140, finalY + 15);
      doc.text('Total:', 140, finalY + 25);
      
      doc.text(formatCurrency(invoice.amount_total, invoice.currency), 175, finalY + 10, { align: 'right' });
      doc.text(formatCurrency(0, invoice.currency), 175, finalY + 15, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(invoice.amount_total, invoice.currency), 175, finalY + 25, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      // Add notes
      if (invoice.notes) {
        doc.text('Notes:', 14, finalY + 40);
        doc.text(invoice.notes, 14, finalY + 45);
      }
      
      // Add footer
      doc.setFontSize(8);
      doc.text('Thank you for your business!', 105, 280, { align: 'center' });
      
      // Convert PDF to base64 string
      const pdfBuffer = doc.output('arraybuffer');
      const base64PDF = Buffer.from(pdfBuffer).toString('base64');
      
      // Send email via API
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`/api/invoices/${invoice.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pdfBuffer: base64PDF,
          message: `Dear ${invoice.client_name},\n\nPlease find attached your invoice #${invoice.invoice_number} for ${formatCurrency(invoice.amount_total, invoice.currency)}.`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
      
      const result = await response.json();
      setEmailSuccess(result.message || 'Invoice sent successfully');
      
      // Refresh invoices list to get updated status
      fetchInvoices();
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      setEmailError(error.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Add the fadeIn animation globally
  <style jsx global>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.5); }
      70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
      100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
    
    .animate-pulse-purple {
      animation: pulse 1.5s infinite;
    }
  `}</style>

  // Enhance the "New Invoice" button with a subtle pulse animation when the page loads
  useEffect(() => {
    const newInvoiceButton = document.getElementById('new-invoice-button');
    if (newInvoiceButton && invoices.length === 0) {
      newInvoiceButton.classList.add('animate-pulse-purple');
      
      const timeout = setTimeout(() => {
        newInvoiceButton.classList.remove('animate-pulse-purple');
      }, 4500);
      
      return () => clearTimeout(timeout);
    }
  }, [invoices.length]);
  
  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-zinc-400 mt-1">Manage your client invoices</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={fetchInvoices} 
            className={`${outlineButtonStyles}`}
          >
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
              <path d="M21 22v-6h-6"></path>
            </svg>
            Refresh
          </Button>
          <Button 
            id="new-invoice-button"
            onClick={() => setShowInvoiceForm(true)} 
            className={`${primaryButtonStyles}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </header>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {emailSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg mb-6 animate-fadeIn">
          {emailSuccess}
        </div>
      )}
      
      {emailError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6 animate-fadeIn">
          {emailError}
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-normal">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalInvoices}</div>
            <div className="text-zinc-400 text-sm mt-1">
              {formatCurrency(totalAmount, 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-normal">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingInvoices}</div>
            <div className="flex items-center mt-1 text-amber-500 text-sm">
              {formatCurrency(pendingAmount, 'USD')} pending
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-normal">Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paidInvoices}</div>
            <div className="flex items-center mt-1 text-emerald-500 text-sm">
              {formatCurrency(paidAmount, 'USD')} received
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-normal">Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overdueInvoices}</div>
            <div className="flex items-center mt-1 text-rose-500 text-sm">
              {formatCurrency(overdueAmount, 'USD')} overdue
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription className="text-zinc-400">Manage and track your client invoices</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">No invoices available</p>
              <p className="text-gray-500 mt-2">Click the "New Invoice" button to create your first invoice.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800/50">
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">INVOICE</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">CLIENT</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">SERVICE</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">AMOUNT</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">DATE</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">STATUS</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-800/30">
                      <td className="p-3 text-white font-medium text-purple-400">{invoice.invoice_number}</td>
                      <td className="p-3 text-white">{invoice.client_name}</td>
                      <td className="p-3 text-zinc-300">{getServiceName(invoice.service_id)}</td>
                      <td className="p-3 text-white">{formatCurrency(invoice.amount_total, invoice.currency)}</td>
                      <td className="p-3 text-zinc-400">{formatDate(invoice.due_date)}</td>
                      <td className="p-3">
                        <StatusDropdown 
                          currentStatus={invoice.status}
                          onStatusChange={(newStatus) => updateInvoiceStatus(invoice.id, newStatus)}
                          position={{ x: 0, y: 0 }} // Will be calculated on click
                        />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${ghostButtonStyles} h-8 w-8 p-0 rounded-full`}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPosition({
                              x: rect.left,
                              y: rect.bottom + window.scrollY
                            });
                            setDropdownOpenId(dropdownOpenId === invoice.id ? null : invoice.id);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        
                        {dropdownOpenId === invoice.id && (
                          <Portal>
                            <div 
                              className="fixed inset-0 h-full w-full bg-transparent"
                              style={{ zIndex: 9998 }} 
                              onClick={() => setDropdownOpenId(null)}
                            />
                            <div 
                              className="fixed rounded-md shadow-lg bg-zinc-900/95 border border-zinc-800 backdrop-blur-sm"
                              style={{ 
                                zIndex: 9999,
                                top: dropdownPosition.y + 5,
                                left: dropdownPosition.x,
                                width: '180px',
                                animation: 'fadeIn 0.15s ease-out'
                              }}
                            >
                              <style jsx global>{`
                                @keyframes fadeIn {
                                  from { opacity: 0; transform: translateY(-10px); }
                                  to { opacity: 1; transform: translateY(0); }
                                }
                              `}</style>
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-green-400 transition-all duration-150 hover:bg-zinc-800/70 hover:pl-5"
                                  role="menuitem"
                                  onClick={() => {
                                    handleDownloadInvoice(invoice);
                                    setDropdownOpenId(null);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2.5" />
                                  Download Invoice
                                </button>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-blue-400 transition-all duration-150 hover:bg-zinc-800/70 hover:pl-5"
                                  role="menuitem"
                                  onClick={() => {
                                    handleSendInvoiceEmail(invoice);
                                    setDropdownOpenId(null);
                                  }}
                                  disabled={isSendingEmail}
                                >
                                  <Mail className="h-4 w-4 mr-2.5" />
                                  Send as Email
                                </button>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-blue-400 transition-all duration-150 hover:bg-zinc-800/70 hover:pl-5"
                                  role="menuitem"
                                  onClick={() => {
                                    handleEditInvoice(invoice.id);
                                    setDropdownOpenId(null);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                                  </svg>
                                  Edit Invoice
                                </button>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-rose-400 transition-all duration-150 hover:bg-zinc-800/70 hover:pl-5"
                                  role="menuitem"
                                  onClick={() => {
                                    handleDeleteInvoice(invoice.id);
                                    setDropdownOpenId(null);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                    <line x1="10" x2="10" y1="11" y2="17"/>
                                    <line x1="14" x2="14" y1="11" y2="17"/>
                                  </svg>
                                  Delete Invoice
                                </button>
                              </div>
                            </div>
                          </Portal>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">
                {editInvoiceId ? 'Edit Invoice' : 'Generate New Invoice'}
              </h2>
            </div>
            <div className="p-6">
              <InvoiceForm 
                organizationId={organizationId}
                invoiceId={editInvoiceId}
                onInvoiceCreated={handleInvoiceCreated}
                onCancel={() => {
                  setShowInvoiceForm(false);
                  setEditInvoiceId(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 