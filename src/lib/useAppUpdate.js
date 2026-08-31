import { useRef, useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { storageGet, storageSet } from './storage';

const LAST_CHECK_KEY = 'ledger-update-last-check-v1';
const LAST_APPLIED_KEY = 'ledger-update-last-applied-v1';

export function useAppUpdate() {
  const registrationRef = useRef(null);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(() => storageGet(LAST_CHECK_KEY));
  const [lastApplied, setLastApplied] = useState(() => storageGet(LAST_APPLIED_KEY));

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      registrationRef.current = registration || null;
    },
  });

  useEffect(() => {
    if (needRefresh) {
      const now = new Date().toISOString();
      storageSet(LAST_APPLIED_KEY, now);
      setLastApplied(now);
    }
  }, [needRefresh]);

  async function checkForUpdate() {
    setChecking(true);
    const now = new Date().toISOString();
    storageSet(LAST_CHECK_KEY, now);
    setLastCheck(now);
    try {
      if (registrationRef.current) await registrationRef.current.update();
    } catch {
      // ignore — offline or no registration yet
    }
    setTimeout(() => setChecking(false), 1200);
  }

  function applyUpdate() {
    updateServiceWorker(true);
  }

  return { needRefresh, offlineReady, checking, lastCheck, lastApplied, checkForUpdate, applyUpdate, buildTime: __BUILD_TIME__ };
}
