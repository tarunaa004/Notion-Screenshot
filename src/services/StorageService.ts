interface NotionConfig {
  apiKey: string;
  databaseId: string;
}

export class StorageService {
  private static NOTION_CONFIG_KEY = 'notion_config';
  private static TAGS_KEY = 'screenshot_tags';
  
  /**
   * Save Notion API configuration
   */
  static async saveNotionConfig(config: NotionConfig): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [this.NOTION_CONFIG_KEY]: config }, () => {
        resolve();
      });
    });
  }
  
  /**
   * Get Notion API configuration
   */
  static async getNotionConfig(): Promise<NotionConfig | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([this.NOTION_CONFIG_KEY], (result) => {
        resolve(result[this.NOTION_CONFIG_KEY] || null);
      });
    });
  }
  
  /**
   * Save tags
   */
  static async saveTags(tags: string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [this.TAGS_KEY]: tags }, () => {
        resolve();
      });
    });
  }
  
  /**
   * Get tags
   */
  static async getTags(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([this.TAGS_KEY], (result) => {
        resolve(result[this.TAGS_KEY] || []);
      });
    });
  }
}