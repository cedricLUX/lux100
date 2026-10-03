import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayIso } from "@/lib/learning";
import { wordsOfDay } from "@/lib/words";
import { reminderEmail } from "@/lib/reminder-email";

// Appelée une fois par jour par Vercel Cron (voir vercel.json).
// Envoie un rappel aux apprenants qui n'ont rien appris aujourd'hui.
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }
  const db = createAdminClient();
  const today = todayIso();

  const [profiles, doneToday, sentToday, due] = await Promise.all([
    db.from("profiles").select("id, email, current_day").eq("reminder_email", true),
    db.from("day_progress").select("user_id").eq("completed_on", today).eq("via_test", false),
    db.from("reminder_log").select("user_id").eq("sent_on", today),
    db.from("word_reviews").select("user_id").lte("due", today),
  ]);
  const failed = [profiles, doneToday, sentToday, due].find((r) => r.error);
  if (failed) return NextResponse.json({ error: failed.error!.message }, { status: 500 });

  const skip = new Set([...doneToday.data!, ...sentToday.data!].map((r) => r.user_id));
  const dueCount = new Map<string, number>();
  for (const r of due.data!) dueCount.set(r.user_id, (dueCount.get(r.user_id) ?? 0) + 1);

  let sent = 0;
  const errors: string[] = [];
  for (const p of profiles.data!) {
    if (!p.email || skip.has(p.id)) continue;
    const reviews = dueCount.get(p.id) ?? 0;
    if (p.current_day > 100 && reviews === 0) continue;

    const mail = reminderEmail({
      appUrl: process.env.APP_URL ?? request.nextUrl.origin,
      day: p.current_day,
      words: p.current_day <= 100 ? wordsOfDay(p.current_day).map((w) => w.word) : [],
      reviews,
    });
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: p.email, ...mail }),
    });
    if (!res.ok) {
      errors.push(`${p.id}: ${res.status}`);
      continue;
    }
    await db.from("reminder_log").insert({ user_id: p.id, sent_on: today });
    sent++;
  }
  return NextResponse.json({ date: today, sent, errors });
}
