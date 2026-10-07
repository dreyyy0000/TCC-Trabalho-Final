ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, cpf, phone, birth_date)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'name',''),
          COALESCE(NEW.email,''),
          NEW.raw_user_meta_data->>'cpf',
          NEW.raw_user_meta_data->>'phone',
          NULLIF(NEW.raw_user_meta_data->>'birth_date','')::date)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN lower(COALESCE(NEW.email,'')) = 'andreyyllucas@gmail.com' THEN 'admin'::app_role ELSE 'user'::app_role END)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $function$;