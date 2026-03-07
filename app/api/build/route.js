import { NextResponse } from 'next/server';
import { db, projects } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, status, containerId } = body;
    if (!projectId) return NextResponse.json({ ok: false, error: 'projectId required' }, { status: 400 });

    await db.update(projects).set({ status, container_id: containerId }).where(projects.id.eq(Number(projectId))).execute();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}