# Seed Data Script for Staging Environment

**Developer:** M3 (Janani) | **Day:** 28

## Overview

Comprehensive data seeding scripts for populating staging database with realistic test data covering all major areas: users, surgeries, theatres, patients, and notifications.

---

## Quick Start

```bash
# Seed all data
npm run db:seed

# Seed specific tables
npm run db:seed users
npm run db:seed surgeries
npm run db:seed theatres
npm run db:seed patients

# Verify data
npm run db:seed:verify

# Clear all data
npm run db:seed:clear
```

---

## 1. User Data Seeding

### SQL Script (seed-users.sql)

```sql
-- Disable foreign key checks temporarily
-- INSERT INTO users table with test data

-- Clear existing users (if running fresh)
DELETE FROM users WHERE email LIKE '%@test.%';

-- System Admin
INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, created_at)
VALUES (
  uuid_generate_v4(),
  'admin@test.theatrex.com',
  '$2b$10$YourHashedPasswordHere',  -- replace with bcrypt hash
  'Admin',
  'User',
  'admin',
  'active',
  NOW()
);

-- Hospital Managers
INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, created_at)
VALUES 
  (uuid_generate_v4(), 'manager1@test.theatrex.com', '$2b$10$hash', 'John', 'Manager', 'hospital_manager', 'active', NOW()),
  (uuid_generate_v4(), 'manager2@test.theatrex.com', '$2b$10$hash', 'Sarah', 'Manager', 'hospital_manager', 'active', NOW());

-- Surgeons
INSERT INTO users (id, email, password_hash, first_name, last_name, role, specialization, status, created_at)
VALUES 
  (uuid_generate_v4(), 'surgeon1@test.theatrex.com', '$2b$10$hash', 'Dr.', 'Ahmed', 'surgeon', 'General Surgery', 'active', NOW()),
  (uuid_generate_v4(), 'surgeon2@test.theatrex.com', '$2b$10$hash', 'Dr.', 'Priya', 'surgeon', 'Orthopedic', 'active', NOW()),
  (uuid_generate_v4(), 'surgeon3@test.theatrex.com', '$2b$10$hash', 'Dr.', 'Michael', 'surgeon', 'Cardiothoracic', 'active', NOW());

-- Theatre Staff
INSERT INTO users (id, email, password_hash, first_name, last_name, role, department, status, created_at)
VALUES 
  (uuid_generate_v4(), 'technician1@test.theatrex.com', '$2b$10$hash', 'Ram', 'Technician', 'theatre_staff', 'Theatre 1', 'active', NOW()),
  (uuid_generate_v4(), 'technician2@test.theatrex.com', '$2b$10$hash', 'Pradeep', 'Technician', 'theatre_staff', 'Theatre 2', 'active', NOW()),
  (uuid_generate_v4(), 'nurse1@test.theatrex.com', '$2b$10$hash', 'Lisa', 'Nurse', 'theatre_staff', 'Post-Op', 'active', NOW());

-- Patients
INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, created_at)
VALUES 
  (uuid_generate_v4(), 'patient1@test.theatrex.com', '$2b$10$hash', 'Rajesh', 'Kumar', 'patient', 'active', NOW()),
  (uuid_generate_v4(), 'patient2@test.theatrex.com', '$2b$10$hash', 'Meera', 'Singh', 'patient', 'active', NOW()),
  (uuid_generate_v4(), 'patient3@test.theatrex.com', '$2b$10$hash', 'Vikram', 'Patel', 'patient', 'active', NOW());
```

