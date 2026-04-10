const LOG_LEVELS = { error: 0, warn: 1, info: 2 };
const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'cookie', 'secret'];
const isProduction = () => process.env.NODE_ENV === 'production';

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

const buildEntry = (level, message, context) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context.userId) entry.userId = context.userId;
  if (context.method) entry.method = context.method;
  if (context.path) entry.path = context.path;
  if (context.statusCode) entry.statusCode = context.statusCode;
  if (context.stack) entry.stack = context.stack;
  if (context.meta) entry.meta = sanitize(context.meta);

  return entry;
};

const formatEntry = (entry) => {
  if (isProduction()) return JSON.stringify(entry);

  const parts = [`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`];
  if (entry.method && entry.path) parts.push(`  ${entry.method} ${entry.path}`);
  if (entry.userId) parts.push(`  userId: ${entry.userId}`);
  if (entry.statusCode) parts.push(`  status: ${entry.statusCode}`);
  if (entry.meta) parts.push(`  meta: ${JSON.stringify(entry.meta)}`);
  if (entry.stack) parts.push(`  ${entry.stack}`);
  return parts.join('\n');
};

const log = (level, message, context = {}) => {
  const entry = buildEntry(level, message, context);
  const output = formatEntry(entry);

  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
};

const error = (message, context = {}) => log('error', message, context);
const warn = (message, context = {}) => log('warn', message, context);
const info = (message, context = {}) => log('info', message, context);

const fromRequest = (req) => ({
  method: req.method,
  path: req.originalUrl || req.url,
  userId: req.user?.id || req.user?._id || undefined,
});

module.exports = { error, warn, info, fromRequest, sanitize };
