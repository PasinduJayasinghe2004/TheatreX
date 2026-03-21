# Production PostgreSQL Database Configuration Guide

**Developer:** M2 (Chandeepa) | **Day:** 28

## Overview

This guide covers setting up and configuring PostgreSQL databases for staging and production environments using Neon Cloud.

## Architecture Overview

```
Local Development
├── PostgreSQL (localhost:5432)
└── theatrex_dev database

Staging Environment
├── Neon Cloud PostgreSQL
├── theatrex_staging database
└── Read replicas enabled

Production Environment
├── Neon Cloud PostgreSQL
├── theatrex_prod database (primary)
├── Read replicas (for analytics)
└── Automated backups
```

---

## Database Instances

### Development (Local)

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | theatrex_dev |
| Backups | None (local) |
| Replicas | None |
| Connection pooling | PgBouncer (6 connections) |

### Staging (Neon Cloud)

| Property | Value |
|----------|-------|
| Host | staging-xxx.neon.tech |
| Database | theatrex_staging |
| Backups | Daily automatic backups |
| Replicas | 1 read replica |
| Connection pooling | Neon built-in (50 connections) |
| Data retention | 7 days |

### Production (Neon Cloud)

| Property | Value |
|----------|-------|
| Host | prod-xxx.neon.tech |
| Database | theatrex_prod |
| Backups | Hourly + daily + weekly |
| Replicas | 2 read replicas |
| Connection pooling | Neon built-in (100 connections) |
| Data retention | 30 days |
| HA (High Availability) | Enabled |

---

## Neon Cloud Setup

### Step 1: Create Neon Account & Project

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub account
3. Create new project "TheatreX"
4. Select region closest to users (us-east-1 recommended)
5. Create database "theatrex_staging"

### Step 2: Get Connection Strings

**Neon Console:**
1. Go to "Connection details" tab
2. Select role and database
3. Copy connection string

**Format:**
```
postgresql://user:password@host/database?sslmode=require
```

**Example:**
```
postgresql://neondb_owner:abc123@ep-small-lake-123456.us-east-1.neon.tech/theatrex_staging?sslmode=require
```

### Step 3: Configure Connection Pooling

In Neon console:
1. Go to "Connection pooling"
2. Enable "Connection pooling"
3. Set pooling mode: "Transaction"
4. Set pool size: 10-20
5. Save

### Step 4: Branching for Development

Neon supports database branches (like Git):

```
Production Branch (main)
├── Staging Branch (staging)
└── Feature Branches (feature/*)
```

**Create branching workflow:**
```bash
# Create staging branch from production
neon branch create --name staging --from main

# Create feature branch from staging
neon branch create --name feature/new-tables --from staging
```

---

## Database Schema Setup

### Step 1: Run Migrations

```bash
cd backend

# Install dependencies
npm install

# Create .env file with DATABASE_URL
cp .env.example .env

# Run migrations
npm run migrate

# Seed test data
npm run seed:staging
```

### Step 2: Verify Tables

```bash
# Connect to database
psql "postgresql://user:pass@host/database?sslmode=require"

# List tables
\dt

# Show table structure
\d table_name
```

**Expected tables:**
```
users
surgeries
theatres
patients
nurses
surgeons
anaesthetists
technicians
notifications
sessions
audit_logs
```

### Step 3: Create Indexes

```sql
-- Performance indexes
CREATE INDEX idx_surgeries_status ON surgeries(status) WHERE status NOT IN ('completed', 'cancelled');
CREATE INDEX idx_surgeries_scheduled_date ON surgeries(scheduled_date);
CREATE INDEX idx_theatres_availability ON theatres(status);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at);
```

---

## Staging Database Configuration

### Connection Settings

```javascript
// config/database.staging.js
module.exports = {
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  // Connection pooling
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Query timeout
  statement_timeout: 30000,
  // Prepared statements
  application_name: 'theatrex_staging'
};
```

### Database Parameters

```sql
-- Optimal settings for staging
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET statement_timeout = 30000;

-- Reload configuration
SELECT pg_reload_conf();
```

### Enable Query Logging

```sql
-- Log all queries over 1 second
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

SELECT pg_reload_conf();
```

---

## Production Database Configuration

### High Availability Setup

```
┌─────────────┐         ┌──────────────┐
│   Primary   │────────▶│ Read Replica1│
│  (Write)    │         │  (Read-only) │
└─────────────┘         └──────────────┘
      │
      │
      ▼
 ┌──────────────┐
 │ Read Replica2│
 │  (Read-only) │
 └──────────────┘
```

**Neon Configuration:**
1. Enable "High Availability" in project settings
2. Create 2 read replicas automatically
3. Configure read replica connection endpoints

### Connection Settings

