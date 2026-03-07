import { db, ports } from './db';
import { eq } from 'drizzle-orm';

export async function allocatePort() {
  // Try to find a free port from ports table
  const row = await db.select().from(ports).where(eq(ports.is_used, false)).limit(1).execute();
  if (!row || row.length === 0) {
    throw new Error('No free ports available');
  }
  const portNumber = row[0].port_number;

  await db.update(ports).set({ is_used: true }).where(eq(ports.port_number, portNumber)).execute();
  return portNumber;
}

export async function releasePort(portNumber) {
  await db.update(ports).set({ is_used: false }).where(eq(ports.port_number, portNumber)).execute();
}