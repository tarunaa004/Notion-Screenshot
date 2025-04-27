import React, { useState, useEffect } from 'react';
import { Camera, Upload, Tag, Settings, Loader2 } from 'lucide-react';
import ScreenshotPreview from './components/ScreenshotPreview';
import TagSelector from './components/TagSelector';
import { NotionService } from './services/NotionService';

function App() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotionConfigured, setIsNotionConfigured] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    // Check if Chrome runtime is available
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Get config and tags from background script
      chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
        if (response) {
          setIsNotionConfigured(!!response.notionConfig?.apiKey);
          setAvailableTags(response.tags || []);
        }
      });
    }
  }, []);

  const captureVisibleTab = async () => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      setErrorMessage('Chrome extension API is not available');
      return;
    }

    setScreenshot(null);
    setUploadStatus('idle');
    setErrorMessage('');
    
    try {
      chrome.runtime.sendMessage(
        { action: 'captureVisibleTab' },
        (response) => {
          if (response.success) {
            setScreenshot(response.screenshot);
            setPageTitle(response.title);
            setPageUrl(response.url);
          } else {
            setErrorMessage(response.error || 'Failed to capture screenshot');
          }
        }
      );
    } catch (error) {
      setErrorMessage('An error occurred while capturing the screenshot');
      console.error(error);
    }
  };

  const captureFullPage = async () => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      setErrorMessage('Chrome extension API is not available');
      return;
    }

    setScreenshot(null);
    setUploadStatus('idle');
    setErrorMessage('');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.runtime.sendMessage(
        { action: 'captureFullPage', tabId: tab.id },
        (response) => {
          if (response.success) {
            setScreenshot(response.screenshot);
            setPageTitle(response.title);
            setPageUrl(response.url);
          } else {
            setErrorMessage(response.error || 'Failed to capture full page screenshot');
          }
        }
      );
    } catch (error) {
      setErrorMessage('An error occurred while capturing the full page screenshot');
      console.error(error);
    }
  };

  const uploadToNotion = async () => {
    if (!screenshot) return;
    
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    
    try {
      const result = await NotionService.uploadScreenshot({
        imageData: screenshot,
        title: pageTitle,
        url: pageUrl,
        tags: selectedTags
      });
      
      if (result.success) {
        setUploadStatus('success');
        setSelectedTags([]);
        setTimeout(() => {
          setScreenshot(null);
          setUploadStatus('idle');
        }, 2000);
      } else {
        setUploadStatus('error');
        setErrorMessage(result.error || 'Failed to upload to Notion');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('An error occurred while uploading to Notion');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    }
  };

  return (
    <div className="w-[350px] min-h-[400px] bg-white text-gray-800 p-4 flex flex-col">
      <header className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h1 className="text-xl font-semibold flex items-center">
          <Camera className="w-5 h-5 mr-2 text-purple-600" />
          Screenshot to Notion
        </h1>
        <button 
          onClick={openOptions}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </button>
      </header>

      {!isNotionConfigured ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="text-gray-600">
            <p className="mb-4">Please configure your Notion API key to get started.</p>
            <button
              onClick={openOptions}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Configure Notion
            </button>
          </div>
        </div>
      ) : screenshot ? (
        <div className="flex-1 flex flex-col">
          <ScreenshotPreview 
            screenshot={screenshot} 
            pageTitle={pageTitle} 
            pageUrl={pageUrl} 
          />
          
          <div className="mt-4">
            <TagSelector 
              selectedTags={selectedTags} 
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
            />
          </div>
          
          <div className="mt-auto pt-4">
            {uploadStatus === 'success' && (
              <div className="mb-3 p-2 bg-green-50 text-green-700 rounded-md text-sm text-center">
                Successfully uploaded to Notion!
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-md text-sm text-center">
                {errorMessage || 'Failed to upload to Notion'}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setScreenshot(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadToNotion}
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center transition-colors disabled:bg-purple-400"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
            <button
              onClick={captureVisibleTab}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Capture Visible Area
            </button>
            
            <button
              onClick={captureFullPage}
              className="w-full px-4 py-3 border border-purple-600 text-purple-600 hover:bg-purple-50 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Capture Full Page
            </button>
            
            <div className="text-sm text-gray-500 mt-4 text-center">
              Once captured, you can add tags and upload directly to your Notion workspace.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;