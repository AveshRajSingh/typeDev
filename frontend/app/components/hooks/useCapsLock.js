import { useState, useEffect } from 'react';

export const useCapsLock = () => {
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const checkCapsLock = (e) => {
      if (e.getModifierState && e.getModifierState('CapsLock')) {
        setCapsLockOn(true);
      } else {
        setCapsLockOn(false);
      }
    };

    window.addEventListener('keydown', checkCapsLock);
    window.addEventListener('keyup', checkCapsLock);

    return () => {
      window.removeEventListener('keydown', checkCapsLock);
      window.removeEventListener('keyup', checkCapsLock);
    };
  }, []);

  return capsLockOn;
};
