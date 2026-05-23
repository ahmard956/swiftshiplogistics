-- Update default status for new shipments
ALTER TABLE public.shipments ALTER COLUMN status SET DEFAULT 'label_created';

-- Rename existing 'order_received' statuses to 'label_created'
UPDATE public.shipments SET status = 'label_created' WHERE status = 'order_received';
