CREATE TABLE IF NOT EXISTS bulk_inquiries (
  id SERIAL PRIMARY KEY,
  company_name TEXT, email TEXT, phone TEXT, message TEXT,
  status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW()
);
