DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "XP is publicly viewable" ON public.xp_points;

CREATE POLICY "Profiles viewable by signed-in users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "XP viewable by signed-in users"
ON public.xp_points FOR SELECT TO authenticated USING (true);

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.xp_points FROM anon;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.xp_points TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.xp_points TO service_role;