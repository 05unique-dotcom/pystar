-- xp_points: read-only for users, writes only via service role
DROP POLICY IF EXISTS "Users can insert own xp" ON public.xp_points;
DROP POLICY IF EXISTS "Users can update own xp" ON public.xp_points;
REVOKE INSERT, UPDATE, DELETE ON public.xp_points FROM authenticated;
GRANT ALL ON public.xp_points TO service_role;

-- progress: read-only for users, writes only via service role
DROP POLICY IF EXISTS "Users manage own progress" ON public.progress;
CREATE POLICY "Users can view own progress"
  ON public.progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.progress FROM authenticated;
GRANT SELECT ON public.progress TO authenticated;
GRANT ALL ON public.progress TO service_role;

-- user_badges: read-only for users, writes only via service role
DROP POLICY IF EXISTS "Users manage own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.user_badges FROM authenticated;
GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;

-- profiles: users may edit display_name/avatar only; streak & last_active are server-controlled
CREATE OR REPLACE FUNCTION public.protect_profile_server_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF current_user <> 'service_role' AND current_user <> 'postgres' THEN
    NEW.streak := OLD.streak;
    NEW.last_active := OLD.last_active;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_server_fields ON public.profiles;
CREATE TRIGGER protect_profile_server_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_server_fields();