CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed')),
  processed_at timestamptz
);

ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.processed_stripe_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.processed_stripe_events TO service_role;