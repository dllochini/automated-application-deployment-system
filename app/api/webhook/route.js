import { NextResponse } from 'next/server';
import { db, projects } from '@/lib/db';
import { triggerJenkins } from '@/lib/jenkins';

export async function POST(req) {
  try {
    const event = req.headers.get('x-github-event');
    const payload = await req.json();

    if (event !== 'push') return NextResponse.json({ ok: true });

    const repoUrl = payload?.repository?.clone_url || payload?.repository?.html_url;
    if (!repoUrl) return NextResponse.json({ ok: false, error: 'no repo in payload' }, { status: 400 });

    // find matching project(s)
    const found = await db.select().from(projects).where(projects.repo_url.eq(repoUrl)).execute();
    if (!found || found.length === 0) {
      console.log('No project found for', repoUrl);
      return NextResponse.json({ ok: true });
    }

    // trigger redeploy for each
    for (const p of found) {
      triggerJenkins(p.repo_url, p.port, p.id).catch((e) => console.error('jenkins trigger failed', e));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}