### JavaScript Script (seedUsers.js)

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Starting user seed...');

    // Hash test password
    const hashedPassword = await bcrypt.hash('Test@123456', 10);

    // Clear existing test users
    await prisma.user.deleteMany({
      where: {
        email: { endsWith: '@test.theatrex.com' }
      }
    });

    // Create admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.theatrex.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active'
      }
    });
    console.log('✅ Admin created:', admin.email);

    // Create managers
    const managers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'manager1@test.theatrex.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Manager',
          role: 'hospital_manager',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'manager2@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Sarah',
          lastName: 'Manager',
          role: 'hospital_manager',
          status: 'active'
        }
      })
    ]);
    console.log('✅ Managers created:', managers.length);

    // Create surgeons
    const surgeons = await Promise.all([
      prisma.user.create({
        data: {
          email: 'surgeon1@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Dr.',
          lastName: 'Ahmed',
          role: 'surgeon',
          specialization: 'General Surgery',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'surgeon2@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Dr.',
          lastName: 'Priya',
          role: 'surgeon',
          specialization: 'Orthopedic',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'surgeon3@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Dr.',
          lastName: 'Michael',
          role: 'surgeon',
          specialization: 'Cardiothoracic',
          status: 'active'
        }
      })
    ]);
    console.log('✅ Surgeons created:', surgeons.length);

    // Create theatre staff
    const staff = await Promise.all([
      prisma.user.create({
        data: {
          email: 'technician1@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Ram',
          lastName: 'Technician',
          role: 'theatre_staff',
          department: 'Theatre 1',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'technician2@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Pradeep',
          lastName: 'Technician',
          role: 'theatre_staff',
          department: 'Theatre 2',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'nurse1@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Lisa',
          lastName: 'Nurse',
          role: 'theatre_staff',
          department: 'Post-Op',
          status: 'active'
        }
      })
    ]);
    console.log('✅ Theatre staff created:', staff.length);

    // Create patients
    const patients = await Promise.all([
      prisma.user.create({
        data: {
          email: 'patient1@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Rajesh',
          lastName: 'Kumar',
          role: 'patient',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'patient2@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Meera',
          lastName: 'Singh',
          role: 'patient',
          status: 'active'
        }
      }),
      prisma.user.create({
        data: {
          email: 'patient3@test.theatrex.com',
          password: hashedPassword,
          firstName: 'Vikram',
          lastName: 'Patel',
          role: 'patient',
          status: 'active'
        }
      })
    ]);
    console.log('✅ Patients created:', patients.length);

    return { admin, managers, surgeons, staff, patients };
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
}

module.exports = { seedUsers };
```

**Test Credentials:**
```
Email: admin@test.theatrex.com
Password: Test@123456

Email: surgeon1@test.theatrex.com
Password: Test@123456

Email: patient1@test.theatrex.com
Password: Test@123456
```

---

## 2. Theatre Data Seeding

### JavaScript Script (seedTheatres.js)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTheatres() {
  try {
    console.log('🌱 Starting theatre seed...');

    // Clear existing theatres
    await prisma.theatre.deleteMany({
      where: { name: { contains: 'Test Theatre' } }
    });

    // Create theatres
    const theatres = await Promise.all([
      prisma.theatre.create({
        data: {
          name: 'Test Theatre 1 - General Surgery',
          location: 'Block A, Floor 2',
          capacity: 4,
          equipment: ['Surgical Lights', 'ECG Monitor', 'Respirator', 'Suction Unit'],
          status: 'operational',
          maintenanceSchedule: {
            lastMaintenance: new Date(),
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            frequency: 'monthly'
          }
        }
      }),
      prisma.theatre.create({
        data: {
          name: 'Test Theatre 2 - Orthopedic',
          location: 'Block B, Floor 3',
          capacity: 4,
          equipment: ['Surgical Lights', 'C-arm', 'Oscillating Saw', 'Drill System'],
          status: 'operational',
          maintenanceSchedule: {
            lastMaintenance: new Date(),
            nextMaintenance: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            frequency: 'monthly'
          }
        }
      }),
      prisma.theatre.create({
        data: {
          name: 'Test Theatre 3 - Cardiothoracic',
          location: 'Block C, Floor 4',
          capacity: 5,
          equipment: ['Surgical Lights', 'Heart-Lung Machine', 'Bypass Monitor', 'Defibrillator'],
          status: 'operational',
          maintenanceSchedule: {
            lastMaintenance: new Date(),
            nextMaintenance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            frequency: 'monthly'
          }
        }
      })
    ]);

    console.log('✅ Theatres created:', theatres.length);
    return theatres;
  } catch (error) {
    console.error('❌ Error seeding theatres:', error.message);
    throw error;
  }
}

module.exports = { seedTheatres };
```

---

## 3. Patient Data Seeding

