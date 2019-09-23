import { TelegramClient } from 'messaging-api-telegram';

import { getWebhook } from '../webhook';
import { log } from '../../../shared/log';

jest.mock('messaging-api-telegram');
jest.mock('../../../shared/log');
jest.mock('../../../shared/getConfig');

const getConfig = require('../../../shared/getConfig').default;

const MOCK_FILE_WITH_PLATFORM = {
  channels: {
    telegram: {
      accessToken: '__accessToken__',
    },
    line: {},
  },
};

beforeEach(() => {
  process.exit = jest.fn();
  getConfig.mockReturnValue(MOCK_FILE_WITH_PLATFORM.channels.telegram);

  TelegramClient.connect.mockReturnValue({
    getWebhookInfo: jest.fn().mockResolvedValue({
      url: 'https://4a16faff.ngrok.io/',
      has_custom_certificate: false,
      pending_update_count: 0,
      max_connections: 40,
    }),
  });
});

it('be defined', () => {
  expect(getWebhook).toBeDefined();
});

describe('resolve', () => {
  it('--token should work', async () => {
    const ctx = {
      argv: { '--token': '12345' },
    };

    await getWebhook(ctx);

    expect(TelegramClient.connect).toBeCalledWith('12345');
  });

  it('successfully get webhook', async () => {
    const ctx = {
      argv: {},
    };

    await getWebhook(ctx);

    expect(log.print).toHaveBeenCalledTimes(4);
  });
});

describe('reject', () => {
  it('reject when Telegram return not success', () => {
    const ctx = {
      argv: {},
    };
    TelegramClient.connect().getWebhookInfo.mockResolvedValueOnce({
      ok: false,
    });

    expect(getWebhook(ctx).then).toThrow();
  });

  it('reject when accessToken is not found in config file', () => {
    const ctx = {
      argv: {},
    };

    getConfig.mockReturnValueOnce({});

    expect(getWebhook(ctx).then).toThrow();
  });
});
