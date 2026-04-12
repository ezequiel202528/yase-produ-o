const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";

if (!window._supabase) {
  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );
  window._supabase = supabaseClient;
}
const _supabase = window._supabase;

const nomeOperadorLogado = localStorage.getItem("nome_operador") || "Sistema";
window.nomeOperadorLogado = nomeOperadorLogado;

window.currentOS = "";
window.selectedLevel = 1;
window.editandoID = null;

/**
 * Inicialização global ao carregar a página de Rastreabilidade.
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando carregamento de Rastreabilidade...");
  console.log("✅ Supabase inicializado:", _supabase ? "SIM" : "NÃO");

  const urlParams = new URLSearchParams(window.location.search);
  window.currentOS =
    urlParams.get("os") || sessionStorage.getItem("currentOS") || "1";

  console.log("📋 OS Atual:", window.currentOS);

  const displayOS = document.getElementById("displayOS");
  const osBadgeNumber = document.getElementById("osBadgeNumber");

  if (displayOS) displayOS.innerText = window.currentOS;
  if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${window.currentOS}`;

  const hoje = new Date().toISOString().split("T")[0];
  const campoData = document.getElementById("data_selagem");
  if (campoData) campoData.value = hoje;

  const forcarLimpeza = () => {
    const ids = ["X_input_id", "nr_cilindro", "inputBuscaModal"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = "";
        el.defaultValue = "";
      }
    });
    const preview = document.getElementById("nome_fabricante_preview");
    if (preview) preview.innerText = "";
  };

  forcarLimpeza();
  setTimeout(forcarLimpeza, 500);
  setTimeout(forcarLimpeza, 1500);

  console.log("📥 Carregando itens do Supabase...");
  if (typeof window.carregarItens === "function") await window.carregarItens();
  if (typeof window.sincronizarPainelSelos === "function")
    await window.sincronizarPainelSelos();
  if (typeof window.carregarTipos === "function") await window.carregarTipos();

  setTimeout(() => {
    if (typeof focarUltimoRegistro === "function") {
      focarUltimoRegistro();
    }
  }, 600);
});
/**
 * Realiza o logout do sistema limpando a sessão.
 */
function logout() {
  sessionStorage.clear();
  window.location.href = "EntrarSistema.html";
}

const tipoCargaElement = document.getElementById("tipo_carga");

/**
 * Atualiza o título do grupo de pesagem dinamicamente conforme o tipo de carga.
 */
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
      const fnCarregar = window.carregarItens || window.loadItens;
      if (typeof fnCarregar === "function") {
        fnCarregar();
      }
    },
  )
  .subscribe();

console.log("✅ Realtime listener ativado para tabela itens_os");

document.addEventListener("DOMContentLoaded", () => {
  const nomeOperador = localStorage.getItem("nome_operador");
  const nomeEmpresa = localStorage.getItem("nome_empresa");
  const displayElement = document.getElementById("nome-operador-logado");

  if (displayElement && nomeOperador) {
    displayElement.textContent = nomeOperador.toUpperCase();
    console.log(`Unidade: ${nomeEmpresa} | Operador: ${nomeOperador}`);
  }
});

window.logout = logout;
// Configuração do Supabase (YaSe PRO)
// Configuração do Supabase
