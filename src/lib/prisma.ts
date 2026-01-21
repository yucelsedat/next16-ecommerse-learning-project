import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || "file:./dev.db";
  
  // Adapter'a direkt URL verin, database instance değil
  const adapter = new PrismaBetterSqlite3({
    url: connectionString
  });
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}