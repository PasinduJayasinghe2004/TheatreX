import { defineConfig } from '@prisma/config';
import path from 'path';

console.log('Loading prisma.config.js from backend');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    url: process.env.DATABASE_URL
  }
});
