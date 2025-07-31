
-- Update existing modules to be published so they appear in the student interface
UPDATE course_modules 
SET is_published = true 
WHERE is_published = false;

-- Also ensure courses are published
UPDATE courses 
SET is_published = true 
WHERE is_published = false;
