# Logging & Monitoring Configuration

**Developer:** M5 (Inthusha) | **Day:** 28

## Overview

Complete logging and monitoring setup for development, staging, and production environments.

## Logging Architecture

```
Application Logs
├── Console (development)
├── File system (staging/production)
└── Sentry (error tracking, optional)

Monitoring Metrics
├── Application performance
├── Database queries
├── API response times
└── Error rates

Alerts
├── Critical errors
├── High latency alerts
├── Database connection issues
└── Disk space warnings
```

---

## Winston Logger Setup

### Installation

```bash
cd backend
npm install winston winston-daily-rotate-file
```

### Logger Configuration

**File:** `config/logger.js`

```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Define transports
const transports = [
  // Console output (all environments)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(info => {
        const { timestamp, level, message, ...args } = info;
        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    )
  })
];

// File transports (staging & production)
if (!isDevelopment) {
  const logsDir = process.env.LOG_DIR || './logs';

  transports.push(
    // Combined log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Error log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxDays: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'warn'),
  levels,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || './logs', 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || './logs', 'rejections.log')
    })
  ]
});

module.exports = logger;
```

---

## Application Logging

### HTTP Request Logging

**Middleware:** `middleware/logging.js`

```javascript
const logger = require('../config/logger');

function httpLoggingMiddleware(req, res, next) {
  const start = Date.now();

  // Log request
  logger.http(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    logger.http(`${req.method} ${req.path} ${statusCode} ${duration}ms`, {
      duration,
      statusCode,
      responseSize: JSON.stringify(data).length
    });

    return originalJson.call(this, data);
  };

  next();
}

module.exports = httpLoggingMiddleware;
```

### Database Query Logging

**Wrapper:** `utils/database-logger.js`

```javascript
const logger = require('../config/logger');

async function logQuery(queryFunc, sql, params = []) {
  const start = Date.now();

  try {
    const result = await queryFunc();
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        sql: sql.substring(0, 200),
        duration,
        rowCount: result.rowCount
      });
    } else {
      logger.debug('Database query', {
        sql: sql.substring(0, 200),
        duration
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Database error', {
      sql: sql.substring(0, 200),
      error: error.message,
      duration
    });
    throw error;
  }
}

module.exports = logQuery;
```

### API Endpoint Logging

**In Controllers:**

```javascript
const logger = require('../config/logger');

exports.createSurgery = async (req, res) => {
  try {
    logger.info('Creating surgery', {
      userId: req.user.id,
      patientId: req.body.patientId
    });

    // ... create surgery logic

    logger.info('Surgery created successfully', {
      surgeryId: surgery.id,
      userId: req.user.id
    });

    res.json(surgery);
  } catch (error) {
    logger.error('Surgery creation failed', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: 'Surgery creation failed' });
  }
};
```

---

## Error Logging

### Global Error Handler

**File:** `middleware/error-handler.js`

```javascript
const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  const errorId = Math.random().toString(36).substr(2, 9);

  logger.error('Unhandled error', {
    errorId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    statusCode: err.statusCode || 500
  });

  // Return error response
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    errorId  // For user reference
  });
}

module.exports = errorHandler;
```

### Structured Error Logging

```javascript
logger.error('Database connection failed', {
  error: error.message,
  code: error.code,
  host: process.env.DB_HOST,
  retryAttempt: 1,
  timestamp: new Date().toISOString()
});
```

---

## Monitoring Metrics

### Performance Monitoring

**File:** `utils/performance-monitor.js`

```javascript
const logger = require('../config/logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  startTimer(label) {
    this.metrics[label] = Date.now();
  }

  endTimer(label) {
    if (!this.metrics[label]) return null;

    const duration = Date.now() - this.metrics[label];
    delete this.metrics[label];

    return duration;
  }

  logRequest(method, path, duration, statusCode) {
    const metric = {
      method,
      path,
      duration,
      statusCode,
      timestamp: new Date().toISOString()
    };

    // Log if slow
    if (duration > 1000) {
      logger.warn('Slow request', metric);
    }

    // Track metrics
    this.trackMetrics(metric);
  }

  trackMetrics(metric) {
    // Send to monitoring service (DataDog, New Relic, etc.)
    // Example:
    // fetch('https://metrics.example.com/api/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric)
    // });
  }
}

module.exports = new PerformanceMonitor();
```

