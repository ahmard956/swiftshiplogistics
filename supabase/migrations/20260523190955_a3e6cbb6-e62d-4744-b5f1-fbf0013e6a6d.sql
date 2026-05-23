
-- Remove public read access to shipments
DROP POLICY IF EXISTS "Shipments: public tracking lookup" ON public.shipments;

CREATE POLICY "Shipments: admin read"
ON public.shipments FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Safe public lookup by tracking number, excludes PII
CREATE OR REPLACE FUNCTION public.track_shipment(_tracking_number text)
RETURNS TABLE (
  tracking_number text,
  status text,
  service_type text,
  from_city text,
  to_city text,
  current_location text,
  estimated_delivery timestamptz,
  weight numeric,
  tracking_events jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.tracking_number,
    s.status,
    s.service_type,
    -- Return only the city portion (last comma-separated chunk) to avoid leaking full street addresses
    split_part(s.from_address, ',', greatest(1, array_length(string_to_array(s.from_address, ','), 1) - 1)),
    split_part(s.to_address, ',', greatest(1, array_length(string_to_array(s.to_address, ','), 1) - 1)),
    s.current_location,
    s.estimated_delivery,
    s.weight,
    s.tracking_events
  FROM public.shipments s
  WHERE s.tracking_number = upper(_tracking_number)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.track_shipment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_shipment(text) TO anon, authenticated;
