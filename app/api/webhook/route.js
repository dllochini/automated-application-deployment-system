import { NextResponse } from 'next/server';
import { db, projects } from '@/lib/db';
import { triggerJenkins } from '@/lib/jenkins';
import crypto from 'crypto';

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * Verify GitHub webhook signature
 */
function verifySignature(reqBody, signature) {
  if (!GITHUB_WEBHOOK_SECRET || !signature) return false;

  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  hmac.update(reqBody);
  const digest = `sha256=${hmac.digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req) {
  try {
    const signature = req.headers.get('x-hub-signature-256') || '';
    const rawBody = await req.text();

    if (!verifySignature(rawBody, signature)) {
      console.warn('Webhook signature mismatch');
      return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
    }

    const event = req.headers.get('x-github-event');
    if (event !== 'push') {
      return NextResponse.json({ ok: true }); // ignore other events
    }

    const payload = JSON.parse(rawBody);
    const repoUrl = payload?.repository?.clone_url || payload?.repository?.html_url;
    const branch = payload?.ref?.split('/').pop(); // e.g., "refs/heads/main" → "main"

    if (!repoUrl) {
      return NextResponse.json({ ok: false, error: 'No repo URL in payload' }, { status: 400 });
    }

    // Only deploy for main branch (customize as needed)
    if (branch !== 'main') {
      console.log(`Push to branch ${branch} ignored`);
      return NextResponse.json({ ok: true });
    }

    // Find matching project(s) in database
    const found = await db.select().from(projects).where(projects.repo_url.eq(repoUrl)).execute();
    if (!found || found.length === 0) {
      console.log('No project found for', repoUrl);
      return NextResponse.json({ ok: true });
    }

    // Trigger Jenkins redeploy for each project
    for (const p of found) {
      triggerJenkins(
        p.repo_url,
        p.port,
        p.id,
        p.env,         // multi-line .env content
        p.framework    // react, express, fastapi, springboot
      ).then(() => {
        console.log(`Jenkins triggered for project ${p.id} (${p.framework})`);
      }).catch((err) => {
        console.error(`Failed to trigger Jenkins for project ${p.id}:`, err.message);
      });
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}