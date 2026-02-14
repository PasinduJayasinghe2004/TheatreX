import { defineConfig } from '@prisma/config';

console.log('Loading prisma.config.js from backend');

export default defineConfig({
  schema: 'prisma/schema.prisma'
});
