-- CarouselGen Database Schema
-- This file contains the SQL schema for storing user carousels and related data

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create carousel_styles table
CREATE TABLE IF NOT EXISTS carousel_styles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    preview_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('business', 'meme', 'educational', 'lifestyle', 'kalshi')),
    colors TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carousels table
CREATE TABLE IF NOT EXISTS carousels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    style_id TEXT NOT NULL REFERENCES carousel_styles(id),
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carousel_slides table
CREATE TABLE IF NOT EXISTS carousel_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carousel_id UUID NOT NULL REFERENCES carousels(id) ON DELETE CASCADE,
    image_url TEXT,
    text TEXT NOT NULL,
    position INTEGER NOT NULL,
    background_color TEXT,
    text_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    bio TEXT,
    logo_url TEXT,
    brand_colors TEXT[],
    default_font TEXT DEFAULT 'Inter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_usage table for tracking limits
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    carousels_created INTEGER DEFAULT 0,
    slides_created INTEGER DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Insert default carousel styles
INSERT INTO carousel_styles (id, name, description, preview_url, category, colors) VALUES
('kalshi', 'Kalshi Style', 'Clean, professional look inspired by Kalshi', '/images/kalshi-preview.png', 'kalshi', ARRAY['#3B82F6', '#1E40AF', '#1D4ED8', '#2563EB']),
('educational', 'Educational Style', 'Perfect for tutorials and educational content', '/images/educational-preview.png', 'educational', ARRAY['#10B981', '#059669', '#047857', '#065F46']),
('meme', 'Meme Style', 'Fun and engaging for social media', '/images/meme-preview.png', 'meme', ARRAY['#F59E0B', '#D97706', '#B45309', '#92400E']),
('business', 'Business Style', 'Professional and corporate look', '/images/business-preview.png', 'business', ARRAY['#6B7280', '#4B5563', '#374151', '#1F2937']),
('lifestyle', 'Lifestyle Style', 'Modern and trendy for lifestyle content', '/images/lifestyle-preview.png', 'lifestyle', ARRAY['#EC4899', '#BE185D', '#9D174D', '#831843'])
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carousels_user_id ON carousels(user_id);
CREATE INDEX IF NOT EXISTS idx_carousels_created_at ON carousels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_carousel_id ON carousel_slides(carousel_id);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_position ON carousel_slides(carousel_id, position);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month_year);

-- Enable Row Level Security (RLS)
ALTER TABLE carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own carousels
CREATE POLICY "Users can view own carousels" ON carousels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carousels" ON carousels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carousels" ON carousels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own carousels" ON carousels
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own carousel slides
CREATE POLICY "Users can view own carousel slides" ON carousel_slides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM carousels 
            WHERE carousels.id = carousel_slides.carousel_id 
            AND carousels.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own carousel slides" ON carousel_slides
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM carousels 
            WHERE carousels.id = carousel_slides.carousel_id 
            AND carousels.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own carousel slides" ON carousel_slides
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM carousels 
            WHERE carousels.id = carousel_slides.carousel_id 
            AND carousels.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own carousel slides" ON carousel_slides
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM carousels 
            WHERE carousels.id = carousel_slides.carousel_id 
            AND carousels.user_id = auth.uid()
        )
    );

-- Users can only see their own settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own usage data
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_carousels_updated_at BEFORE UPDATE ON carousels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
