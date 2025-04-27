import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageService } from './services/StorageService';
import { Check, AlertCircle, Database, Key, Tag as TagIcon, Save, Trash2 } from 'lucide-react';
import './index.css';

function OptionsPage() {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const config = await StorageService.getNotionConfig();
    if (config) {
      setApiKey(config.apiKey || '');
      setDatabaseId(config.databaseId || '');
    }
    
    const savedTags = await StorageService.getTags();
    setTags(savedTags || []);
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('idle');
      setErrorMessage('');
      
      // Basic validation
      if (!apiKey.trim()) {
        setErrorMessage('API Key is required');
        setSaveStatus('error');
        return;
      }
      
      if (!databaseId.trim()) {
        setErrorMessage('Database ID is required');
        setSaveStatus('error');
        return;
      }
      
      await StorageService.saveNotionConfig({
        apiKey: apiKey.trim(),
        databaseId: databaseId.trim()
      });
      
      await StorageService.saveTags(tags);
      
      setSaveStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save settings');
    }
  };

  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) {
      return;
    }
    
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Screenshot to Notion Settings</h1>
        </div>
        
        {saveStatus === 'success' && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Settings saved successfully!
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            {errorMessage || 'An error occurred while saving settings'}
          </div>
        )}
        
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            Notion API Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Notion API Key
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="secret_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Get your API key from the <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Notion Integrations</a> page.
              </p>
            </div>
            
            <div>
              <label htmlFor="databaseId" className="block text-sm font-medium text-gray-700 mb-1">
                Notion Database ID
              </label>
              <input
                id="databaseId"
                type="text"
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                placeholder="8e3b5791-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                The ID of the database where screenshots will be saved. Find this in the URL of your database.
              </p>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-purple-600" />
            Manage Tags
          </h2>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a new tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div 
                key={tag}
                className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md group"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {tags.length === 0 && (
              <p className="text-sm text-gray-500 italic">No tags added yet</p>
            )}
          </div>
        </section>
        
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('options-root')!).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
);