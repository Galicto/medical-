import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Absolute path to the DB file — prevents cwd-relative path issues with ts-node
const DB_PATH = path.resolve(__dirname, '..', '..', 'prisma', 'dev.db');
let dbUrl = `file:${DB_PATH}`;

if (process.env.VERCEL) {
    // Vercel has read-only filesystem. Copy SQLite to /tmp so write operations don't 500 crash
    const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');
    const targetPath = '/tmp/dev.db';
    try {
        if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
        }
        dbUrl = 'file:/tmp/dev.db';
    } catch(e) { console.error('Vercel SQLite hack failed', e); }
}

const prisma = new PrismaClient({ 
    datasources: { db: { url: dbUrl } },
    log: ['query', 'error'] 
});

export default prisma;
