CREATE TABLE IF NOT EXISTS public.leads (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email      text NOT NULL,
  name       text NOT NULL,
  company    text,
  role       text,
  verified   boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON public.leads (email);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
