// Verifica se tem usuário logado. Se não tiver, manda pro login.
async function protegerPagina() {
  try {
    const { data } = await sbClient.auth.getSession();
    if (!data.session) {
      window.location.href = "login.html";
      return null;
    }
    return data.session;
  } catch (e) {
    console.error("Erro ao verificar sessão (provavelmente sem internet):", e);
    return null;
  }
}

const CHAVE_GRUPO_ATIVO = "g11cifras_grupoAtivo";

// Verifica se o usuário logado é "dono do app" (modo Deus — enxerga todos os grupos)
async function ehDonoApp() {
  try {
    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) return false;
    const { data, error } = await sbClient
      .from("donos_app")
      .select("usuario_id")
      .eq("usuario_id", user.id)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch (e) {
    return false;
  }
}

// Busca todos os perfis (um por grupo) do usuário logado.
// Se for dono do app, também enxerga (como perfil "virtual" de administrador)
// todo grupo em que ainda não tenha um perfil próprio.
async function obterPerfis() {
  try {
    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) return [];

    const { data: perfisReais, error } = await sbClient
      .from("perfis")
      .select("id, nome, papel, status, grupo_id, grupos (id, nome, codigo, imagem_url, limite_membros, excluido_em)")
      .eq("usuario_id", user.id);

    if (error) {
      console.error("Erro ao buscar perfis:", error);
      return [];
    }

    const listaReal = perfisReais || [];
    const dono = await ehDonoApp();
    if (!dono) return listaReal;

    const { data: todosGrupos } = await sbClient
      .from("grupos")
      .select("id, nome, codigo, imagem_url, limite_membros, excluido_em");

    const idsComPerfil = new Set(listaReal.map((p) => p.grupo_id));
    const nomeUsuario = (listaReal[0] && listaReal[0].nome) || (user.email || "").split("@")[0];

    const virtuais = (todosGrupos || [])
      .filter((g) => !idsComPerfil.has(g.id))
      .map((g) => ({
        id: null,
        nome: nomeUsuario,
        papel: "administrador",
        status: "ativo",
        grupo_id: g.id,
        grupos: g,
        virtual: true
      }));

    return [...listaReal, ...virtuais];
  } catch (e) {
    console.error("Erro ao buscar perfis (provavelmente sem internet):", e);
    return [];
  }
}

// Resolve o perfil ATIVO — o grupo que o usuário está usando agora nesta aba/dispositivo.
async function obterPerfil() {
  try {
    const perfis = await obterPerfis();
    if (perfis.length === 0) return null;

    const grupoAtivoId = localStorage.getItem(CHAVE_GRUPO_ATIVO);
    let escolhido = perfis.find((p) => p.grupo_id === grupoAtivoId);
    if (!escolhido) {
      escolhido = perfis[0];
      localStorage.setItem(CHAVE_GRUPO_ATIVO, escolhido.grupo_id);
    }

    const dono = await ehDonoApp();
    const grupo = escolhido.grupos || null;
    const bloqueado = !!(grupo && grupo.excluido_em && !dono);

    return {
      nome: escolhido.nome,
      papel: escolhido.papel,
      status: escolhido.status,
      grupoId: escolhido.grupo_id,
      grupo: grupo,
      donoApp: dono,
      bloqueado: bloqueado,
      podeEditarConteudo: !bloqueado && (dono || escolhido.papel === "administrador" || escolhido.papel === "editor"),
      podeGerenciarGrupo: !bloqueado && (dono || escolhido.papel === "administrador"),
      temMultiplosGrupos: perfis.length > 1,
      todosPerfis: perfis
    };
  } catch (e) {
    console.error("Erro ao buscar perfil (provavelmente sem internet):", e);
    return null;
  }
}

// Troca o grupo ativo (usado no seletor de perfis / "adicionar novo perfil") e recarrega.
function trocarGrupoAtivo(grupoId) {
  localStorage.setItem(CHAVE_GRUPO_ATIVO, grupoId);
  window.location.href = "index.html";
}

// Entra em um grupo pelo código (cadastro inicial ou "adicionar novo perfil").
// Retorna { data, error } — error.message pode ser 'codigo_invalido' ou 'ja_e_membro'.
async function entrarEmGrupo(codigo, nome) {
  return await sbClient.rpc("entrar_em_grupo", { p_codigo: codigo, p_nome: nome });
}

// Faz logout e volta pro login
async function fazerLogout() {
  localStorage.removeItem(CHAVE_GRUPO_ATIVO);
  await sbClient.auth.signOut();
  window.location.href = "login.html";
}
