import { useState } from 'react';
import axios from 'axios';

interface AuthHook {
  forgotPassword: (email: string) => Promise<void>;
  // Add other auth methods as needed
}

export const useAuth = (): AuthHook => {
  const [isLoading, setIsLoading] = useState(false);

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/forgot-password/', { email });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgotPassword,
  };
}; 