import {dispatchAutomationDeepLink} from '../../__automation__/deepLink';
import {ROUTES} from '../../utils/navigationConstants';
import type {DeepLinkParams} from '../../services/DeepLinkService';

describe('automation Plus test-feature deep link', () => {
  it('routes the E2E feature URL to the Plus test screen', async () => {
    const url = 'pocketpal://e2e/plus-feature';
    const parsed = new URL(url);
    const params: DeepLinkParams = {
      url,
      scheme: 'pocketpal',
      host: parsed.hostname,
      queryParams: {},
    };
    const navigation = {navigate: jest.fn()};

    await expect(dispatchAutomationDeepLink(params, navigation)).resolves.toBe(
      true,
    );
    expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.PLUS_TEST_FEATURE);
  });

  it('does not consume an unrelated URL', async () => {
    const url = 'pocketpal://e2e/unknown';
    const navigation = {navigate: jest.fn()};
    await expect(
      dispatchAutomationDeepLink(
        {url, scheme: 'pocketpal', host: 'e2e', queryParams: {}},
        navigation,
      ),
    ).resolves.toBe(false);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
