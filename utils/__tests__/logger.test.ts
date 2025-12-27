import { logger, LogLevel, setLogLevel } from '../logger';

describe('logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
    // Reset to default log level
    setLogLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('log levels', () => {
    it('logs debug messages when level is DEBUG', () => {
      setLogLevel(LogLevel.DEBUG);
      logger.debug('test message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('logs info messages', () => {
      logger.info('test message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('logs warn messages', () => {
      logger.warn('test message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('logs error messages', () => {
      logger.error('test message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('log level filtering', () => {
    it('filters debug messages when level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      logger.debug('should not appear');
      logger.info('should appear');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('filters debug and info when level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      logger.debug('should not appear');
      logger.info('should not appear');
      logger.warn('should appear');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('only logs errors when level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      logger.debug('should not appear');
      logger.info('should not appear');
      logger.warn('should not appear');
      logger.error('should appear');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('context logging', () => {
    it('includes context in log messages', () => {
      logger.info('test message', 'TestContext');
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestContext]'),
        'test message'
      );
    });
  });
});
