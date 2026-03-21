# Database Migration Scripts & Documentation

**Developer:** M4 (Oneli) | **Day:** 28

## Overview

This document covers database migration management, scripts, and procedures for deploying schema changes across environments.

## Migration Strategy

```
Development
├── Manual migrations (no tracking needed)
└── Raw SQL execution

Staging & Production
├── Tracked migrations (version control)
├── Rollback capability
└── Zero-downtime deployments
```

---

## Migration System Setup

### Install Migrations Library

```bash
cd backend
npm install db-migrate db-migrate-pg --save
```

### Create Migrations Folder Structure

```
backend/
├── migrations/
│   ├── 1-init-schema.sql
│   ├── 2-add-user-roles.sql
│   ├── 3-add-surgery-constraints.sql
│   ├── 4-add-audit-logging.sql
│   ├── 5-add-indexes.sql
│   ├── 6-add-notifications-table.sql
│   ├── 7-add-theatre-equipment.sql
│   ├── 8-add-staff-qualifications.sql
│   └── migration-log.sql
└── scripts/
    ├── run-migrations.js
    ├── rollback-migrations.js
    └── verify-migrations.js
```

---

## Migration Files

### Migration 1: Initial Schema

**File:** `migrations/1-init-schema.sql`

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Create surgeries table
CREATE TABLE IF NOT EXISTS surgeries (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  surgeon_id INTEGER NOT NULL,
  theatre_id INTEGER,
  surgery_type VARCHAR(100) NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  estimated_duration INTEGER,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_surgeries_scheduled_date ON surgeries(scheduled_date);
CREATE INDEX idx_surgeries_status ON surgeries(status);
CREATE INDEX idx_surgeries_patient_id ON surgeries(patient_id);

-- Create theatres table
CREATE TABLE IF NOT EXISTS theatres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(100),
  capacity INTEGER,
  status VARCHAR(50) DEFAULT 'available',
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  blood_type VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create migration tracker
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_ms INTEGER,
  status VARCHAR(50),
  error_message TEXT
);
```

### Migration 2: Add User Roles

**File:** `migrations/2-add-user-roles.sql`

```sql
-- Create roles table for RBAC
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Administrator with full access', '["*:*"]'::jsonb),
  ('surgeon', 'Surgeon role', '["surgery:read","surgery:write","patient:read"]'::jsonb),
  ('nurse', 'Nurse role', '["surgery:read","patient:read","notification:read"]'::jsonb),
  ('technician', 'Technician role', '["theatre:read","equipment:read"]'::jsonb),
  ('patient', 'Patient role', '["patient:read","notification:read"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Add role_id to users
ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id);

-- Update existing records
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'user' LIMIT 1)
WHERE role_id IS NULL;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

### Migration 3: Add Surgery Constraints

**File:** `migrations/3-add-surgery-constraints.sql`

```sql
-- Add foreign key constraints if not exists
ALTER TABLE surgeries
ADD CONSTRAINT fk_surgeries_patient_id 
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

ALTER TABLE surgeries
ADD CONSTRAINT fk_surgeries_surgeon_id
FOREIGN KEY (surgeon_id) REFERENCES users(id);

ALTER TABLE surgeries
ADD CONSTRAINT fk_surgeries_theatre_id
FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE SET NULL;

-- Create surgery_events table for calendar
CREATE TABLE IF NOT EXISTS surgery_events (
  id SERIAL PRIMARY KEY,
  surgery_id INTEGER UNIQUE REFERENCES surgeries(id) ON DELETE CASCADE,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_surgery_events_date ON surgery_events(event_date);
```

### Migration 4: Add Audit Logging

**File:** `migrations/4-add-audit-logging.sql`

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    action, entity_type, entity_id, old_values, new_values
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable audit logging on surgeries
CREATE TRIGGER surgeries_audit_trigger
AFTER INSERT OR UPDATE ON surgeries
FOR EACH ROW EXECUTE FUNCTION log_audit();
```

### Migration 5: Add Performance Indexes

**File:** `migrations/5-add-indexes.sql`

```sql
-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_surgeries_surgeon_status 
ON surgeries(surgeon_id, status);

CREATE INDEX IF NOT EXISTS idx_surgeries_theatre_date
ON surgeries(theatre_id, scheduled_date) 
WHERE status NOT IN ('cancelled', 'completed');

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_role_status
ON users(role, status);

-- Create indexes for search
CREATE INDEX IF NOT EXISTS idx_patients_name_gin
ON patients USING GIN(to_tsvector('english', first_name || ' ' || last_name));

