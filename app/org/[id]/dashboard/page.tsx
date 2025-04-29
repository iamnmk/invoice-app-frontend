'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DashboardData {
  organization: {
    name: string;
    subscription_plan: string;
  };
  user_stats: {
    total_users: number;
    admin_count: number;
  };
  invoice_stats: {
    total_invoices: number;
    total_paid: number;
    total_pending: number;
    draft_count: number;
    sent_count: number;
    paid_count: number;
    overdue_count: number;
  };
  recent_invoices: Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    amount_total: number;
    status: string;
    due_date: string;
  }>;
  service_stats: {
    total_services: number;
  };
}

export default function Dashboard() {
  const params = useParams();
  const orgId = params.id as string;
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/api/dashboard/organization/${orgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  // For demo purposes, display dummy data if real data isn't available
  const stats = dashboardData || {
    organization: { name: 'Your Organization', subscription_plan: 'Free' },
    user_stats: { total_users: 1, admin_count: 1 },
    invoice_stats: {
      total_invoices: 0,
      total_paid: 0,
      total_pending: 0,
      draft_count: 0,
      sent_count: 0,
      paid_count: 0,
      overdue_count: 0
    },
    recent_invoices: [],
    service_stats: { total_services: 0 }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-2xl font-bold">{stats.user_stats.total_users}</p>
          <p className="text-sm text-gray-600">{stats.user_stats.admin_count} Admin(s)</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Invoices</h3>
          <p className="text-2xl font-bold">{stats.invoice_stats.total_invoices}</p>
          <div className="flex justify-between text-sm">
            <span className="text-green-600">{stats.invoice_stats.paid_count} Paid</span>
            <span className="text-orange-500">{stats.invoice_stats.overdue_count} Overdue</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Revenue</h3>
          <p className="text-2xl font-bold">${stats.invoice_stats.total_paid || 0}</p>
          <p className="text-sm text-orange-500">
            ${stats.invoice_stats.total_pending || 0} pending
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Subscription</h3>
          <p className="text-2xl font-bold">{stats.organization.subscription_plan}</p>
          <p className="text-sm text-gray-600">Upgrade for more features</p>
        </div>
      </div>
      
      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recent_invoices.length > 0 ? (
                stats.recent_invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.amount_total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : invoice.status === 'Sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices yet. Create your first invoice to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create New Invoice
          </button>
          {stats.user_stats.total_users === 1 && (
            <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Invite Team Members
            </button>
          )}
          <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Add New Client
          </button>
        </div>
      </div>
    </div>
  );
} 