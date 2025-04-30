'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Settings } from 'lucide-react';

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

// Add this development functionality right after the imports
const DEV_MODE = process.env.NODE_ENV === 'development';
const DEV_USER = {
  id: 'dev-user-id',
  name: 'Development User',
  role: 'Admin' as 'Admin',
  email: 'dev@example.com',
  organization_id: 'dev-org-id',
  status: 'Active'
};
const DEV_ORG = {
  id: 'dev-org-id',
  name: 'Development Organization',
  industry: 'Technology',
  subscription_plan: 'Premium'
};

export default function OrganizationLayout({ children }: LayoutProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const orgId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const storedUser = localStorage.getItem('user');
    const storedOrg = localStorage.getItem('organization');
    const token = localStorage.getItem('token');
    
    console.log('Layout loaded with orgId:', orgId);
    console.log('Stored org data:', storedOrg);

    // For development, allow using app without auth
    if (DEV_MODE && (!storedUser || !storedOrg || !token)) {
      console.log('Using development credentials');
      
      // Create dev user if needed
      if (!storedUser) {
        localStorage.setItem('user', JSON.stringify(DEV_USER));
      }
      
      // Create dev organization if needed
      if (!storedOrg) {
        // Clone DEV_ORG and set its ID to match current URL
        const customDevOrg = {...DEV_ORG, id: orgId};
        localStorage.setItem('organization', JSON.stringify(customDevOrg));
        setOrganization(customDevOrg);
      } else {
        // Update existing org ID to match current URL
        const parsedOrg = JSON.parse(storedOrg);
        const updatedOrg = {...parsedOrg, id: orgId};
        localStorage.setItem('organization', JSON.stringify(updatedOrg));
        setOrganization(updatedOrg);
      }
      
      // Set dev token if needed
      if (!token) {
        localStorage.setItem('token', 'dev-token');
      }
      
      setUser(DEV_USER);
      setLoading(false);
      return;
    }

    if (!storedUser || !storedOrg || !token) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as User;
    const orgData = JSON.parse(storedOrg) as Organization;

    // For development, allow mismatched organization IDs
    if (!DEV_MODE && orgData.id !== orgId) {
      router.push('/login');
      return;
    }

    setUser(userData);
    
    // For development, update org ID to match current URL
    if (DEV_MODE) {
      const updatedOrg = {...orgData, id: orgId};
      setOrganization(updatedOrg);
      localStorage.setItem('organization', JSON.stringify(updatedOrg));
    } else {
      setOrganization(orgData);
    }
    
    setLoading(false);
  }, [orgId, router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActiveRoute = (path: string) => {
    return pathname?.includes(path);
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
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 pl-2">
                <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                  INVOICERR
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-lg font-medium text-gray-700">{organization?.name}</span>
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
                className={`flex items-center p-3 rounded-lg font-medium transition-all duration-200 
                ${isActiveRoute('/dashboard') 
                  ? 'bg-gradient-to-r from-purple-100 to-blue-50 text-purple-600 pl-4 shadow-sm' 
                  : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 hover:pl-4 hover:shadow-sm'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href={`/org/${orgId}/invoices`}
                className={`flex items-center p-3 rounded-lg font-medium transition-all duration-200 
                ${isActiveRoute('/invoices') 
                  ? 'bg-gradient-to-r from-purple-100 to-blue-50 text-purple-600 pl-4 shadow-sm' 
                  : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 hover:pl-4 hover:shadow-sm'}`}
              >
                <FileText className="w-5 h-5 mr-3" />
                Invoices
              </Link>
            </li>
            {user?.role === 'Admin' && (
              <li>
                <Link
                  href={`/org/${orgId}/users`}
                  className={`flex items-center p-3 rounded-lg font-medium transition-all duration-200 
                  ${isActiveRoute('/users') 
                    ? 'bg-gradient-to-r from-purple-100 to-blue-50 text-purple-600 pl-4 shadow-sm' 
                    : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 hover:pl-4 hover:shadow-sm'}`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Manage Users
                </Link>
              </li>
            )}
            <li>
              <Link
                href={`/org/${orgId}/settings`}
                className={`flex items-center p-3 rounded-lg font-medium transition-all duration-200 
                ${isActiveRoute('/settings') 
                  ? 'bg-gradient-to-r from-purple-100 to-blue-50 text-purple-600 pl-4 shadow-sm' 
                  : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 hover:pl-4 hover:shadow-sm'}`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 p-0">{children}</div>
      </div>
    </div>
  );
} 