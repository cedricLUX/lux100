-- Corrections signalées par les conseillers Supabase (sécurité et performance)

-- La fonction du déclencheur ne doit pas être appelable depuis l'API
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- auth.uid() évalué une seule fois par requête au lieu d'une fois par ligne
alter policy "profil : lecture" on public.profiles using (id = (select auth.uid()));
alter policy "profil : mise à jour" on public.profiles using (id = (select auth.uid())) with check (id = (select auth.uid()));
alter policy "jours : tout" on public.day_progress using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "révisions : tout" on public.word_reviews using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "bilans : tout" on public.weekly_results using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "signalement : création" on public.error_reports with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create index error_reports_user_id on public.error_reports (user_id);
