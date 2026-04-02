"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
if (process.env.VERCEL) {
    // Vercel has read-only filesystem. Copy SQLite to /tmp so write operations don't 500 crash
    const sourcePath = path_1.default.join(process.cwd(), 'prisma', 'dev.db');
    const targetPath = '/tmp/dev.db';
    try {
        if (!fs_1.default.existsSync(targetPath) && fs_1.default.existsSync(sourcePath)) {
            fs_1.default.copyFileSync(sourcePath, targetPath);
        }
        dbUrl = 'file:/tmp/dev.db';
    }
    catch (e) {
        console.error('Vercel SQLite hack failed', e);
    }
}
const prisma = new client_1.PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: ['query', 'error']
});
exports.default = prisma;
