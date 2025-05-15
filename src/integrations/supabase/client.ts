// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://onimdyizdngyeyzsvuym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uaW1keWl6ZG5neWV5enN2dXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDg0ODksImV4cCI6MjA1OTMyNDQ4OX0.5u-UEln5eJMsXYrVmgQYkmoR8UD0vxbc7cQqv5Q-blE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);