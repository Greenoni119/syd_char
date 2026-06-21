-- Invite Tokens Table
CREATE TABLE invite_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Guest Sessions Table
CREATE TABLE guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_token_id UUID REFERENCES invite_tokens(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    media_type TEXT CHECK (media_type IN ('photo', 'video'))
);

-- Create indexes for better performance
CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX idx_invite_tokens_active ON invite_tokens(active);
CREATE INDEX idx_guest_sessions_invite_token_id ON guest_sessions(invite_token_id);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_uploaded_at ON media(uploaded_at DESC);
CREATE INDEX idx_media_media_type ON media(media_type);

-- Enable Row Level Security
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite_tokens
CREATE POLICY "Allow read access to invite tokens" ON invite_tokens
    FOR SELECT USING (true);

CREATE POLICY "Allow insert invite tokens" ON invite_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update invite tokens" ON invite_tokens
    FOR UPDATE USING (true);

-- RLS Policies for guest_sessions
CREATE POLICY "Allow read access to guest sessions" ON guest_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow insert guest sessions" ON guest_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update guest sessions" ON guest_sessions
    FOR UPDATE USING (true);

-- RLS Policies for media
CREATE POLICY "Allow read access to media" ON media
    FOR SELECT USING (true);

CREATE POLICY "Allow insert media" ON media
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete media" ON media
    FOR DELETE USING (true);
