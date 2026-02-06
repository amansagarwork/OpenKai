// Paste Module Services
export interface PasteService {
  createPaste(paste: any): Promise<any>;
  getPaste(id: string): Promise<any>;
  deletePaste(id: string, userId?: number): Promise<void>;
}

export class PasteServiceImpl implements PasteService {
  async createPaste(paste: any) {
    // Implementation moved from controller
  }

  async getPaste(id: string) {
    // Implementation moved from controller
  }

  async deletePaste(id: string, userId?: number) {
    // Implementation moved from controller
  }
}
