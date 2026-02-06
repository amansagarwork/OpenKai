// Terminal Module Services
export interface TerminalService {
  createSession(userId: number, name?: string): Promise<any>;
  executeCommand(sessionId: string, command: string, userId: number): Promise<any>;
  closeSession(sessionId: string, userId: number): Promise<void>;
}

export class TerminalServiceImpl implements TerminalService {
  async createSession(userId: number, name?: string) {
    // Implementation moved from controller
  }

  async executeCommand(sessionId: string, command: string, userId: number) {
    // Implementation moved from controller
  }

  async closeSession(sessionId: string, userId: number) {
    // Implementation moved from controller
  }
}
