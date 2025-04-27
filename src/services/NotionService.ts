import { StorageService } from './StorageService';

interface UploadParams {
  imageData: string;
  title: string;
  url: string;
  tags: string[];
}

interface UploadResult {
  success: boolean;
  error?: string;
}

export class NotionService {
  /**
   * Uploads a screenshot to Notion
   */
  static async uploadScreenshot({ 
    imageData, 
    title, 
    url, 
    tags 
  }: UploadParams): Promise<UploadResult> {
    try {
      const config = await StorageService.getNotionConfig();
      
      if (!config?.apiKey) {
        return { 
          success: false, 
          error: 'Notion API key not configured. Please go to settings.' 
        };
      }
      
      if (!config?.databaseId) {
        return { 
          success: false, 
          error: 'Notion database ID not configured. Please go to settings.' 
        };
      }
      
      // Convert base64 image to blob
      const blob = await this.base64ToBlob(imageData.split(',')[1]);
      
      // Create a form data object for the file upload
      const formData = new FormData();
      formData.append('file', blob, `screenshot-${Date.now()}.png`);
      
      // First upload the image to Notion
      const uploadResponse = await fetch('https://api.notion.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Notion-Version': '2022-06-28'
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        return { 
          success: false, 
          error: error.message || 'Failed to upload image to Notion' 
        };
      }
      
      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.url;
      
      // Now create a new page in the database with the image
      const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: config.databaseId },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: title || 'Untitled Screenshot'
                  }
                }
              ]
            },
            URL: {
              url: url
            },
            Tags: {
              multi_select: tags.map(tag => ({ name: tag }))
            },
            Date: {
              date: {
                start: new Date().toISOString()
              }
            }
          },
          children: [
            {
              object: 'block',
              type: 'image',
              image: {
                type: 'external',
                external: {
                  url: imageUrl
                }
              }
            }
          ]
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Failed to create page in Notion' 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error uploading to Notion:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  /**
   * Convert base64 to Blob
   */
  private static async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(`data:image/png;base64,${base64}`);
    return await response.blob();
  }
}