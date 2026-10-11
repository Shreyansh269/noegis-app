import { requireOptionalNativeModule } from 'expo';

export type NativeSession = {
  packageName: string;
  label: string;
  start: number; // epoch ms
  end: number; // epoch ms
  isGame: boolean; // app declares the GAME category
};

type NoegisUsageNative = {
  hasUsageAccess(): boolean;
  openUsageAccessSettings(): void;
  getSessions(startMs: number, endMs: number): Promise<NativeSession[]>;
};

// null inside Expo Go (native module not present), so the app can fall back to mock data
export default requireOptionalNativeModule<NoegisUsageNative>('NoegisUsage');
