-- Create audit_logs table for security and activity tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON audit_logs(email);

-- Create RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow producers to view audit logs for their companies
CREATE POLICY "Producers can view audit logs for their companies" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.auth_user_id = auth.uid()
      AND (
        audit_logs.user_id = c.auth_user_id
        OR audit_logs.metadata->>'company_name' = c.name
      )
    )
  );

-- Allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Create function to automatically clean old audit logs (keep last 90 days)
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old logs (runs daily)
SELECT cron.schedule(
  'clean-audit-logs',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT clean_old_audit_logs();'
);

-- Add subscription_canceled_at column to companies table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'subscription_canceled_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN subscription_canceled_at TIMESTAMPTZ;
  END IF;
END $$; 