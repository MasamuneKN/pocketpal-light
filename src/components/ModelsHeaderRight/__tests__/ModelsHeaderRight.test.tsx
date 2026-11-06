import React from 'react';

import {fireEvent, render, waitFor} from '../../../../jest/test-utils';

import {ModelsHeaderRight} from '../ModelsHeaderRight';

import {uiStore} from '../../../store';


describe('ModelsHeaderRight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByTestId} = render(<ModelsHeaderRight />);
    expect(getByTestId('models-menu-button')).toBeTruthy();
  });

  it('toggles HF filter when pressed', async () => {
    const {getByTestId} = render(<ModelsHeaderRight />);

    // Open menu
    fireEvent.press(getByTestId('models-menu-button'));

    // Press HF filter option
    fireEvent.press(getByTestId('filter-hf'));

    expect(uiStore.setValue).toHaveBeenCalledWith(
      'modelsScreen',
      'filters',
      expect.arrayContaining(['hf']),
    );
  });

  it('toggles downloaded filter when pressed', async () => {
    const {getByTestId, getByText} = render(<ModelsHeaderRight />);

    // Open menu
    fireEvent.press(getByTestId('models-menu-button'));

    // Press downloaded filter option
    fireEvent.press(getByTestId('filter-downloaded'));

    expect(uiStore.setValue).toHaveBeenCalledWith(
      'modelsScreen',
      'filters',
      expect.arrayContaining(['downloaded']),
    );
  });

  it('toggles grouped view when pressed', async () => {
    const {getByTestId, getByText} = render(<ModelsHeaderRight />);

    // Open menu
    fireEvent.press(getByTestId('models-menu-button'));

    // Press group option
    fireEvent.press(getByTestId('filter-grouped'));

    expect(uiStore.setValue).toHaveBeenCalledWith(
      'modelsScreen',
      'filters',
      expect.arrayContaining(['grouped']),
    );
  });

  it('shows reset dialog when reset option is pressed', async () => {
    const {getByTestId, getByText, queryByTestId} = render(
      <ModelsHeaderRight />,
    );

    // Open menu
    fireEvent.press(getByTestId('models-menu-button'));

    // Press reset option
    const resetOption = getByText(
      l10n.en.components.modelsHeaderRight.menuTitleReset,
    );
    fireEvent.press(resetOption);

    await waitFor(() => {
      expect(queryByTestId('reset-dialog')).toBeTruthy();
    });
  });
});
