const logger = require('../utils/logger.js');

describe('logger', () => {
  let errorSpy, warnSpy, logSpy;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
  });

  describe('log levels', () => {
    it('error() writes to console.error', () => {
      logger.error('something broke');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('something broke');
    });

    it('warn() writes to console.warn', () => {
      logger.warn('heads up');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('heads up');
    });

    it('info() writes to console.log', () => {
      logger.info('all good');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('all good');
    });
  });

  describe('context fields', () => {
    it('includes userId, method, path, and statusCode', () => {
      logger.error('fail', {
        userId: 'u123',
        method: 'POST',
        path: '/api/test',
        statusCode: 500,
      });

      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('u123');
      expect(output).toContain('POST');
      expect(output).toContain('/api/test');
      expect(output).toContain('500');
    });

    it('includes stack trace', () => {
      const stack = 'Error: boom\n    at Object.<anonymous>';
      logger.error('fail', { stack });

      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error: boom');
    });

    it('includes timestamp in ISO format', () => {
      logger.info('check time');
      const output = logSpy.mock.calls[0][0];
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('sanitize', () => {
    it('redacts password', () => {
      const result = logger.sanitize({ password: 'secret123', name: 'test' });
      expect(result.password).toBe('[REDACTED]');
      expect(result.name).toBe('test');
    });

    it('redacts token', () => {
      const result = logger.sanitize({ token: 'jwt-abc', role: 'admin' });
      expect(result.token).toBe('[REDACTED]');
      expect(result.role).toBe('admin');
    });

    it('redacts authorization header', () => {
      const result = logger.sanitize({ authorization: 'Bearer xyz' });
      expect(result.authorization).toBe('[REDACTED]');
    });

    it('redacts cookie', () => {
      const result = logger.sanitize({ cookie: 'session=abc' });
      expect(result.cookie).toBe('[REDACTED]');
    });

    it('redacts secret', () => {
      const result = logger.sanitize({ secret: 'my-secret' });
      expect(result.secret).toBe('[REDACTED]');
    });

    it('redacts nested sensitive keys', () => {
      const result = logger.sanitize({
        user: { name: 'Alice', password: 'p@ss' },
      });
      expect(result.user.password).toBe('[REDACTED]');
      expect(result.user.name).toBe('Alice');
    });

    it('includes sanitized meta in log output', () => {
      logger.info('with meta', { meta: { password: 'x', email: 'a@b.com' } });
      const output = logSpy.mock.calls[0][0];
      expect(output).toContain('[REDACTED]');
      expect(output).toContain('a@b.com');
      expect(output).not.toContain('"x"');
    });

    it('handles null and non-object input', () => {
      expect(logger.sanitize(null)).toBeNull();
      expect(logger.sanitize('string')).toBe('string');
      expect(logger.sanitize(42)).toBe(42);
    });
  });

  describe('fromRequest', () => {
    it('extracts method, path, and userId from request', () => {
      const req = {
        method: 'GET',
        originalUrl: '/api/users',
        user: { id: 'u456' },
      };
      const ctx = logger.fromRequest(req);
      expect(ctx).toEqual({
        method: 'GET',
        path: '/api/users',
        userId: 'u456',
      });
    });

    it('falls back to req.url when originalUrl is missing', () => {
      const req = { method: 'POST', url: '/api/auth/login' };
      const ctx = logger.fromRequest(req);
      expect(ctx.path).toBe('/api/auth/login');
    });

    it('handles missing user', () => {
      const req = { method: 'DELETE', originalUrl: '/api/items/1' };
      const ctx = logger.fromRequest(req);
      expect(ctx.userId).toBeUndefined();
    });
  });

  describe('production JSON format', () => {
    it('outputs valid JSON in production mode', () => {
      process.env.NODE_ENV = 'production';
      logger.error('prod error', { userId: 'u1', method: 'GET', path: '/api/x' });

      const output = errorSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('prod error');
      expect(parsed.userId).toBe('u1');
      expect(parsed.method).toBe('GET');
      expect(parsed.path).toBe('/api/x');
      expect(parsed.timestamp).toBeDefined();
    });
  });
});
