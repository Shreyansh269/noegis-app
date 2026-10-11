import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  buildSnapshot,
  generateWeeklyReport,
  hasUsageAccess,
  isNativeAvailable,
  loadCachedReport,
  loadSessions,
  openUsageAccessSettings,
  startOfDay,
} from '../services/trackerService';
import type { ReportData, UsageSnapshot } from '../services/trackerService';

/** Live per-app telemetry for today. Refreshes on mount, every minute, and when the app returns to the foreground. */
export function useUsageTracker(pollMs = 60_000) {
  const [hasAccess, setHasAccess] = useState<boolean>(!isNativeAvailable); // Expo Go uses sample data
  const [source, setSource] = useState<'native' | 'mock'>(isNativeAvailable ? 'native' : 'mock');
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const access = isNativeAvailable ? hasUsageAccess() : true;
      setHasAccess(access);
      if (!access) {
        setSnapshot(null);
        return;
      }
      const now = Date.now();
      const res = await loadSessions(startOfDay(now), now);
      setSource(res.source);
      setSnapshot(buildSnapshot(res.sessions, now));
      setError('');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    // coming back from the Usage Access settings page triggers an immediate refresh
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') refresh();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [refresh, pollMs]);

  return {
    isNative: isNativeAvailable,
    hasAccess,
    source,
    snapshot,
    error,
    refresh,
    requestAccess: openUsageAccessSettings,
  };
}

/** Weekly CBT report: builds the summary, calls LM Studio, caches the result on the device. */
export function useCbtReport() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCachedReport().then((r) => {
      if (r) {
        setReport(r);
        setStatus('ready');
      }
    });
  }, []);

  const generate = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const r = await generateWeeklyReport();
      setReport(r);
      setStatus('ready');
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus('error');
    }
  }, []);

  return { report, status, error, generate };
}
