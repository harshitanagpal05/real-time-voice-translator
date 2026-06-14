import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../api/authApi';

export default function useBackendStatus(pollMs = 15000) {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const ok = await checkBackendHealth();
      if (active) setOnline(ok);
    };

    check();
    const id = setInterval(check, pollMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [pollMs]);

  return online;
}
