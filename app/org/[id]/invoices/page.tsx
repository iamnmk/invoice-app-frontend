'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Plus, Download, ArrowUpRight } from 'lucide-react';
import InvoiceForm from './InvoiceForm';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

export default function InvoicesPage() {
  const params = useParams();
  const organizationId = params.id as string;
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    fetchInvoices();
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
  
  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    setShowInvoiceForm(false);
  };
  
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
  
  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-zinc-400 mt-1">Manage your client invoices</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={fetchInvoices} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            Refresh
          </Button>
          <Button onClick={() => setShowInvoiceForm(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
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
          <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <Download className="size-3.5 mr-2" />
            Export
          </Button>
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
                      <td className="p-3 text-white">{formatCurrency(invoice.amount_total, invoice.currency)}</td>
                      <td className="p-3 text-zinc-400">{formatDate(invoice.due_date)}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                          Send
                        </Button>
                        <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                          Delete
                        </Button>
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
              <h2 className="text-xl font-bold text-white">Generate New Invoice</h2>
            </div>
            <div className="p-6">
              <InvoiceForm 
                organizationId={organizationId}
                onInvoiceCreated={handleInvoiceCreated}
                onCancel={() => setShowInvoiceForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 