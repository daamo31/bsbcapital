-- Add admin system to existing database
-- Only add new columns and tables if they don't exist

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;

-- Add permissions column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'permissions') THEN
        ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add last_login column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create business metrics table for dashboard
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_type TEXT, -- 'revenue', 'users', 'consultations', etc.
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    category TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create content management table for Hotmart integration
CREATE TABLE IF NOT EXISTS content_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT, -- 'video', 'course', 'document'
    hotmart_id TEXT,
    thumbnail_url TEXT,
    duration INTEGER, -- in minutes
    category TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
    access_level TEXT DEFAULT 'basic', -- 'basic', 'premium', 'vip'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on new tables
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_management ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all activity logs" ON admin_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Admins can insert activity logs" ON admin_activity_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Admins can manage business metrics" ON business_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Admins can manage all content" ON content_management
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Users can view published content" ON content_management
    FOR SELECT USING (
        status = 'published' AND (
            access_level = 'basic' OR
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() 
                AND users.membership_tier IN ('premium', 'vip')
            )
        )
    );

-- Create admin functions
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND role = 'admin' 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_admin_activity(
    action_text TEXT,
    target_type_param TEXT DEFAULT NULL,
    target_id_param TEXT DEFAULT NULL,
    details_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details)
    VALUES (auth.uid(), action_text, target_type_param, target_id_param, details_param)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Only allow admins
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM users WHERE is_active = true),
        'total_consultations', (SELECT COUNT(*) FROM consultations),
        'pending_consultations', (SELECT COUNT(*) FROM consultations WHERE status = 'pending'),
        'total_content', (SELECT COUNT(*) FROM content_management WHERE status = 'published'),
        'active_memberships', (SELECT COUNT(*) FROM users WHERE membership_tier IS NOT NULL),
        'recent_signups', (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'),
        'monthly_revenue', COALESCE((
            SELECT SUM(metric_value) 
            FROM business_metrics 
            WHERE metric_type = 'revenue' 
            AND period_start > DATE_TRUNC('month', CURRENT_DATE)
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;