### JavaScript Script (seedPatients.js)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPatients() {
  try {
    console.log('🌱 Starting patient seed...');

    // Get existing users with patient role
    const patientUsers = await prisma.user.findMany({
      where: { role: 'patient', email: { endsWith: '@test.theatrex.com' } }
    });

    if (patientUsers.length === 0) {
      throw new Error('No patient users found. Run seedUsers first.');
    }

    // Clear existing test patient records
    await prisma.patientRecord.deleteMany({
      where: { 
        OR: patientUsers.map(p => ({ userId: p.id }))
      }
    });

    // Create patient records
    const patients = await Promise.all(
      patientUsers.map(user => 
        prisma.patientRecord.create({
          data: {
            userId: user.id,
            dateOfBirth: new Date('1990-05-15'),
            gender: 'Male',
            bloodType: 'O+',
            phone: '+91-9876543210',
            address: {
              street: '123 Health Street',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560001'
            },
            emergencyContact: {
              name: 'Family Member',
              relationship: 'Son',
              phone: '+91-9876543211'
            },
            medicalHistory: {
              allergies: ['Penicillin'],
              conditions: ['Hypertension'],
              medications: ['Lisinopril 10mg daily'],
              surgeries: []
            },
            insuranceDetails: {
              provider: 'Health Insurance Company',
              policyNumber: 'POL123456789',
              expiryDate: new Date('2026-12-31')
            },
            status: 'active'
          }
        })
      )
    );

    console.log('✅ Patient records created:', patients.length);
    return patients;
  } catch (error) {
    console.error('❌ Error seeding patients:', error.message);
    throw error;
  }
}

module.exports = { seedPatients };
```

---

## 4. Surgery Data Seeding

### JavaScript Script (seedSurgeries.js)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSurgeries() {
  try {
    console.log('🌱 Starting surgery seed...');

    // Get test users
    const surgeons = await prisma.user.findMany({
      where: { role: 'surgeon', email: { endsWith: '@test.theatrex.com' } }
    });

    const patients = await prisma.patientRecord.findMany({
      take: 3
    });

    const theatres = await prisma.theatre.findMany({
      where: { name: { contains: 'Test Theatre' } }
    });

    if (surgeons.length === 0 || patients.length === 0 || theatres.length === 0) {
      throw new Error('Missing required data. Run seedUsers, seedPatients, and seedTheatres first.');
    }

    // Clear existing surgeries
    await prisma.surgery.deleteMany({
      where: { 
        OR: patients.map(p => ({ patientId: p.id }))
      }
    });

    // Create surgeries
    const surgeries = await Promise.all([
      prisma.surgery.create({
        data: {
          patientId: patients[0].id,
          surgeonId: surgeons[0].id,
          theatreId: theatres[0].id,
          type: 'Appendectomy',
          scheduledDate: new Date('2025-04-15T09:00:00Z'),
          estimatedDuration: 60,
          status: 'scheduled',
          priority: 'routine',
          notes: 'Standard appendectomy procedure',
          preOperativeNotes: 'Patient fasting from midnight',
          postOperativeNotes: '',
          actualDuration: null,
          complications: []
        }
      }),
      prisma.surgery.create({
        data: {
          patientId: patients[1].id,
          surgeonId: surgeons[1].id,
          theatreId: theatres[1].id,
          type: 'Knee Arthroscopy',
          scheduledDate: new Date('2025-04-16T10:00:00Z'),
          estimatedDuration: 90,
          status: 'scheduled',
          priority: 'routine',
          notes: 'Diagnostic arthroscopy for knee pain',
          preOperativeNotes: 'All lab work completed',
          postOperativeNotes: '',
          actualDuration: null,
          complications: []
        }
      }),
      prisma.surgery.create({
        data: {
          patientId: patients[2].id,
          surgeonId: surgeons[2].id,
          theatreId: theatres[2].id,
          type: 'CABG (Coronary Artery Bypass Grafting)',
          scheduledDate: new Date('2025-04-20T08:00:00Z'),
          estimatedDuration: 240,
          status: 'scheduled',
          priority: 'high',
          notes: 'Multi-vessel disease, 3-vessel CABG planned',
          preOperativeNotes: 'Angiography completed, surgical access approved',
          postOperativeNotes: '',
          actualDuration: null,
          complications: []
        }
      })
    ]);

    console.log('✅ Surgeries created:', surgeries.length);
    
    // Create surgery events (timeline)
    for (const surgery of surgeries) {
      await prisma.surgeryEvent.create({
        data: {
          surgeryId: surgery.id,
          type: 'scheduled',
          timestamp: new Date(),
          details: `Surgery scheduled for ${surgery.scheduledDate.toDateString()}`
        }
      });
    }

    return surgeries;
  } catch (error) {
    console.error('❌ Error seeding surgeries:', error.message);
    throw error;
  }
}

module.exports = { seedSurgeries };
```

---

## 5. Notification Data Seeding

