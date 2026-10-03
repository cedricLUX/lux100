-- Lëtzebuergesch en 100 jours : schéma initial
-- À exécuter dans Supabase > SQL Editor (ou `supabase db push`).

-- Profil et état global de chaque apprenant
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  current_day int not null default 1 check (current_day between 1 and 101),
  streak int not null default 0,
  streak_date date,
  last_visit date,
  prev_visit date,
  game_best int not null default 0,
  reminder_email boolean not null default true,
  created_at timestamptz not null default now()
);

-- Jours terminés (appris, ou validés par le test de niveau)
create table public.day_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day int not null check (day between 1 and 100),
  completed_on date not null,
  via_test boolean not null default false,
  primary key (user_id, day)
);

-- Répétition espacée : une ligne par mot appris
create table public.word_reviews (
  user_id uuid not null references public.profiles (id) on delete cascade,
  word_n int not null check (word_n between 1 and 400),
  box int not null default 0 check (box between 0 and 5),
  due date not null,
  primary key (user_id, word_n)
);
create index word_reviews_due on public.word_reviews (user_id, due);

-- Bilans hebdomadaires (meilleur score sur 10)
create table public.weekly_results (
  user_id uuid not null references public.profiles (id) on delete cascade,
  week int not null check (week between 1 and 14),
  best_score int not null check (best_score between 0 and 10),
  primary key (user_id, week)
);

-- Signalements d'erreur sur un mot (lus par l'administrateur dans Supabase)
create table public.error_reports (
  id bigint generated always as identity primary key,
  word_n int not null check (word_n between 1 and 400),
  user_id uuid default auth.uid() references public.profiles (id) on delete set null,
  kind text not null check (kind in ('orthographe', 'traduction', 'audio', 'exemple', 'image', 'autre')),
  message text check (char_length(message) <= 1000),
  status text not null default 'nouveau' check (status in ('nouveau', 'corrigé', 'rejeté')),
  created_at timestamptz not null default now()
);

-- Rappels envoyés (évite d'envoyer deux e-mails le même jour)
create table public.reminder_log (
  user_id uuid not null references public.profiles (id) on delete cascade,
  sent_on date not null,
  primary key (user_id, sent_on)
);

-- Création automatique du profil à l'inscription
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sécurité : chaque apprenant ne voit et ne modifie que ses propres données
alter table public.profiles enable row level security;
alter table public.day_progress enable row level security;
alter table public.word_reviews enable row level security;
alter table public.weekly_results enable row level security;
alter table public.error_reports enable row level security;
alter table public.reminder_log enable row level security;

create policy "profil : lecture" on public.profiles for select using (id = auth.uid());
create policy "profil : mise à jour" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "jours : tout" on public.day_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "révisions : tout" on public.word_reviews for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bilans : tout" on public.weekly_results for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Les apprenants peuvent signaler, pas relire les signalements
create policy "signalement : création" on public.error_reports for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- reminder_log : aucune politique, seul le serveur (clé service) y accède

-- L'e-mail du profil est recopié depuis auth.users ; l'apprenant ne peut pas le modifier
revoke update on public.profiles from authenticated, anon;
grant update (current_day, streak, streak_date, last_visit, prev_visit, game_best, reminder_email)
  on public.profiles to authenticated;
