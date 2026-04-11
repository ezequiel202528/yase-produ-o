// // Configuração do Supabase (Mantendo suas credenciais)
const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";

// 1. Declaramos a variável mas NÃO inicializamos ainda
let _supabase;

// 2. Criamos uma função para inicializar a conexão com segurança
function inicializarConexao() {
  if (window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window._supabase = _supabase; // Expõe globalmente para os outros arquivos
    console.log("YaSe PRO: Conexão estabelecida com sucesso!");
    return true;
  }
  return false;
}

// 3. Tenta conectar imediatamente. Se falhar, tenta de novo em loop até conseguir.
if (!inicializarConexao()) {
  const intervaloConexao = setInterval(() => {
    if (inicializarConexao()) {
      clearInterval(intervaloConexao);
      // Se a página já carregou mas a conexão atrasou, chama o load inicial
      if (window.currentOS) loadItens();
    }
  }, 100);
}

const operadorAtual = localStorage.getItem("nome_operador") || "Sistema";

window.currentOS = "";
let selectedLevel = 1;
let editandoID = null;

// Inicialização ao carregar a página
window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  window.currentOS = urlParams.get("os") || sessionStorage.getItem("currentOS");

  if (!window.currentOS) {
    alert("Nenhuma Ordem de Serviço selecionada.");
    window.location.href = "GestaoOS.html";
    return;
  }

  // Atualiza os elementos visuais da OS
  const displayOS = document.getElementById("displayOS");
  const osBadgeNumber = document.getElementById("osBadgeNumber");

  if (displayOS) displayOS.innerText = window.currentOS;
  if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${window.currentOS}`;

  // Define a data de hoje por padrão
  const hoje = new Date().toISOString().split("T")[0];
  const campoData = document.getElementById("data_selagem");
  if (campoData) campoData.value = hoje;

  // Aguarda um pequeno momento para garantir que o _supabase foi criado pelo loop acima
  setTimeout(async () => {
    if (_supabase) {
      await loadItens();
      setTimeout(() => {
        if (typeof focarUltimoRegistro === "function") focarUltimoRegistro();
      }, 600);
    }
  }, 200);
};

// Função para carregar os itens
async function loadItens() {
  if (!_supabase) return; // Segurança extra
  try {
    const { data, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("os_number", window.currentOS)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (typeof renderItens === "function") {
       renderItens(data);
    }
  } catch (error) {
    console.error("Erro ao carregar itens:", error);
  }
}

// Logout e Eventos (Mantidos conforme seu original)
function logout() {
  sessionStorage.clear();
  window.location.href = "EntrarSistema.html";
}

// Escuta mudanças no banco em tempo real (Envolvido em proteção)
function ativarRealtime() {
    if (!_supabase) {
        setTimeout(ativarRealtime, 500);
        return;
    }
    _supabase
      .channel("custom-all-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "itens_os" }, (payload) => {
          loadItens();
      })
      .subscribe();
}
ativarRealtime();

document.addEventListener("DOMContentLoaded", () => {
  const nomeOperador = localStorage.getItem("nome_operador");
  const displayElement = document.getElementById("nome-operador-logado");
  if (displayElement && nomeOperador) {
    displayElement.textContent = nomeOperador.toUpperCase();
  }
});