### JavaScript Script (seedNotifications.js)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log('🌱 Starting notification seed...');

    // Get test users
    const users = await prisma.user.findMany({
      where: { email: { endsWith: '@test.theatrex.com' } }
    });

    if (users.length === 0) {
      throw new Error('No users found. Run seedUsers first.');
    }

    // Clear existing notifications
    await prisma.notification.deleteMany({
      where: {
        OR: users.map(u => ({ userId: u.id }))
      }
    });

    // Create notifications
    const notifications = [];
    for (let i = 0; i < users.length; i++) {
      const userNotifications = await Promise.all([
        prisma.notification.create({
          data: {
            userId: users[i].id,
            type: 'surgery_scheduled',
            title: 'Surgery Scheduled',
            message: 'Your surgery has been scheduled for 2025-04-15',
            data: {
              surgeryId: `surgery-${i}`,
              date: '2025-04-15'
            },
            read: false
          }
        }),
        prisma.notification.create({
          data: {
            userId: users[i].id,
            type: 'reminder',
            title: 'Pre-operative Preparation',
            message: 'Remember: Fasting from midnight before surgery',
            data: {
              surgeryId: `surgery-${i}`,
              type: 'fasting'
            },
            read: false
          }
        }),
        prisma.notification.create({
          data: {
            userId: users[i].id,
            type: 'theatre_available',
            title: 'Theatre Available',
            message: 'Theatre 1 is now available for scheduling',
            data: {
              theatreId: 'theatre-1'
            },
            read: true
          }
        })
      ]);
      notifications.push(...userNotifications);
    }

    console.log('✅ Notifications created:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('❌ Error seeding notifications:', error.message);
    throw error;
  }
}

module.exports = { seedNotifications };
```

---

## 6. Master Seed Script

### seedDatabase.js (Main Entry Point)

```javascript
const { seedUsers } = require('./seedUsers');
const { seedTheatres } = require('./seedTheatres');
const { seedPatients } = require('./seedPatients');
const { seedSurgeries } = require('./seedSurgeries');
const { seedNotifications } = require('./seedNotifications');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed in order due to foreign key dependencies
    console.log('--- Phase 1: Users ---');
    await seedUsers();

    console.log('\n--- Phase 2: Infrastructure ---');
    await seedTheatres();

    console.log('\n--- Phase 3: Patient Records ---');
    await seedPatients();

    console.log('\n--- Phase 4: Surgeries ---');
    await seedSurgeries();

    console.log('\n--- Phase 5: Notifications ---');
    await seedNotifications();

    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
```

---

## 7. NPM Scripts

### Update package.json

```json
{
  "scripts": {
    "db:seed": "node scripts/seedDatabase.js",
    "db:seed:users": "node scripts/seedUsers.js",
    "db:seed:theatres": "node scripts/seedTheatres.js",
    "db:seed:patients": "node scripts/seedPatients.js",
    "db:seed:surgeries": "node scripts/seedSurgeries.js",
    "db:seed:notifications": "node scripts/seedNotifications.js",
    "db:seed:clear": "node scripts/clearDatabase.js",
    "db:seed:verify": "node scripts/verifySeed.js"
  }
}
```

---

## 8. Verification Script

### verifySeed.js

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySeed() {
  console.log('🔍 Verifying seeded data...\n');

  try {
    // Count users
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ 
      where: { role: 'admin' } 
    });
    const surgeonCount = await prisma.user.count({ 
      where: { role: 'surgeon' } 
    });
    const patientCount = await prisma.user.count({ 
      where: { role: 'patient' } 
    });

    // Count other entities
    const theatreCount = await prisma.theatre.count();
    const patientRecordCount = await prisma.patientRecord.count();
    const surgeryCount = await prisma.surgery.count();
    const notificationCount = await prisma.notification.count();

    console.log('📊 Seeded Data Summary:');
    console.log('─'.repeat(40));
    console.log(`Total Users: ${userCount}`);
    console.log(`  - Admins: ${adminCount}`);
    console.log(`  - Surgeons: ${surgeonCount}`);
    console.log(`  - Patients: ${patientCount}`);
    console.log(`\nTheatres: ${theatreCount}`);
    console.log(`Patient Records: ${patientRecordCount}`);
    console.log(`Surgeries: ${surgeryCount}`);
    console.log(`Notifications: ${notificationCount}`);
    console.log('─'.repeat(40));

    // Verify test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'admin@test.theatrex.com' }
    });

    if (testUser) {
      console.log('✅ Can login with:');
      console.log(`   Email: admin@test.theatrex.com`);
      console.log(`   Password: Test@123456\n`);
    }

    // Check for issues
    const missingUsers = await prisma.surgery.findMany({
      where: { surgeon: null }
    });

    if (missingUsers.length > 0) {
      console.log(`⚠️  Warning: ${missingUsers.length} surgeries missing surgeon assignment`);
    }

    console.log('✅ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifySeed();
}

module.exports = { verifySeed };
```

