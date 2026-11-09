import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent} from '../../../../jest/test-utils';
import {AboutScreen} from '../AboutScreen';
import {l10n} from '../../../locales';

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn().mockReturnValue('1.0.0'),
  getBuildNumber: jest.fn().mockReturnValue('100'),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('AboutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders app information and the local onboarding tour action', () => {
    const {getByText} = render(<AboutScreen />);

    expect(getByText('PocketPal AI')).toBeTruthy();
    expect(getByText('v1.0.0 (100)')).toBeTruthy();
    expect(getByText(l10n.en.about.tour)).toBeTruthy();
    expect(getByText(l10n.en.about.showIntroButton)).toBeTruthy();
  });

  it('copies version information to the clipboard', () => {
    const {getByText} = render(<AboutScreen />);
    fireEvent.press(getByText('v1.0.0 (100)'));

    expect(Alert.alert).toHaveBeenCalledWith(
      l10n.en.about.versionCopiedTitle,
      l10n.en.about.versionCopiedDescription,
    );
  });
});
