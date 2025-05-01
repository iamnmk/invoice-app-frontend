'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { PlusCircle, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";

interface Service {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  payment_link: string | null;
  created_at: string;
}

// Portal component for rendering modals
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

export default function SettingsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    payment_link: ''
  });
  
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    payment_link: ''
  });
  
  // Fetch services on page load
  useEffect(() => {
    fetchServices();
  }, [organizationId]);
  
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (!newService.name.trim()) {
        setError('Service name is required');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organization_id: organizationId,
          name: newService.name.trim(),
          description: newService.description.trim() || null,
          payment_link: newService.payment_link.trim() || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setServices([...services, data]);
      setSuccess('Service added successfully');
      setNewService({ name: '', description: '', payment_link: '' });
      setShowAddModal(false);
      
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleStartEdit = (service: Service) => {
    setEditingServiceId(service.id);
    setEditFormData({
      name: service.name,
      description: service.description || '',
      payment_link: service.payment_link || ''
    });
    setError(null);
    setSuccess(null);
  };
  
  const handleCancelEdit = () => {
    setEditingServiceId(null);
    setError(null);
  };
  
  const handleUpdateService = async (id: string) => {
    setError(null);
    setSuccess(null);
    
    try {
      if (!editFormData.name.trim()) {
        setError('Service name is required');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          description: editFormData.description.trim() || null,
          payment_link: editFormData.payment_link.trim() || null
        })
      });
      
      // Get response data first
      let responseData;
      try {
        responseData = await response.json();
      } catch (err) {
        throw new Error('Failed to parse server response');
      }
      
      // Then check if the response was successful
      if (!response.ok) {
        throw new Error(responseData.error || `Server returned status: ${response.status}`);
      }
      
      // Use the already parsed data
      const updatedService = responseData;
      
      setServices(services.map(service => 
        service.id === id ? updatedService : service
      ));
      
      setSuccess('Service updated successfully');
      setEditingServiceId(null);
      
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This cannot be undone.')) {
      return;
    }
    
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status: ${response.status}`);
      }
      
      setServices(services.filter(service => service.id !== id));
      setSuccess('Service deleted successfully');
      
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400 mt-1">Manage your organization settings</p>
        </div>
      </header>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-rose-400 hover:text-rose-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </div>
          <button 
            onClick={() => setSuccess(null)} 
            className="text-emerald-400 hover:text-emerald-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Services Section - Now outside tabs */}
      <div className="mb-8">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Services</CardTitle>
              <CardDescription className="text-zinc-400">
                Create and manage services that you offer to clients
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardHeader>
          
          <CardContent>
            {/* Services List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-zinc-800/50 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-lg">No services available</p>
                <p className="text-zinc-500 mt-2">Click the "Add Service" button to create your first service.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-800/50">
                      <th className="text-left p-3 text-xs font-medium text-zinc-400">NAME</th>
                      <th className="text-left p-3 text-xs font-medium text-zinc-400">DESCRIPTION</th>
                      <th className="text-left p-3 text-xs font-medium text-zinc-400">PAYMENT LINK</th>
                      <th className="text-left p-3 text-xs font-medium text-zinc-400">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-zinc-800/30">
                        {editingServiceId === service.id ? (
                          // Edit mode
                          <>
                            <td className="p-3">
                              <Input 
                                value={editFormData.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, name: e.target.value})}
                                className="bg-zinc-800 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                required
                                autoFocus
                              />
                            </td>
                            <td className="p-3">
                              <Textarea 
                                value={editFormData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditFormData({...editFormData, description: e.target.value})}
                                className="bg-zinc-800 border-zinc-700 min-h-[80px] focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              />
                            </td>
                            <td className="p-3">
                              <Input 
                                value={editFormData.payment_link}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, payment_link: e.target.value})}
                                className="bg-zinc-800 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              />
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateService(service.id)}
                                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={handleCancelEdit}
                                  className="bg-zinc-800 border-zinc-700"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View mode
                          <>
                            <td className="p-3 text-white font-medium">{service.name}</td>
                            <td className="p-3 text-zinc-400">
                              {service.description ? (
                                <span className="line-clamp-2">{service.description}</span>
                              ) : (
                                <span className="text-zinc-500 italic">No description</span>
                              )}
                            </td>
                            <td className="p-3 text-zinc-400">
                              {service.payment_link ? (
                                <a 
                                  href={service.payment_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-400 hover:underline truncate max-w-xs block"
                                >
                                  {service.payment_link}
                                </a>
                              ) : (
                                <span className="text-zinc-500 italic">No payment link</span>
                              )}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleStartEdit(service)}
                                  className="bg-zinc-800 border-zinc-700"
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteService(service.id)}
                                  className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-transparent"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Service Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add New Service</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <form onSubmit={handleAddService} className="p-6">
                <div className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="service-name" className="text-zinc-300">Service Name *</Label>
                    <Input 
                      id="service-name"
                      value={newService.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewService({...newService, name: e.target.value})}
                      placeholder="e.g. Web Development"
                      className="bg-zinc-800 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="service-description" className="text-zinc-300">Description</Label>
                    <Textarea 
                      id="service-description"
                      value={newService.description}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewService({...newService, description: e.target.value})}
                      placeholder="Describe your service"
                      className="bg-zinc-800 border-zinc-700 min-h-[120px] focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-xs text-zinc-500">
                      Add details about what this service includes
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="payment-link" className="text-zinc-300">Payment Link (Optional)</Label>
                    <Input 
                      id="payment-link"
                      value={newService.payment_link}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewService({...newService, payment_link: e.target.value})}
                      placeholder="https://example.com/payment"
                      className="bg-zinc-800 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-xs text-zinc-500">
                      Add a direct payment link for clients to pay for this service
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
} 