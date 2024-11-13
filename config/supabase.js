const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_PROJECT_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

module.exports = createClient(supabaseUrl, supabaseKey)