
-- Create storage bucket for course banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-banners',
  'course-banners',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
);

-- Create RLS policies for course banners bucket
CREATE POLICY "Anyone can view course banners" ON storage.objects
FOR SELECT USING (bucket_id = 'course-banners');

CREATE POLICY "Producers can upload course banners" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-banners' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can update their course banners" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-banners' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can delete their course banners" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-banners' AND
  auth.uid() IS NOT NULL
);
