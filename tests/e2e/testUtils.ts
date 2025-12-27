/**
 * Test utilities for E2E smoke tests
 *
 * Uses the /api/rest/test-token endpoint to create test accounts.
 * This endpoint only works in development/staging environments.
 *
 * For production testing, set TEST_TOKEN_1 and TEST_TOKEN_2 env vars.
 */

import axios from 'axios';

const API_BASE_URL = process.env.TEST_API_URL || 'https://cryptobattle-backend-production.up.railway.app';
const TEST_TOKEN_SECRET = process.env.TEST_TOKEN_SECRET;

interface TestAccount {
  accessToken: string;
  name: string;
}

/**
 * Check if manual tokens are provided via environment variables
 */
function hasManualTokens(): boolean {
  return !!(process.env.TEST_TOKEN_1 && process.env.TEST_TOKEN_2);
}

/**
 * Get test accounts from environment variables (for production testing)
 */
export function getTestAccounts(): TestAccount[] {
  const token1 = process.env.TEST_TOKEN_1;
  const token2 = process.env.TEST_TOKEN_2;

  if (!token1 || !token2) {
    throw new Error(
      'Missing test tokens. Set TEST_TOKEN_1 and TEST_TOKEN_2 environment variables.\n' +
      'To get tokens:\n' +
      '1. Log in to the app via MetaMask\n' +
      '2. Open browser DevTools → Application → Local Storage\n' +
      '3. Copy the "accessToken" value\n' +
      '4. Run: TEST_TOKEN_1=xxx TEST_TOKEN_2=yyy yarn test:smoke'
    );
  }

  return [
    { accessToken: token1, name: 'TestPlayer1' },
    { accessToken: token2, name: 'TestPlayer2' },
  ];
}

/**
 * Create a test account using the test-token API endpoint
 * Only works in development/staging environments
 */
async function createTestAccount(username: string): Promise<TestAccount> {
  const params: Record<string, string> = { username };

  // Add secret if available (required for production)
  if (TEST_TOKEN_SECRET) {
    params.secret = TEST_TOKEN_SECRET;
  }

  const response = await axios.get(`${API_BASE_URL}/api/rest/test-token`, {
    params,
  });

  return {
    accessToken: response.data.accessToken,
    name: response.data.username,
  };
}

/**
 * Create multiple test accounts
 * Uses API endpoint in dev/staging, or env vars for production
 */
export async function createGuestAccounts(count: number): Promise<TestAccount[]> {
  // If manual tokens are provided, use them
  if (hasManualTokens()) {
    const accounts = getTestAccounts();
    if (count > accounts.length) {
      throw new Error(`Only ${accounts.length} test accounts available, requested ${count}`);
    }
    return accounts.slice(0, count);
  }

  // Otherwise, try to create accounts via API
  try {
    const promises = Array.from({ length: count }, (_, i) =>
      createTestAccount(`SmokeBot${i + 1}`)
    );
    return await Promise.all(promises);
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number } };
    if (axiosError.response?.status === 403) {
      throw new Error(
        'Test token endpoint not available (production mode).\n' +
        'Set TEST_TOKEN_1 and TEST_TOKEN_2 environment variables manually.'
      );
    }
    throw error;
  }
}

/**
 * Wait for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or times out
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Wait until condition is true or timeout
 */
export async function waitUntil(
  condition: () => boolean,
  timeoutMs: number = 10000,
  pollIntervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (condition()) {
      return;
    }
    await sleep(pollIntervalMs);
  }

  throw new Error('waitUntil timeout');
}

/**
 * Create a guest session using the /auth/guest endpoint
 * This creates a real guest user in the database
 */
export async function createGuestSession(): Promise<TestAccount> {
  const response = await axios.get(`${API_BASE_URL}/auth/guest`);

  return {
    accessToken: response.data.accesstoken,
    name: `Guest_${Date.now()}`,
  };
}

/**
 * Create multiple guest sessions via /auth/guest endpoint
 */
export async function createGuestSessions(count: number): Promise<TestAccount[]> {
  const promises = Array.from({ length: count }, () => createGuestSession());
  return await Promise.all(promises);
}
