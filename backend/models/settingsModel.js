import { pool } from '../config/database.js';

const createUserSettingsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
            preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
            appearance JSONB NOT NULL DEFAULT '{}'::jsonb,
            privacy JSONB NOT NULL DEFAULT '{}'::jsonb,
            security JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `);

    await pool.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
                CREATE TRIGGER update_user_settings_updated_at
                    BEFORE UPDATE ON user_settings
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            END IF;
        END
        $$;
    `);
};

const createUserSettingsAuditTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_settings_audit (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            changed_by INTEGER REFERENCES users(id),
            previous_settings JSONB,
            new_settings JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_user_settings_audit_user_id ON user_settings_audit(user_id);
    `);
};

const createAuthSessionsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS auth_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token VARCHAR(512) NOT NULL,
            user_agent TEXT,
            ip_address VARCHAR(64),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
    `);
};

const initializeSettingsTables = async () => {
    await createUserSettingsTable();
    await createUserSettingsAuditTable();
    await createAuthSessionsTable();
};

export {
    createUserSettingsTable,
    createUserSettingsAuditTable,
    createAuthSessionsTable,
    initializeSettingsTables,
};
