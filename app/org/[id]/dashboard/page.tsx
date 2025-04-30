'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, Download, ArrowUpRight, CreditCard, User, Building } from 'lucide-react';

interface DashboardData {
  organization: {
    id: string;
    name: string;
    industry: string;
    subscription_plan: string;
    created_at: string;
  };
  userStats: {
    total: number;
    admins: number;
    members: number;
  };
  invoiceStats: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    currency: string;
  };
  recentInvoices: Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    amount_total: number;
    status: string;
    due_date: string;
    created_at: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const params = useParams();
  const organizationId = params.id as string;
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchDashboardData();
  }, [organizationId]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use the Next.js API route
      const response = await fetch(`/api/dashboard/${organizationId}`);
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dashboard data received:', data);
      setDashboardData(data);
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error && !dashboardData) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-lg mb-6">
        <p className="font-bold">No Data</p>
        <p>No dashboard data is available.</p>
      </div>
    );
  }
  
  const { organization, invoiceStats, recentInvoices } = dashboardData;
  
  return (
    <div className="text-white bg-black min-h-screen">
      <div className="p-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Welcome to {organization.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchDashboardData} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-md px-4 py-2 text-white">
              Refresh
            </button>
          </div>
        </header>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Organization Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm rounded-lg shadow-md p-6 hover:bg-zinc-900/70 transition-colors">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-purple-500 mr-3" />
              <h2 className="text-lg font-medium">Organization Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-zinc-400 text-sm">Name</p>
                <p className="font-medium">{organization.name}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Industry</p>
                <p className="font-medium">{organization.industry}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Subscription</p>
                <p className="font-medium">{organization.subscription_plan}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Joined</p>
                <p className="font-medium">{formatDate(organization.created_at)}</p>
              </div>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Invoices */}
            <div className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm rounded-lg shadow-md p-5 hover:bg-zinc-900/70 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-400 text-sm font-medium">Total Invoices</p>
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{invoiceStats.total}</p>
              <p className="text-zinc-400 text-sm mt-1">
                {formatCurrency(invoiceStats.totalAmount, invoiceStats.currency)}
              </p>
            </div>
            
            {/* Paid Invoices */}
            <div className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm rounded-lg shadow-md p-5 hover:bg-zinc-900/70 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-400 text-sm font-medium">Paid</p>
                <div className="text-emerald-500">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold">{invoiceStats.paid}</p>
              <p className="text-emerald-500 text-sm mt-1">
                {formatCurrency(invoiceStats.totalAmount * (invoiceStats.paid / invoiceStats.total || 0), invoiceStats.currency)}
              </p>
            </div>
            
            {/* Pending Invoices */}
            <div className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm rounded-lg shadow-md p-5 hover:bg-zinc-900/70 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-400 text-sm font-medium">Outstanding</p>
                <div className="text-amber-500">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold">{invoiceStats.pending + invoiceStats.overdue}</p>
              <p className="text-amber-500 text-sm mt-1">
                {formatCurrency(invoiceStats.totalAmount * ((invoiceStats.pending + invoiceStats.overdue) / invoiceStats.total || 0), invoiceStats.currency)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <div className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm rounded-lg shadow-md hover:bg-zinc-900/70 transition-colors mb-6">
          <div className="flex justify-between items-center p-6 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-medium">Recent Invoices</h2>
              <p className="text-zinc-400 text-sm">Latest invoice activity</p>
            </div>
            <Link href={`/org/${organizationId}/invoices`} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-md px-4 py-2 text-sm inline-flex items-center">
              <Download className="h-4 w-4 mr-2" />
              View All
            </Link>
          </div>
          
          {recentInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">No invoices available</p>
              <p className="text-gray-500 mt-2">Create your first invoice to get started</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800/50">
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">INVOICE</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">CLIENT</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">AMOUNT</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">DATE</th>
                    <th className="text-left p-3 text-xs font-medium text-zinc-400">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-800/30">
                      <td className="p-3 text-white font-medium text-purple-400">{invoice.invoice_number}</td>
                      <td className="p-3 text-white">{invoice.client_name}</td>
                      <td className="p-3 text-white">{formatCurrency(invoice.amount_total, invoiceStats.currency)}</td>
                      <td className="p-3 text-zinc-400">{formatDate(invoice.due_date)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      
      </div>
    </div>
  );
}