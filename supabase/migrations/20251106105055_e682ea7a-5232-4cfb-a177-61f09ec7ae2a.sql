-- Update the handle_new_user function to automatically assign faculty role to HOD emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if email contains 'hod' or matches specific pattern
  IF NEW.email LIKE '%hod%@vvce%' OR NEW.email = 'hodaiml@vvce' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'faculty');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$$;