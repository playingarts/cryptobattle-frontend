/**
 * Test utilities for E2E smoke tests
 *
 * REQUIRED ENVIRONMENT VARIABLES:
 * - TEST_TOKEN_1: Access token for first test account
 * - TEST_TOKEN_2: Access token for second test account
 *
 * To get test tokens:
 * 1. Log in to the app via Twitter or MetaMask
 * 2. Open browser DevTools → Application → Local Storage
 * 3. Copy the 'accessToken' value
 * 4. Set as environment variable before running tests
 *
 * Example:
 * TEST_TOKEN_1=xxx TEST_TOKEN_2=yyy yarn test:smoke
 */

interface TestAccount {
  accessToken: string;
  name: string;
}

/**
 * Get test accounts from environment variables
 */
export function getTestAccounts(): TestAccount[] {
  const token1 = process.env.TEST_TOKEN_1;
  const token2 = process.env.TEST_TOKEN_2;

  if (!token1 || !token2) {
    throw new Error(
      'Missing test tokens. Set TEST_TOKEN_1 and TEST_TOKEN_2 environment variables.\n' +
      'To get tokens:\n' +
      '1. Log in to the app via Twitter or MetaMask\n' +
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
 * Create multiple test accounts (uses pre-configured tokens)
 */
export async function createGuestAccounts(count: number): Promise<TestAccount[]> {
  const accounts = getTestAccounts();

  if (count > accounts.length) {
    throw new Error(`Only ${accounts.length} test accounts available, requested ${count}`);
  }

  return accounts.slice(0, count);
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
