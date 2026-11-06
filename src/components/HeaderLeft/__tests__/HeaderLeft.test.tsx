import React from 'react';

import {fireEvent, render} from '../../../../jest/test-utils';

import {HeaderLeft} from '../HeaderLeft';

const mockOpenDrawer = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({openDrawer: mockOpenDrawer}),
}));

describe('HeaderLeft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the drawer', () => {
    const {getByTestId} = render(<HeaderLeft />);

    fireEvent.press(getByTestId('menu-button'));

    expect(mockOpenDrawer).toHaveBeenCalledTimes(1);
  });
});
