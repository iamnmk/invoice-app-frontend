'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-center mb-8">Invoice Management Platform</h1>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="flex-1 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Already have an account?</h2>
            <p className="mb-6 text-gray-600">Sign in to access your organization&apos;s dashboard and manage invoices.</p>
            <Link href="/login" className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Sign In
            </Link>
          </div>
          
          <div className="flex-1 bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Need an account?</h2>
            <p className="mb-6 text-gray-600">Create a new organization and become an administrator.</p>
            <Link href="/register" className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              Register New Organization
            </Link>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Why choose our platform?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4">
              <h4 className="font-medium mb-2">Organization Management</h4>
              <p className="text-gray-600">Manage your organization and team members with role-based access control.</p>
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-2">Invoice Tracking</h4>
              <p className="text-gray-600">Create, send, and track invoices from a single dashboard.</p>
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-2">Payment Management</h4>
              <p className="text-gray-600">Track payments and manage your organization&apos;s finances.</p>
            </div>
          </div>
        </div>
        </div>
      </main>
  );
}
