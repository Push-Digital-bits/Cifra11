// Configuração de conexão com o Supabase
// A URL e a chave publishable NÃO são segredo - podem ficar aqui no código mesmo
const SUPABASE_URL = "https://nvjbyevgibtruczeyobu.supabase.co";
const SUPABASE_KEY = "sb_publishable_IuVicJKwxG4cQr0lIFwj1g_QJD8RVk2"; // troque pela chave que você copiou lá no Supabase (começa com sb_publishable_)

const { createClient } = supabase;
const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);