-- Analyze indexes
ANALYZE;
```

---

## Migration Scripts

### Run Migrations Script

**File:** `scripts/run-migrations.js`

```javascript
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('🔄 Running migrations...');
  
  for (const file of migrationFiles) {
    const migrationName = file.replace('.sql', '');
    
    try {
      // Check if already run
      const exists = await pool.query(
        'SELECT * FROM migration_log WHERE migration_name = $1',
        [migrationName]
      );

      if (exists.rows.length > 0) {
        console.log(`⏭️  Skipping ${migrationName} (already run)`);
        continue;
      }

      // Read and run migration
      const sql = fs.readFileSync(
        path.join(migrationsDir, file),
        'utf8'
      );

      const startTime = Date.now();
      await pool.query(sql);
      const duration = Date.now() - startTime;

      // Log migration
      await pool.query(
        'INSERT INTO migration_log (migration_name, duration_ms, status) VALUES ($1, $2, $3)',
        [migrationName, duration, 'success']
      );

      console.log(`✅ ${migrationName} (${duration}ms)`);
    } catch (error) {
      console.error(`❌ ${migrationName}:`, error.message);
      
      // Log error
      await pool.query(
        'INSERT INTO migration_log (migration_name, status, error_message) VALUES ($1, $2, $3)',
        [migrationName, 'failed', error.message]
      );

      throw error;
    }
  }

  console.log('✨ All migrations completed!');
  process.exit(0);
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
```

### Verify Migrations Script

**File:** `scripts/verify-migrations.js`

```javascript
const { pool } = require('../config/database');

async function verifyMigrations() {
  console.log('🔍 Verifying migrations...\n');

  try {
    // Check tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 Tables:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    // Check migration log
    const migrations = await pool.query(
      'SELECT * FROM migration_log ORDER BY executed_at'
    );

    console.log('\n📝 Migration History:');
    migrations.rows.forEach(row => {
      const status = row.status === 'success' ? '✅' : '❌';
      console.log(`   ${status} ${row.migration_name} (${row.duration_ms}ms)`);
    });

    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname
    `);

    console.log(`\n🔑 Indexes (${indexes.rows.length}):`);
    indexes.rows.slice(0, 10).forEach(row => {
      console.log(`   - ${row.indexname}`);
    });

    if (indexes.rows.length > 10) {
      console.log(`   ... and ${indexes.rows.length - 10} more`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyMigrations();
```

---

## Package.json Commands

Add to `package.json`:

```json
{
  "scripts": {
    "migrate": "node scripts/run-migrations.js",
    "migrate:verify": "node scripts/verify-migrations.js",
    "migrate:rollback": "node scripts/rollback-migrations.js",
    "db:seed": "node scripts/seed-data.js",
    "db:reset": "npm run migrate:rollback && npm run migrate && npm run db:seed"
  }
}
```

---

## Running Migrations

### Local Development

```bash
# Run all migrations
npm run migrate

# Verify migrations
npm run migrate:verify

# Seed test data
npm run db:seed
```

### Staging Deployment

```bash
# 1. Test migrations locally
npm run migrate:verify

# 2. Deploy backend code
git push origin main

# 3. SSH to staging server
ssh staging.theatrex.app

# 4. Pull latest code
git pull origin main

# 5. Run migrations
npm run migrate

# 6. Verify
npm run migrate:verify
```

### Production Deployment

```bash
# 1. Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migrations on staging
# ... (same as staging)

# 3. Schedule maintenance window
# ... announce 30 minute maintenance

# 4. SSH to production
ssh prod.theatrex.app

# 5. Stop application gracefully
pm2 stop all

# 6. Run migrations
npm run migrate

# 7. Verify migrations
npm run migrate:verify

# 8. Restart application
pm2 restart all

# 9. Monitor logs
pm2 logs

# 10. Announce maintenance complete
```

---

## Rollback Strategy

### Rollback Script

**File:** `scripts/rollback-migrations.js`

```javascript
const { pool } = require('../config/database');

async function rollbackMigrations() {
  console.log('⚠️  ROLLBACK IN PROGRESS');
  console.log('Clearing all tables...\n');

  try {
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name DESC
    `);

    // Drop tables in reverse order
    for (const { table_name } of tables.rows) {
      if (table_name === 'migration_log') continue;
      
      await pool.query(`DROP TABLE IF EXISTS ${table_name} CASCADE`);
      console.log(`✅ Dropped ${table_name}`);
    }

    // Clear migration log
    await pool.query('TRUNCATE migration_log');

    console.log('\n✨ Rollback complete!');
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

rollbackMigrations();
```

---

## Best Practices

### ✅ DO

- Always test migrations locally first
- Keep migrations small and focused
- Include rollback capability
- Use transactions
- Add indexes after large inserts
- Backup before production migrations
- Use zero-downtime techniques
- Document any manual steps

### ❌ DON'T

- Mix multiple unrelated changes
- Use raw data types (use constraints)
- Forget to test rollback
- Run migrations without backup
- Deploy without staging test
- Lock tables during business hours
- Make breaking schema changes

---

## Checklist

✅ Migrations for Day 28:

- [ ] Migration 1: Initial schema
- [ ] Migration 2: User roles  
- [ ] Migration 3: Surgery constraints
- [ ] Migration 4: Audit logging
- [ ] Migration 5: Performance indexes
- [ ] Migration scripts created
- [ ] Verification script created
- [ ] Test entire migration flow locally
- [ ] Test rollback capability
- [ ] Document all migrations
- [ ] Test on staging database
- [ ] Run on production database (with backup)

---

**Last Updated:** March 21, 2025  
**Version:** 1.0.0
