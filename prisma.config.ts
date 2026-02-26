import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    // בשימוש ב-Prisma 7, אנחנו מכוונים ל-DIRECT_URL עבור פעולות Migrate
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
