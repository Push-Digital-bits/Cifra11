// Verifica se tem usuário logado. Se não tiver, manda pro login.
async function protegerPagina() {
  const { data } = await sbClient.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return null;
  }
  return data.session;
}

// Busca o perfil (nome e papel) do usuário logado
async function obterPerfil() {
  const { data: { user } } = await sbClient.auth.getUser();
  if (!user) return null;

  const { data, error } = await sbClient
    .from("perfis")
    .select("nome, papel")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }
  return data;
}

// Faz logout e volta pro login
async function fazerLogout() {
  await sbClient.auth.signOut();
  window.location.href = "login.html";
}