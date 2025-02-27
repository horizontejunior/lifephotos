import { createClient } from '@supabase/supabase-js'


export default async function Users() {
    const supabase = await createClient("https://rbknzfcuanmdutsipexz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia256ZmN1YW5tZHV0c2lwZXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTYzMzUsImV4cCI6MjA1NjE5MjMzNX0.wdqTZFCIX49oy7065GBdNuAvIPfBlwo41prIeCpJGSk");
    const { data: users, error } = await supabase.from("users").select();
  
    if (error) {
      return <pre>Erro ao buscar usuários: {error.message}</pre>;
    }
  
    return <pre>{JSON.stringify(users || "Nenhum usuário encontrado", null, 2)}</pre>;
  }
  

