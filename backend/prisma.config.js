import { defineConfig } from '@prisma/config';
import 'dotenv/config';

console.log('Loading prisma.config.js from backend');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL
  }
});
