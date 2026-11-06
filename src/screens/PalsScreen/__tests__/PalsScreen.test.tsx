import React from 'react';
import {fireEvent} from '@testing-library/react-native';

import {render} from '../../../../jest/test-utils';
import {PalsScreen} from '../PalsScreen';
import {palStore} from '../../../store';
import {createPal, mockVideoPal} from '../../../../jest/fixtures/pals';

describe('PalsScreen — local Pal library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    palStore.pals = [];
  });

  const renderScreen = () =>
    render(<PalsScreen />, {
      withNavigation: true,
      withSafeArea: true,
      withBottomSheetProvider: true,
    });

  it('shows the empty state when no local Pals exist', () => {
    const {getByText} = renderScreen();

    expect(
      getByText('No Pals yet. Create your first local Pal using the + button.'),
    ).toBeTruthy();
  });

  it('renders local Pals and excludes remote store listings', () => {
    palStore.pals = [
      createPal({id: 'local-1', name: 'Offline Assistant'}),
      createPal({id: 'local-2', name: 'Writing Helper'}),
      createPal({
        id: 'remote-1',
        name: 'Remote Listing',
        source: 'palshub',
      }),
    ];

    const {getByText, queryByText} = renderScreen();

    expect(getByText('Offline Assistant')).toBeTruthy();
    expect(getByText('Writing Helper')).toBeTruthy();
    expect(queryByText('Remote Listing')).toBeNull();
  });

  it('filters local Pals by name and description', () => {
    palStore.pals = [
      createPal({
        id: 'local-1',
        name: 'Offline Assistant',
        description: 'Helps with writing',
      }),
      createPal({
        id: 'local-2',
        name: 'Travel Planner',
        description: 'Plans local trips',
      }),
    ];

    const {getByLabelText, getByText, queryByText} = renderScreen();
    fireEvent.changeText(getByLabelText('Search local Pals'), 'writing');

    expect(getByText('Offline Assistant')).toBeTruthy();
    expect(queryByText('Travel Planner')).toBeNull();
  });

  it('shows only video-capable local Pals when Video Pals is selected', () => {
    palStore.pals = [
      createPal({id: 'local-1', name: 'Text Assistant'}),
      {...mockVideoPal, id: 'video-1', name: 'Video Assistant'},
    ];

    const {getByText, queryByText} = renderScreen();
    fireEvent.press(getByText('Video Pals'));

    expect(getByText('Video Assistant')).toBeTruthy();
    expect(queryByText('Text Assistant')).toBeNull();
  });

  it('returns to all local Pals when All local Pals is selected', () => {
    palStore.pals = [
      createPal({id: 'local-1', name: 'Text Assistant'}),
      {...mockVideoPal, id: 'video-1', name: 'Video Assistant'},
    ];

    const {getByText, queryByText} = renderScreen();
    fireEvent.press(getByText('Video Pals'));
    expect(queryByText('Text Assistant')).toBeNull();

    fireEvent.press(getByText('All local Pals'));
    expect(getByText('Text Assistant')).toBeTruthy();
    expect(getByText('Video Assistant')).toBeTruthy();
  });
});
