import { logError, formatError, isNetworkError } from '../errorHandler';

describe('errorHandler', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('formatError', () => {
    it('formats Error objects', () => {
      const error = new Error('Test error');
      const result = formatError(error);
      expect(result).toContain('Test error');
    });

    it('formats string errors', () => {
      const result = formatError('String error');
      expect(result).toBe('String error');
    });

    it('formats unknown errors', () => {
      const result = formatError({ custom: 'object' });
      expect(result).toContain('custom');
    });

    it('handles null/undefined', () => {
      expect(formatError(null)).toBe('Unknown error');
      expect(formatError(undefined)).toBe('Unknown error');
    });
  });

  describe('logError', () => {
    it('logs error with context', () => {
      const error = new Error('Test');
      logError(error, 'TestContext');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestContext]'),
        expect.any(String)
      );
    });

    it('logs error without context', () => {
      const error = new Error('Test');
      logError(error);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('isNetworkError', () => {
    it('identifies network errors', () => {
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('ECONNREFUSED'))).toBe(true);
    });

    it('returns false for non-network errors', () => {
      expect(isNetworkError(new Error('Some other error'))).toBe(false);
      expect(isNetworkError('string error')).toBe(false);
    });
  });
});
