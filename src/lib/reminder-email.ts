// Contenu de l'e-mail de rappel quotidien (texte et HTML).
export function reminderEmail({
  appUrl,
  day,
  words,
  reviews,
}: {
  appUrl: string;
  day: number;
  words: string[];
  reviews: number;
}) {
  const lines: string[] = [];
  if (words.length) lines.push(`Vos 4 mots du jour ${day} vous attendent : ${words.join(", ")}.`);
  if (reviews) lines.push(`${reviews} mot${reviews > 1 ? "s" : ""} à réviser aujourd'hui.`);
  const subject = words.length ? `Moien ! Vos 4 mots du jour ${day}` : `Moien ! ${reviews} mots à réviser`;
  const text = `Moien !\n\n${lines.join("\n")}\n\nC'est l'affaire de 5 minutes : ${appUrl}/app\n\nPour ne plus recevoir ce rappel : ${appUrl}/app/compte`;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#13202A;max-width:520px">
<p><b>Moien !</b></p>
${lines.map((l) => `<p>${esc(l)}</p>`).join("\n")}
<p><a href="${appUrl}/app" style="display:inline-block;background:#0076A8;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Apprendre maintenant</a></p>
<p style="font-size:13px;color:#566673">C'est l'affaire de 5 minutes. Pour ne plus recevoir ce rappel, décochez-le dans <a href="${appUrl}/app/compte">votre compte</a>.</p>
</div>`;
  return { subject, text, html };
}