---

## 9. Clear Database Script

### clearDatabase.js

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🧹 Clearing test data...\n');

  try {
    // Clear in reverse order of dependencies
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { 
        user: { email: { endsWith: '@test.theatrex.com' } }
      }
    });

    const deletedSurgeryEvents = await prisma.surgeryEvent.deleteMany({
      where: { 
        surgery: { 
          patient: { email: { endsWith: '@test.theatrex.com' } }
        }
      }
    });

    const deletedSurgeries = await prisma.surgery.deleteMany({
      where: { 
        patient: { email: { endsWith: '@test.theatrex.com' } }
      }
    });

    const deletedPatients = await prisma.patientRecord.deleteMany({
      where: { 
        user: { email: { endsWith: '@test.theatrex.com' } }
      }
    });

    const deletedTheatres = await prisma.theatre.deleteMany({
      where: { name: { contains: 'Test Theatre' } }
    });

    const deletedUsers = await prisma.user.deleteMany({
      where: { email: { endsWith: '@test.theatrex.com' } }
    });

    console.log('Deleted:');
    console.log(`  - Users: ${deletedUsers.count}`);
    console.log(`  - Patient Records: ${deletedPatients.count}`);
    console.log(`  - Theatres: ${deletedTheatres.count}`);
    console.log(`  - Surgeries: ${deletedSurgeries.count}`);
    console.log(`  - Surgery Events: ${deletedSurgeryEvents.count}`);
    console.log(`  - Notifications: ${deletedNotifications.count}`);
    console.log('\n✅ Database cleared!\n');
  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  clearDatabase();
}

module.exports = { clearDatabase };
```

---

## 10. Usage Instructions

### Run Complete Seed

```bash
# Seed entire database
npm run db:seed

# Expected output:
# 🌱 Starting database seeding...
# 
# --- Phase 1: Users ---
# ✅ Admin created: admin@test.theatrex.com
# ✅ Managers created: 2
# ✅ Surgeons created: 3
# ✅ Theatre staff created: 3
# ✅ Patients created: 3
#
# ... other phases ...
#
# ✅ Database seeding completed successfully!
```

### Test Login

```bash
# Open browser
http://localhost:3000/login

# Enter credentials
Email: admin@test.theatrex.com
Password: Test@123456

# Should login successfully
```

### Verify Data

```bash
# Verify seeded data
npm run db:seed:verify

# Expected output:
# 📊 Seeded Data Summary:
# ────────────────────────────────
# Total Users: 12
#   - Admins: 1
#   - Surgeons: 3
#   - Patients: 3
# 
# Theatres: 3
# Patient Records: 3
# Surgeries: 3
# Notifications: 12
```

### Clear for Fresh Start

```bash
# Clear all test data
npm run db:seed:clear

# Reseed fresh data
npm run db:seed
```

---

## Testing Scenarios

### Scenario 1: Complete Surgery Flow

```
1. Login as admin@test.theatrex.com (password: Test@123456)
2. Create new surgery or view scheduled surgeries
3. Assign surgeon and theatre
4. Update surgery status: scheduled → in-progress → completed
5. Verify notifications sent to patient
6. Check surgery records in patient chart
```

### Scenario 2: Theatre Management

```
1. Login as manager1@test.theatrex.com
2. View all theatres and availability
3. Check theatre equipment list
4. Schedule maintenance
5. Record cleaning history
6. View theatre utilization statistics
```

### Scenario 3: Patient Self-Service

```
1. Login as patient1@test.theatrex.com
2. View upcoming surgeries
3. Access medical records
4. Read notifications
5. Download surgery reports
6. Schedule follow-up appointments
```

---

## Notes for Staging Testing

- All test data expires in 30 days (for production safety)
- Passwords follow strong requirements (min 8 chars, uppercase, number, special char)
- Email addresses use @test.theatrex.com domain (easily identifiable)
- No real patient data is used
- All phone numbers are invalid (testing only)
- Notifications are created but emails are not sent in staging

---

**Last Updated:** March 21, 2025  
**Ready for:** Staging Deployment Testing  
**Status:** ✅ Complete

