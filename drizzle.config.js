/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:abqXi3smYv7k@ep-ancient-queen-a1g4w30l.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    }
  };
  