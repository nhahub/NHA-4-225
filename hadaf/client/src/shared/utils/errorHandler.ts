// src/shared/utils/errorHandler.ts
import { toast } from 'sonner';

export const handleApiError = (error: unknown, fallbackMessage = 'An error occurred') => {
  const message = error instanceof Error 
    ? error.message 
    : fallbackMessage;
  
  toast.error(message);
  console.error('API Error:', error);
};