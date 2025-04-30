'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, UserPlus, Shield, ShieldOff, Trash2, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  status: 'Active' | 'Suspended';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export default function ManageUsers() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for new user form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member' as const
  });
  
  // State for edit user
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if current user is admin
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      setCurrentUser(user);
      
      if (user.role !== 'Admin') {
        // Redirect non-admin users
        router.push(`/org/${orgId}/dashboard`);
      }
    }
    
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/api/users/organization/${orgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [orgId, router]);

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/users/organization/${orgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }
      
      const newUser = await response.json();
      
      // Add new user to the list
      setUsers(prev => [...prev, newUser]);
      
      // Reset form
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'Member'
      });
      
      setShowNewUserForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userToUpdate,
          role: 'Admin'
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }
      
      const updatedUser = await response.json();
      
      // Update user in the list
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDemoteToMember = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;
      
      // Check if this is the last admin
      const adminCount = users.filter(user => user.role === 'Admin').length;
      if (adminCount <= 1 && userToUpdate.role === 'Admin') {
        setError('Cannot demote the last admin');
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userToUpdate,
          role: 'Member'
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }
      
      const updatedUser = await response.json();
      
      // Update user in the list
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      // Remove user from the list
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="text-white bg-black min-h-screen">
      <div className="p-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Users</h1>
            <p className="text-zinc-400 mt-1">Manage team members for your organization</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewUserForm(true)}
              className="bg-purple-600 hover:bg-purple-700 rounded-md px-4 py-2 text-white flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </button>
          </div>
        </header>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* New User Form */}
        {showNewUserForm && (
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 text-purple-500 mr-3" />
                <h2 className="text-lg font-medium">Add New User</h2>
              </div>
              <button
                onClick={() => setShowNewUserForm(false)}
                className="text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUserData.name}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-zinc-400">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-zinc-400">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUserData.password}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                  minLength={8}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="role" className="block mb-2 text-sm font-medium text-zinc-400">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUserData.role}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Create User
              </button>
            </form>
          </div>
        )}
        
        {/* Users List */}
        <div className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm rounded-lg shadow-md hover:bg-zinc-900/70 transition-colors">
          <div className="flex items-center p-6 border-b border-zinc-800">
            <User className="h-5 w-5 text-purple-500 mr-3" />
            <h2 className="text-lg font-medium">Organization Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800/50">
                  <th className="text-left p-3 text-xs font-medium text-zinc-400">NAME</th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-400">EMAIL</th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-400">ROLE</th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-400">STATUS</th>
                  <th className="text-left p-3 text-xs font-medium text-zinc-400">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-zinc-800/30">
                      <td className="p-3 text-white font-medium">
                        {user.name}
                        {currentUser?.id === user.id && ' (You)'}
                      </td>
                      <td className="p-3 text-zinc-400">{user.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'Admin' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Active' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3 flex space-x-3">
                        {user.role === 'Member' ? (
                          <button
                            onClick={() => handlePromoteToAdmin(user.id)}
                            className="flex items-center text-purple-400 hover:text-purple-300"
                            title="Make Admin"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteToMember(user.id)}
                            className="flex items-center text-blue-400 hover:text-blue-300"
                            disabled={users.filter(u => u.role === 'Admin').length <= 1}
                            title="Make Member"
                          >
                            <ShieldOff className="h-4 w-4" />
                          </button>
                        )}
                        
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center text-rose-400 hover:text-rose-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <User className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400 text-lg">No users found</p>
                      <p className="text-zinc-500 mt-1">Add users to your organization</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 