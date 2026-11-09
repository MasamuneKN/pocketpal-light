import * as React from 'react';

import {derivedTextMessage} from '../../../../jest/fixtures';
import {render as renderWithProviders} from '../../../../jest/test-utils';
import {TextMessage} from '../TextMessage';

describe('text message', () => {
  it('renders a step through its visible content, not raw content', () => {
    const echo = '{"name": "web_search", "arguments": {"query": "Firecrawl"}}';
    const call = {
      id: 'c0',
      function: {name: 'web_search', arguments: '{"query": "Firecrawl"}'},
    };
    const {queryByText, rerender} = renderWithProviders(
      <TextMessage
        message={derivedTextMessage}
        messageWidth={440}
        showName={false}
        step={{content: echo}}
      />,
    );
    expect(queryByText(/web_search/)).not.toBeNull();

    rerender(
      <TextMessage
        message={derivedTextMessage}
        messageWidth={440}
        showName={false}
        usePreviewData={false}
        step={{content: echo, toolCalls: [call]}}
      />,
    );
    expect(queryByText(/web_search/)).toBeNull();
  });

  it('renders call-shaped JSON in a message without a step', () => {
    const echo = '{"name": "web_search", "arguments": {"query": "Firecrawl"}}';
    const {queryByText} = renderWithProviders(
      <TextMessage
        message={{...derivedTextMessage, text: echo}}
        messageWidth={440}
        showName={false}
        usePreviewData={false}
      />,
    );
    expect(queryByText(/web_search/)).not.toBeNull();
  });

  it('renders and handles email press', async () => {
    expect.assertions(1);
    const email = 'john@flyer.chat';
    const getPreviewDataMock = jest
      .spyOn(utils, 'getPreviewData')
      .mockResolvedValue({});
    const openUrlMock = jest.spyOn(Linking, 'openURL');
    const {getByText} = render(
      <TextMessage
        message={{
          ...derivedTextMessage,
          author: {id: 'newUserId', firstName: 'John'},
          text: email,
        }}
        messageWidth={440}
        onPreviewDataFetched={jest.fn}
        showName
        usePreviewData
      />,
    );
    await waitFor(() => getByText(email));
    const text = getByText(email);
    fireEvent.press(text);
    expect(openUrlMock).toHaveBeenCalledWith(`mailto:${email}`);
    getPreviewDataMock.mockRestore();
    openUrlMock.mockRestore();
  });

  it('renders URLs as ordinary message text without fetching previews', () => {
    const url = 'https://example.com/page';
    const {getByText} = renderWithProviders(
      <TextMessage
        message={{...derivedTextMessage, text: url}}
        messageWidth={440}
        showName={false}
      />,
    );
    expect(getByText(url)).toBeTruthy();
  });
});
