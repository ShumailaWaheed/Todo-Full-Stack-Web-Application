// frontend/lib/api/backend-wakeup.ts
// Utility to wake up the backend when it's sleeping

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class BackendWakeupService {
  private isBackendAwake = false;
  private lastCheckTime = 0;
  private readonly checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

  async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {  // Changed to /health endpoint
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  async wakeUpBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.isBackendAwake = true;
        this.lastCheckTime = Date.now();
        console.log('Backend successfully woken up');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to wake up backend:', error);
      return false;
    }
  }

  async ensureBackendAwake(): Promise<boolean> {
    const now = Date.now();

    // If we've checked within the last interval, return cached status
    if (now - this.lastCheckTime < this.checkInterval) {
      return this.isBackendAwake;
    }

    const isAlive = await this.checkBackendHealth();

    if (!isAlive) {
      console.log('Backend appears to be sleeping, attempting to wake it up...');
      // Wait a bit before trying to wake it up
      await new Promise(resolve => setTimeout(resolve, 1000));
      const wokeUp = await this.wakeUpBackend();
      return wokeUp;
    }

    this.isBackendAwake = true;
    this.lastCheckTime = now;
    return true;
  }

  // Periodic wake-up to keep the backend alive
  startPeriodicWakeUp(intervalMinutes: number = 4): void {
    setInterval(async () => {
      console.log('Performing periodic backend wake-up check...');
      await this.ensureBackendAwake();
    }, intervalMinutes * 60 * 1000);
  }
}

export const backendWakeupService = new BackendWakeupService();