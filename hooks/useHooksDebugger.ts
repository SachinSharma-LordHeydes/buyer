import { useEffect, useRef } from 'react';

interface HookInfo {
  name: string;
  callCount: number;
  timestamp: number;
}

export function useHooksDebugger(componentName: string) {
  const hooksRef = useRef<HookInfo[]>([]);
  const renderCountRef = useRef(0);

  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return {
      logHook: () => {},
      getHooksInfo: () => [],
    };
  }

  const logHook = (hookName: string) => {
    const timestamp = Date.now();
    const existingHook = hooksRef.current.find(h => h.name === hookName);
    
    if (existingHook) {
      existingHook.callCount++;
      existingHook.timestamp = timestamp;
    } else {
      hooksRef.current.push({
        name: hookName,
        callCount: 1,
        timestamp,
      });
    }
  };

  const getHooksInfo = () => hooksRef.current;

  useEffect(() => {
    renderCountRef.current++;
    const renderCount = renderCountRef.current;
    const hooksCount = hooksRef.current.length;
    
    console.group(`🔍 ${componentName} - Render #${renderCount}`);
    console.log(`Total hooks called: ${hooksCount}`);
    console.table(hooksRef.current);
    console.groupEnd();
    
    // Check for potential hooks issues
    if (hooksCount === 0) {
      console.warn(`⚠️ ${componentName}: No hooks detected - this might indicate an early return issue`);
    }
    
    // Reset hooks count for next render
    hooksRef.current = [];
  });

  return {
    logHook,
    getHooksInfo,
  };
}

// Hook wrapper that automatically logs hook usage
export function withHooksDebugger<T extends (...args: any[]) => any>(
  hook: T,
  hookName: string,
  componentName: string
): T {
  return ((...args: Parameters<T>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🪝 ${componentName} called ${hookName}`);
    }
    return hook(...args);
  }) as T;
}
