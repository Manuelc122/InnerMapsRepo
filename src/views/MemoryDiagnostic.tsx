import React, { useState, useEffect } from 'react';
import { useAuth } from '../state-management/AuthContext';
import { updateMemorySummaries, fetchActiveMemories } from '../utils/memory/memoryService';
import { getProfile } from '../utils/profile';
import type { UserProfile } from '../interfaces/profile';

export function MemoryDiagnostic() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleUpdateSummaries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updateResult = await updateMemorySummaries(user.id);
      setResult(updateResult);
    } catch (error) {
      console.error('Error updating summaries:', error);
      setResult({ error: 'Failed to update summaries' });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMemories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await fetchActiveMemories(user.id);
      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Memory System Diagnostic</h1>
      
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">User Profile</h2>
        {profile ? (
          <div>
            <p><strong>Name:</strong> {profile.fullName || 'Not set'}</p>
            <p><strong>Country:</strong> {profile.country || 'Not set'}</p>
            <p><strong>Birthdate:</strong> {profile.birthdate ? profile.birthdate.toLocaleDateString() : 'Not set'}</p>
          </div>
        ) : (
          <p>No profile data available</p>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Memory Summary Generation</h2>
        <button
          onClick={handleUpdateSummaries}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Generate Missing Summaries'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Result:</h3>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Memory List</h2>
        <button
          onClick={handleFetchMemories}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
        >
          {loading ? 'Loading...' : 'Fetch Memories'}
        </button>
        
        {memories.length > 0 ? (
          <div className="space-y-4">
            {memories.map(memory => (
              <div key={memory.id} className="border p-3 rounded">
                <p className="font-semibold">{memory.summary || 'No summary'}</p>
                <p className="text-sm text-gray-600 mt-2">{memory.content.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No memories found</p>
        )}
      </div>
    </div>
  );
} 