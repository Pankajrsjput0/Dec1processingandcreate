import { toast } from 'react-hot-toast';

export const SUPABASE_TIMEOUT = 10000; // 10 seconds

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = SUPABASE_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export function handleError(error: any) {
  console.error('Error:', error);
  const message = error?.message || 'An unexpected error occurred';
  toast.error(message);
}

export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await withTimeout(fetchFn());
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}