### Memory & CPU Monitoring

```javascript
const logger = require('../config/logger');

// Log memory usage every 5 minutes
setInterval(() => {
  const usage = process.memoryUsage();
  
  if (usage.heapUsed > usage.heapTotal * 0.9) {
    logger.warn('High memory usage', {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    });
  }
}, 5 * 60 * 1000);

// Log process uptime
setInterval(() => {
  logger.info('System health check', {
    uptime: process.uptime(),
    pid: process.pid,
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  });
}, 60 * 60 * 1000);
```

---

## Application Startup Logging

**In `server.js`:**

```javascript
const logger = require('./config/logger');

// Log startup
logger.info('TheatreX Backend Starting', {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV,
  port: process.env.PORT
});

// Log database connection
logger.info('Database connected', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME
});

// Log startup complete
app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    url: `http://localhost:${PORT}`,
    timestamp: new Date().toISOString()
  });
});

// Log graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
```

---

## Log Rotation & Retention

### Staging Environment

```
logs/
├── combined-2025-03-21.log (10MB max)
├── error-2025-03-21.log
├── combined-2025-03-20.log
└── error-2025-03-19.log (14 days max)
```

**Configuration:**
```javascript
maxSize: '20m',      // Rotate when 20MB
maxDays: '14d',      // Keep 14 days
datePattern: 'YYYY-MM-DD'
```

### Production Environment

```
logs/
├── combined-2025-03-21.log (20MB max)
├── error-2025-03-21.log
└── ... (30 days retention)
```

**Configuration:**
```javascript
maxSize: '20m',      // Rotate when 20MB
maxDays: '30d',      // Keep 30 days
datePattern: 'YYYY-MM-DD'
```

---

## Log Levels & Usage

| Level | Use Case | Example |
|-------|----------|---------|
| **error** | Critical failures | Database connection failed |
| **warn** | Warnings, might fail | Slow query (1.5s), High memory (90%) |
| **info** | General information | Server started, User logged in |
| **http** | HTTP requests | GET /api/surgeries 200 |
| **debug** | Detailed debugging | Variable values, function calls |

---

## Monitoring Setup

### Environment Variables

```
# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DIR=./logs
LOG_MAX_SIZE=10485760
LOG_MAX_DAYS=30

# Monitoring
ENABLE_PERFORMANCE_MONITORING=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SENTRY_DSN=https://...@sentry.io/...
```

### Slack Notifications

**File:** `utils/slack-notifier.js`

```javascript
const logger = require('../config/logger');

async function sendSlackAlert(message, severity = 'error') {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  const color = {
    error: 'danger',
    warn: 'warning',
    info: 'good'
  }[severity];

  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        attachments: [{
          color,
          title: `${severity.toUpperCase()}: ${message}`,
          text: `Environment: ${process.env.NODE_ENV}`,
          ts: Math.floor(Date.now() / 1000)
        }]
      })
    });
  } catch (error) {
    logger.error('Failed to send Slack alert', { error: error.message });
  }
}

module.exports = sendSlackAlert;
```

---

## Log Analysis

### Common Log Patterns

```bash
# View real-time logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Count errors by type
grep "ERROR" logs/error-*.log | wc -l

# Find slow queries
grep "Slow query" logs/combined-*.log | jq '.'

# View last 100 error entries
tail -100 logs/error-$(date +%Y-%m-%d).log | jq '.'

# Parse JSON logs
cat logs/combined-*.log | jq 'select(.level=="warn")'
```

### Debugging Checklist

- [ ] Check error logs for stack traces
- [ ] Search for specific error ID
- [ ] Review request logs around error time
- [ ] Check database logs for queries
- [ ] Monitor memory/CPU at error time
- [ ] Check external service integrations

---

## Checklist

✅ Logging Setup for Day 28:

- [ ] Winston logger configured
- [ ] Console transport setup
- [ ] File rotation configured
- [ ] HTTP request logging enabled
- [ ] Database query logging enabled
- [ ] Error handler logging enabled
- [ ] Performance monitoring enabled
- [ ] Memory monitoring setup
- [ ] Startup/shutdown logging added
- [ ] Log levels configured by environment
- [ ] Slack notifications configured
- [ ] Log retention policies set

---

**Last Updated:** March 21, 2025  
**Version:** 1.0.0
