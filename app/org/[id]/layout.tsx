'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  email: string;
  organization_id: string;
  status: string;
}

interface Organization {
  id: string;
  name: string;
  industry?: string;
  subscription_plan: string;
}

export default function OrganizationLayout({ children }: LayoutProps) {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const storedUser = localStorage.getItem('user');
    const storedOrg = localStorage.getItem('organization');
    const token = localStorage.getItem('token');

    if (!storedUser || !storedOrg || !token) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as User;
    const orgData = JSON.parse(storedOrg) as Organization;

    // Verify user belongs to this organization
    if (orgData.id !== orgId) {
      router.push('/login');
      return;
    }

    setUser(userData);
    setOrganization(orgData);
    setLoading(false);
  }, [orgId, router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">{organization?.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side navigation and content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href={`/org/${orgId}/dashboard`}
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href={`/org/${orgId}/invoices`}
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Invoices
              </Link>
            </li>
            <li>
              <Link
                href={`/org/${orgId}/clients`}
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Clients
              </Link>
            </li>
            {user?.role === 'Admin' && (
              <li>
                <Link
                  href={`/org/${orgId}/users`}
                  className="block p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Manage Users
                </Link>
              </li>
            )}
            <li>
              <Link
                href={`/org/${orgId}/settings`}
                className="block p-2 rounded hover:bg-gray-100 transition-colors"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
} 