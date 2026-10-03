import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, daysBetween, grade, makeQuiz, nextOpenDay, nextStreak, todayIso } from "./learning";
import { WORDS } from "./words";

test("la liste contient 400 mots, 4 par jour sur 100 jours", () => {
  assert.equal(WORDS.length, 400);
  for (let d = 1; d <= 100; d++) assert.equal(WORDS.filter((w) => w.day === d).length, 4);
  assert.equal(new Set(WORDS.map((w) => w.word)).size, 400);
});

test("chaque mot a une traduction et une phrase d'exemple traduite", () => {
  for (const w of WORDS) {
    assert.ok(w.fr && w.example && w.exampleFr, `mot ${w.n} incomplet`);
  }
});

test("dates", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(daysBetween("2026-03-28", "2026-03-30"), 2);
  assert.equal(todayIso(new Date("2026-06-30T22:30:00Z")), "2026-07-01");
});

test("répétition espacée", () => {
  assert.deepEqual(grade(0, true, "2026-10-03"), { box: 1, due: "2026-10-06" });
  assert.deepEqual(grade(5, true, "2026-10-03"), { box: 5, due: "2026-12-02" });
  assert.deepEqual(grade(4, false, "2026-10-03"), { box: 0, due: "2026-10-04" });
});

test("série de jours", () => {
  assert.deepEqual(nextStreak(3, "2026-10-02", "2026-10-03"), { streak: 4, streakDate: "2026-10-03" });
  assert.deepEqual(nextStreak(3, "2026-10-03", "2026-10-03"), { streak: 3, streakDate: "2026-10-03" });
  assert.deepEqual(nextStreak(9, "2026-09-20", "2026-10-03"), { streak: 1, streakDate: "2026-10-03" });
});

test("un jour manqué ne fait rien accumuler : on reprend au premier jour ouvert", () => {
  assert.equal(nextOpenDay(5, new Set([1, 2, 3, 4, 5, 6])), 7);
  assert.equal(nextOpenDay(100, new Set([100])), 101);
});

test("quiz : 4 propositions distinctes dont la bonne", () => {
  for (const q of makeQuiz(WORDS.slice(0, 40), 8)) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map((o) => o.fr)).size, 4);
    assert.ok(q.options.includes(q.word));
  }
});
