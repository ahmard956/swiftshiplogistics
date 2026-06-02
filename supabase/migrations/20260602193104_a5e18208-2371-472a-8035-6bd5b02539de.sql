CREATE OR REPLACE FUNCTION public.track_shipment(_tracking_number text)
 RETURNS TABLE(tracking_number text, status text, service_type text, from_city text, to_city text, current_location text, estimated_delivery timestamp with time zone, weight numeric, tracking_events jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT
      s.tracking_number,
      s.status,
      s.service_type,
      s.from_address,
      s.to_address,
      s.current_location,
      s.estimated_delivery,
      s.weight,
      s.tracking_events
    FROM public.shipments s
    WHERE s.tracking_number = upper(_tracking_number)
    LIMIT 1
  ),
  city_extract AS (
    SELECT
      b.*,
      -- city = second-to-last comma chunk (e.g. "New York" from "123 Main St, New York, NY 10001")
      btrim(split_part(b.from_address, ',', greatest(1, array_length(string_to_array(b.from_address, ','), 1) - 1))) AS from_city,
      btrim(split_part(b.to_address, ',', greatest(1, array_length(string_to_array(b.to_address, ','), 1) - 1))) AS to_city
    FROM base b
  )
  SELECT
    c.tracking_number,
    c.status,
    c.service_type,
    c.from_city,
    c.to_city,
    -- Sanitize current_location: if it matches the stored from/to address, return the city; else keep as-is (admins set city-level values for transit hubs)
    CASE
      WHEN c.current_location IS NULL THEN NULL
      WHEN c.current_location = c.from_address THEN c.from_city
      WHEN c.current_location = c.to_address THEN c.to_city
      ELSE btrim(split_part(c.current_location, ',', greatest(1, array_length(string_to_array(c.current_location, ','), 1) - 1)))
    END AS current_location,
    c.estimated_delivery,
    c.weight,
    -- Sanitize tracking_events: replace each event.location with a city-only value
    COALESCE((
      SELECT jsonb_agg(
        ev - 'location' || jsonb_build_object(
          'location',
          CASE
            WHEN ev->>'location' IS NULL THEN NULL
            WHEN ev->>'location' = c.from_address THEN c.from_city
            WHEN ev->>'location' = c.to_address THEN c.to_city
            ELSE btrim(split_part(ev->>'location', ',', greatest(1, array_length(string_to_array(ev->>'location', ','), 1) - 1)))
          END
        )
        ORDER BY ord
      )
      FROM jsonb_array_elements(c.tracking_events) WITH ORDINALITY AS t(ev, ord)
    ), '[]'::jsonb) AS tracking_events
  FROM city_extract c;
$function$;