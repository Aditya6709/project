const { createClient } = require('@supabase/supabase-js');

// Supabase credentials and client setup
const supabaseUrl = 'https://oewyazfmpcfoxwjunwpp.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld3lhemZtcGNmb3h3anVud3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDE0NzgsImV4cCI6MjA1MDk3NzQ3OH0.wpJQbLcwvnTO-BW3D4d9R1LrLlUiBONPlzUtUU3Qb8w'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Supabase storage bucket
const bucketName = 'pdf'; // Replace with your bucket name
const storage = supabase.storage.from(bucketName);

module.exports = storage;
