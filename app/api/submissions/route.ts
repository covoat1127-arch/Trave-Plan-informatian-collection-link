import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { submissions } from '@/db/schema';

const required = ['clientName', 'contact', 'departure', 'destination', 'startDate', 'endDate'];

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!body.consent || required.some(key => typeof body[key] !== 'string' || !String(body[key]).trim())) return NextResponse.json({ error: '请完成必填项并确认隐私声明。' }, { status: 400 });
    const id = crypto.randomUUID();
    const reference = `GZ-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${id.slice(0, 6).toUpperCase()}`;
    await getDb().insert(submissions).values({ id, createdAt: Date.now(), clientName: String(body.clientName).slice(0, 100), contact: String(body.contact).slice(0, 200), departure: String(body.departure).slice(0, 150), destination: String(body.destination).slice(0, 150), startDate: String(body.startDate).slice(0, 20), endDate: String(body.endDate).slice(0, 20), payloadJson: JSON.stringify(body), consent: true, status: 'new' });
    return NextResponse.json({ ok: true, reference });
  } catch { return NextResponse.json({ error: '提交暂未完成，请稍后重试。' }, { status: 500 }); }
}
