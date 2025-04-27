import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ScreenshotPreviewProps {
  screenshot: string;
  pageTitle: string;
  pageUrl: string;
}

const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({ 
  screenshot, 
  pageTitle, 
  pageUrl 
}) => {
  // Format URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-lg border border-gray-200 mb-2 shadow-sm">
        <img 
          src={screenshot} 
          alt="Screenshot preview" 
          className="w-full h-auto object-cover"
        />
      </div>
      
      <div className="text-sm">
        <h3 className="font-medium text-gray-900 truncate" title={pageTitle}>
          {pageTitle || 'Untitled Page'}
        </h3>
        
        <a 
          href={pageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-purple-600 flex items-center gap-1 truncate mt-1"
          title={pageUrl}
        >
          {formatUrl(pageUrl)}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default ScreenshotPreview;