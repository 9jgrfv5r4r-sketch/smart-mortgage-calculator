import { createClient } from '@supabase/supabase-js';

// Для Vite используем import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rxsrhmdtsknmqxwkzyvv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c3JobWR0c2tubXF4d2t6eXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjUyMzIsImV4cCI6MjA4MDM0MTIzMn0.BwVmXIKznELRdAblam4dMimdpBa5AOy08ftuYq0FBu0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);