```javascript
// config/database.production.js
module.exports = {
  // Primary (for writes)
  primary: {
    host: process.env.DB_HOST_PRIMARY,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: true
  },
  
  // Read replicas (for reads)
  replicas: [
    {
      host: process.env.DB_HOST_REPLICA_1,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: true
    },
    {
      host: process.env.DB_HOST_REPLICA_2,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: true
    }
  ],
  
  // Connection pooling
  max: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // Query timeout
  statement_timeout: 30000,
  
  // Keep-alive
  keepAlives: true,
  keepAliveInitialDelaySeconds: 60
};
```

### Production Parameters

```sql
-- Optimized for production
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET statement_timeout = 30000;
ALTER SYSTEM SET idle_in_transaction_session_timeout = 60000;

-- Logging
ALTER SYSTEM SET log_min_duration_statement = 5000;
ALTER SYSTEM SET log_statement = 'ddl,mod';
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;

SELECT pg_reload_conf();
```

---

## Backup & Recovery

### Automated Backups

**Staging (Daily):**
- Backup time: 2:00 AM UTC
- Retention: 7 days
- Type: Full backup

**Production (Multiple):**
- Hourly: Last 24 hours
- Daily: Last 30 days
- Weekly: Last 90 days
- Type: Point-in-time recovery

### Manual Backup

```bash
# Backup database
pg_dump "postgresql://user:pass@host/database" > backup_$(date +%Y%m%d).sql

# Backup with compression
pg_dump "postgresql://user:pass@host/database" | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
psql "postgresql://user:pass@host/database" < backup_20250321.sql
```

### Backup to AWS S3

```bash
# Install AWS CLI
pip install awscli

# Upload backup
aws s3 cp backup_20250321.sql.gz s3://theatrex-backups/

# Download backup
aws s3 cp s3://theatrex-backups/backup_20250321.sql.gz .

# Setup automatic backup
# Use AWS S3 scheduled task or Neon's backup integration
```

---

## Monitoring & Maintenance

### Monitor Database Health

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT pid, query, query_start
FROM pg_stat_activity
WHERE state = 'active'
AND query_start < now() - interval '5 minutes';

-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Database size
SELECT pg_size_pretty(pg_database_size('theatrex_prod'));

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename, indexname;
```

### Maintenance Tasks

```sql
-- Reindex all tables
REINDEX DATABASE theatrex_prod;

-- Vacuum
VACUUM ANALYZE;

-- Dead row cleanup
ALTER TABLE table_name SET (fillfactor = 90);
VACUUM FULL table_name;

-- Update statistics
ANALYZE;
```

### Alert Rules

| Metric | Warning | Critical |
|--------|---------|----------|
| Disk usage | 70% | 85% |
| Connection count | 80% | 95% |
| Query time | 5s | 30s |
| Replication lag | 1s | 5s |

---

## Performance Tuning

### Query Performance

```javascript
// Enable query monitoring
const startTime = Date.now();

const result = await db.query(sql);

const duration = Date.now() - startTime;
if (duration > 1000) {
  console.warn(`Slow query (${duration}ms):`, sql);
}
```

### Connection Pooling

```javascript
// Optimal pool settings
const pool = new Pool({
  max: 20,                          // Max connections
  min: 2,                           // Min connections
  idleTimeoutMillis: 30000,         // Idle timeout
  connectionTimeoutMillis: 2000,    // Connection timeout
  statement_timeout: 30000          // Query timeout
});
```

### Batch Operations

```javascript
// For bulk inserts (faster than individual)
const result = await db.query(
  'INSERT INTO users (email, name) VALUES ' +
  userArray.map((_, i) => `($${i*2+1}, $${i*2+2})`).join(','),
  userArray.flatMap(u => [u.email, u.name])
);
```

---

## Troubleshooting

### Common Issues

**Issue: Connection pool exhausted**
```
Error: the client is already being released back to the pool
```
Solution: Ensure all queries call `client.release()` or use `pool.query()`

**Issue: SSL certificate verification failed**
```
Error: self signed certificate
```
Solution: Add `sslmode: 'require'` to connection string

**Issue: Database connection timeout**
```
Error: connect ETIMEDOUT
```
Solution: Check firewall, verify host/port, increase timeout

---

## Checklist

### ✅ Staging Database Setup

- [ ] Create Neon project
- [ ] Create staging database instance
- [ ] Get connection string with SSL
- [ ] Enable connection pooling
- [ ] Run migrations
- [ ] Seed test data
- [ ] Create indexes
- [ ] Enable backups (daily)
- [ ] Configure logging
- [ ] Test connection from backend

### ✅ Production Database Setup

- [ ] Create production database instance
- [ ] Enable High Availability
- [ ] Create read replicas
- [ ] Configure connection strings
- [ ] Enable automated backups (hourly + daily)
- [ ] Run all migrations
- [ ] Create performance indexes
- [ ] Optimize database parameters
- [ ] Enable monitoring & alerts
- [ ] Test failover scenario

---

**Last Updated:** March 21, 2025  
**Version:** 1.0.0
