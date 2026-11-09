/**
 * E2E-only deep-link dispatcher. Only imported from a __E2E__-gated branch
 * in src/hooks/useDeepLinking.ts, so this module is DCE-stripped in prod.
 *
 * Supported protocols in v1:
 *   pocketpal://memory?cmd=snap::<label>
 *   pocketpal://memory?cmd=clear::snapshots
 *                              transcribing|waiting-chat|error-capture|
 *                              error-blocked|error-memory|error-disk>
 *   pocketpal://e2e/benchmark   (Android: cold-launch path lives in
 *                                useDeepLinking.ts handles this Android URL directly)
 */
import type {DeepLinkParams} from '../utils/deepLinkTypes';
import {ROUTES} from '../utils/navigationConstants';
import {isBenchmarkRunnerUrl, parseBenchmarkAutostart} from './benchmarkRoute';

interface NavigationLike {
  navigate: (route: string, params?: Record<string, unknown>) => void;
}

/** Returns true if handled; false if caller should fall through. */
export async function dispatchAutomationDeepLink(
  params: DeepLinkParams,
  navigation?: NavigationLike,
): Promise<boolean> {
  if (params.host === 'memory' && params.queryParams?.cmd) {
    const {
      takeMemorySnapshot,
      clearMemorySnapshots,
    } = require('../utils/memoryProfile');
    const cmd = params.queryParams.cmd;
    if (cmd.startsWith('snap::')) {
      const label = cmd.slice(6) || 'unnamed';
      await takeMemorySnapshot(label);
    } else if (cmd === 'clear::snapshots') {
      await clearMemorySnapshots();
    }
    return true;
  }
  // pocketpal://e2e/benchmark — bench host. Match against the raw URL via
  // the shared helper so both deep-link sites (this dispatcher and the
  // useDeepLinking cold/warm-launch effect) accept the exact same shape.
  if (isBenchmarkRunnerUrl(params.url)) {
    // Resolve autostart from the raw URL string via the shared helper so the
    // Android deep-link path uses one consistent interpretation.
    navigation?.navigate(ROUTES.BENCHMARK_RUNNER, {
      autostart: parseBenchmarkAutostart(params.url),
    });
    return true;
  }
  return false;
}
