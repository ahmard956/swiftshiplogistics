-- Explicit INSERT restriction: only admins may insert rows into user_roles.
-- Without this, a permissive ALL policy can be ambiguous; we add a dedicated
-- INSERT policy that requires the caller to already be an admin.
DROP POLICY IF EXISTS "Roles: admin insert" ON public.user_roles;
CREATE POLICY "Roles: admin insert"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Also add a restrictive policy that denies any non-admin insert regardless
-- of other permissive policies. Restrictive policies are AND-ed together.
DROP POLICY IF EXISTS "Roles: deny non-admin insert" ON public.user_roles;
CREATE POLICY "Roles: deny non-admin insert"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));