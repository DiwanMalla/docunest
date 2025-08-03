import { Storage, File } from 'megajs';

interface MegaConfig {
  email: string;
  password: string;
}

class MegaClient {
  private storage: Storage | null = null;
  private config: MegaConfig;

  constructor(config: MegaConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.storage) return;

    this.storage = await new Storage({
      email: this.config.email,
      password: this.config.password,
    }).ready;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    foldername: string = 'DocuNest'
  ): Promise<{ url: string; fileId: string; size: number }> {
    await this.connect();
    
    if (!this.storage) {
      throw new Error('MEGA storage not initialized');
    }

    // Upload with folder prefix in filename for organization
    const fullPath = `${foldername}_${filename}`;
    
    return new Promise((resolve, reject) => {
      const uploadStream = this.storage!.upload(fullPath, buffer);
      
      uploadStream.on('complete', async (file: File) => {
        try {
          // Generate public link
          const link = await file.link({ noKey: false });
          
          resolve({
            url: link,
            fileId: file.nodeId || '',
            size: buffer.length,
          });
        } catch (error) {
          reject(error);
        }
      });

      uploadStream.on('error', reject);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.connect();
    
    if (!this.storage) {
      throw new Error('MEGA storage not initialized');
    }

    const file = this.storage.files[fileId];
    if (file) {
      await file.delete();
    }
  }

  async getStorageUsage(): Promise<{
    used: number;
    total: number;
    percentage: number;
  }> {
    await this.connect();
    
    if (!this.storage) {
      throw new Error('MEGA storage not initialized');
    }

    // Calculate used space from all files
    let usedSpace = 0;
    const total = 20 * 1024 * 1024 * 1024; // 20GB free tier

    const allFiles = Object.values(this.storage.files);
    for (const file of allFiles) {
      if (!file.directory && file.size) {
        usedSpace += file.size;
      }
    }

    return {
      used: usedSpace,
      total: total,
      percentage: (usedSpace / total) * 100,
    };
  }

  async listFiles(foldername: string = 'DocuNest'): Promise<Array<{
    name: string;
    size: number;
    url: string;
    nodeId: string;
    createdAt: Date;
  }>> {
    await this.connect();
    
    if (!this.storage) {
      throw new Error('MEGA storage not initialized');
    }

    const files = [];
    const prefix = `${foldername}_`;
    
    // Get all files that start with our folder prefix
    const allFiles = Object.values(this.storage.files);
    for (const file of allFiles) {
      if (!file.directory && file.name?.startsWith(prefix)) {
        try {
          const link = await file.link({ noKey: false });
          files.push({
            name: file.name.substring(prefix.length), // Remove prefix
            size: file.size || 0,
            url: link,
            nodeId: file.nodeId || '',
            createdAt: new Date(file.timestamp || Date.now()),
          });
        } catch (error) {
          console.error('Error getting link for file:', file.name, error);
        }
      }
    }

    return files;
  }
}

// Create singleton instance
let megaClient: MegaClient | null = null;

export function getMegaClient(): MegaClient {
  if (!megaClient) {
    const config = {
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
    };

    if (!config.email || !config.password) {
      throw new Error(
        'MEGA credentials not found. Please set MEGA_EMAIL and MEGA_PASSWORD environment variables.'
      );
    }

    megaClient = new MegaClient(config);
  }

  return megaClient;
}

export default MegaClient;
