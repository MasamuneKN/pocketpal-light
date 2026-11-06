import {dispatchAutomationDeepLink} from '../../__automation__/deepLink';
import {ROUTES} from '../../utils/navigationConstants';
import type {DeepLinkParams} from '../../services/DeepLinkService';

const makeParams = (url: string): DeepLinkParams => {
  const parsed = new URL(url);
  const queryParams: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  return {
    url,
    scheme: parsed.protocol.replace(':', ''),
    host: parsed.hostname,
    queryParams,
  };
};

describe('automation deep-link dispatcher', () => {
  const navigation = {navigate: jest.fn()};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes the benchmark URL with autostart disabled by default', async () => {
    await expect(
      dispatchAutomationDeepLink(
        makeParams('pocketpal://e2e/benchmark'),
        navigation,
      ),
    ).resolves.toBe(true);

    expect(navigation.navigate).toHaveBeenCalledWith(
      ROUTES.BENCHMARK_RUNNER,
      {autostart: false},
    );
  });

  it('routes the benchmark URL with autostart enabled when requested', async () => {
    await dispatchAutomationDeepLink(
      makeParams('pocketpal://e2e/benchmark?autostart=1'),
      navigation,
    );

    expect(navigation.navigate).toHaveBeenCalledWith(
      ROUTES.BENCHMARK_RUNNER,
      {autostart: true},
    );
  });

  it('returns false for unrelated links', async () => {
    await expect(
      dispatchAutomationDeepLink(
        makeParams('pocketpal://chat?message=hello'),
        navigation,
      ),
    ).resolves.toBe(false);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
