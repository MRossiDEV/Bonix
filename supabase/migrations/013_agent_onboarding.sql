-- Agent onboarding data model and policies

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  experience TEXT,
  channels TEXT[],
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS agents_user_id_key ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_region ON agents(region);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own data" ON agents
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Agents can update their own data" ON agents
  FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Agents can create their own profile" ON agents
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Admins can view all agents" ON agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update any agent" ON agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
