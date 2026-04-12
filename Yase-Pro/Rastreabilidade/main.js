// // Configuração do Supabase (Mantendo suas credenciais)
const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window._supabase = supabaseClient;
const _supabase = window._supabase;

const operadorAtual = localStorage.getItem("nome_operador") || "Sistema";

window.currentOS = "";
window.selectedLevel = 1;
let editandoID = null;
// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando carregamento de Rastreabilidade...");
  console.log("✅ Supabase inicializado:", _supabase ? "SIM" : "NÃO");

  const urlParams = new URLSearchParams(window.location.search);
  window.currentOS =
    urlParams.get("os") || sessionStorage.getItem("currentOS") || "1";

  console.log("📋 OS Atual:", window.currentOS);

  // Atualiza os elementos visuais da OS
  const displayOS = document.getElementById("displayOS");
  const osBadgeNumber = document.getElementById("osBadgeNumber");

  if (displayOS) displayOS.innerText = window.currentOS;
  if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${window.currentOS}`;

  // Define a data de hoje por padrão
  const hoje = new Date().toISOString().split("T")[0];
  const campoData = document.getElementById("data_selagem");
  if (campoData) campoData.value = hoje;

  // Verifica se renderItens existe
  console.log(
    "✅ renderItens disponível:",
    typeof window.renderItens === "function" ? "SIM" : "NÃO",
  );

  // --- CARREGAMENTO INICIAL ---
  console.log("📥 Carregando itens do Supabase...");
  await loadItens();

  // Pequeno intervalo para o navegador terminar de renderizar o HTML da tabela
  setTimeout(() => {
    if (typeof focarUltimoRegistro === "function") {
      focarUltimoRegistro();
    }
  }, 600);
});

// Ajuste na função loadItens para garantir a ordem correta
async function loadItens() {
  try {
    console.log("🔍 Buscando itens para OS:", window.currentOS);

    // Verifica se o elemento da tabela existe
    const tabelaElement = document.getElementById("itensList");
    console.log("✅ Tabela DOM encontrada:", tabelaElement ? "SIM" : "NÃO");

    const { data, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("os_number", window.currentOS)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Erro Supabase:", error);
      throw error;
    }

    console.log("✅ Dados recebidos:", data?.length || 0, "itens");
    console.log("📊 Primeiros dados:", data?.[0] || "vazio");

    // Chama renderItens com os dados
    if (typeof window.renderItens === "function") {
      window.renderItens(data);
      console.log("✅ Tabela renderizada com sucesso");
    } else {
      console.error("❌ renderItens não está definida!");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar itens:", error);
  }
}

// Função de Logout
function logout() {
  sessionStorage.clear();
  window.location.href = "EntrarSistema.html";
}

// Para que o "Pesagem ABC"
// mude automaticamente quando você trocar o tipo de extintor
const tipoCargaElement = document.getElementById("tipo_carga");
if (tipoCargaElement) {
  tipoCargaElement.addEventListener("change", function () {
    const valor = this.value || "ABC";
    const titulo = document.getElementById("titulo_pesagem");
    if (titulo) titulo.innerText = "Pesagem " + valor;
  });
}

// Escuta mudanças no banco em tempo real
_supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "itens_os" },
    (payload) => {
      console.log("🔔 Mudança detectada no Supabase!", payload);

      // Garante que a atualização ocorra via window
      const fnCarregar = window.carregarItens || window.loadItens;
      if (typeof fnCarregar === "function") {
        fnCarregar();
      }
    },
  )
  .subscribe();

console.log("✅ Realtime listener ativado para tabela itens_os");

document.addEventListener("DOMContentLoaded", () => {
  // Recupera o nome que guardamos no login
  const nomeOperador = localStorage.getItem("nome_operador");
  const nomeEmpresa = localStorage.getItem("nome_empresa");

  // Alvo no seu HTML (certifique-se de que o ID coincida)
  const displayElement = document.getElementById("nome-operador-logado");

  if (displayElement && nomeOperador) {
    displayElement.textContent = nomeOperador.toUpperCase();
    console.log(`Unidade: ${nomeEmpresa} | Operador: ${nomeOperador}`);
  }
});

window.loadItens = loadItens;
window.logout = logout;
// Configuração do Supabase (YaSe PRO)
// Configuração do Supabase
