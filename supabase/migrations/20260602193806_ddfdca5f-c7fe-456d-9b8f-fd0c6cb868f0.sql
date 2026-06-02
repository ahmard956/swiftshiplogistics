
-- Create a real tracking_events table (was previously stored as JSONB on shipments)
CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  description text,
  event_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracking_events_shipment ON public.tracking_events(shipment_id, event_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracking events: admin read"   ON public.tracking_events FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Tracking events: admin insert" ON public.tracking_events FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Tracking events: admin update" ON public.tracking_events FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Tracking events: admin delete" ON public.tracking_events FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Backfill from existing JSONB tracking_events column on shipments
INSERT INTO public.tracking_events (shipment_id, status, location, description, event_at)
SELECT
  s.id,
  COALESCE(ev->>'status', s.status),
  ev->>'location',
  ev->>'description',
  COALESCE((ev->>'timestamp')::timestamptz, s.created_at)
FROM public.shipments s
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(s.tracking_events, '[]'::jsonb)) AS ev;

-- Rewrite track_shipment RPC to read from the new table, with city-only sanitization preserved
CREATE OR REPLACE FUNCTION public.track_shipment(_tracking_number text)
RETURNS TABLE(
  tracking_number text, status text, service_type text,
  from_city text, to_city text, current_location text,
  estimated_delivery timestamptz, weight numeric, tracking_events jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH base AS (
    SELECT s.* FROM public.shipments s
    WHERE s.tracking_number = upper(_tracking_number) LIMIT 1
  ),
  c AS (
    SELECT b.*,
      btrim(split_part(b.from_address, ',', greatest(1, array_length(string_to_array(b.from_address, ','), 1) - 1))) AS from_city,
      btrim(split_part(b.to_address,   ',', greatest(1, array_length(string_to_array(b.to_address,   ','), 1) - 1))) AS to_city
    FROM base b
  )
  SELECT
    c.tracking_number, c.status, c.service_type, c.from_city, c.to_city,
    CASE
      WHEN c.current_location IS NULL THEN NULL
      WHEN c.current_location = c.from_address THEN c.from_city
      WHEN c.current_location = c.to_address   THEN c.to_city
      ELSE btrim(split_part(c.current_location, ',', greatest(1, array_length(string_to_array(c.current_location, ','), 1) - 1)))
    END AS current_location,
    c.estimated_delivery, c.weight,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'status', te.status,
        'timestamp', te.event_at,
        'description', te.description,
        'location', CASE
          WHEN te.location IS NULL THEN NULL
          WHEN te.location = c.from_address THEN c.from_city
          WHEN te.location = c.to_address   THEN c.to_city
          ELSE btrim(split_part(te.location, ',', greatest(1, array_length(string_to_array(te.location, ','), 1) - 1)))
        END
      ) ORDER BY te.event_at)
      FROM public.tracking_events te WHERE te.shipment_id = c.id
    ), '[]'::jsonb) AS tracking_events
  FROM c;
$$;
