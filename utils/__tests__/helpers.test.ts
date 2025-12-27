import { isEthAddress, truncateMiddle, formatUsername } from '../helpers';

describe('helpers', () => {
  describe('isEthAddress', () => {
    it('returns true for valid ethereum addresses', () => {
      expect(isEthAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
      expect(isEthAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      expect(isEthAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    });

    it('returns false for invalid addresses', () => {
      expect(isEthAddress('')).toBe(false);
      expect(isEthAddress('0x123')).toBe(false);
      expect(isEthAddress('742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false); // missing 0x
      expect(isEthAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44eG')).toBe(false); // invalid char
      expect(isEthAddress('not an address')).toBe(false);
    });
  });

  describe('truncateMiddle', () => {
    it('returns empty string for falsy input', () => {
      expect(truncateMiddle('')).toBe('');
    });

    it('returns original string if shorter than threshold', () => {
      expect(truncateMiddle('short')).toBe('short');
      expect(truncateMiddle('12345678901234567')).toBe('12345678901234567'); // 17 chars
    });

    it('truncates long strings with ellipsis', () => {
      const longString = '12345678901234567890123456789'; // 29 chars
      const result = truncateMiddle(longString);
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(longString.length);
    });

    it('handles ethereum addresses', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const result = truncateMiddle(address);
      expect(result).toContain('...');
      expect(result.startsWith('0x742d')).toBe(true);
      expect(result.endsWith('38f44e')).toBe(true);
    });
  });

  describe('formatUsername', () => {
    it('truncates ethereum addresses', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const result = formatUsername(address);
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(address.length);
    });

    it('returns regular usernames unchanged', () => {
      expect(formatUsername('alice')).toBe('alice');
      expect(formatUsername('bob123')).toBe('bob123');
      expect(formatUsername('CryptoPlayer')).toBe('CryptoPlayer');
    });
  });
});
