// // Configuração do Supabase (Mantendo suas credenciais)
// const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
// const SUPABASE_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";
// const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// const operadorAtual = localStorage.getItem("nome_operador") || "Sistema";

// window.currentOS = "";
// let selectedLevel = 1;
// let editandoID = null;
// // Inicialização ao carregar a página
// window.onload = async () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   window.currentOS = urlParams.get("os") || sessionStorage.getItem("currentOS");

//   if (!window.currentOS) {
//     alert("Nenhuma Ordem de Serviço selecionada.");
//     window.location.href = "GestaoOS.html";
//     return;
//   }

//   // Atualiza os elementos visuais da OS
//   const displayOS = document.getElementById("displayOS");
//   const osBadgeNumber = document.getElementById("osBadgeNumber");

//   if (displayOS) displayOS.innerText = window.currentOS;
//   if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${window.currentOS}`;

//   // Define a data de hoje por padrão
//   const hoje = new Date().toISOString().split("T")[0];
//   const campoData = document.getElementById("data_selagem");
//   if (campoData) campoData.value = hoje;

//   // --- CARREGAMENTO INICIAL COM DESTAQUE ---
//   // Usamos o await para garantir que os dados cheguem antes de tentar focar
//   await loadItens();

//   // Pequeno intervalo para o navegador terminar de renderizar o HTML da tabela
//   setTimeout(() => {
//     if (typeof focarUltimoRegistro === "function") {
//       focarUltimoRegistro();
//     }
//   }, 600);
// };

// // Ajuste na função loadItens para garantir a ordem correta
// async function loadItens() {
//   try {
//     const { data, error } = await _supabase
//       .from("itens_os")
//       .select("*")
//       .eq("os_number", window.currentOS)
//       .order("created_at", { ascending: true }); // 'true' para o último ser o de baixo

//     if (error) throw error;

//     // Se você usa 'renderItens' ou 'renderizarTabela', chame-a aqui
//     renderItens(data);
//   } catch (error) {
//     console.error("Erro ao carregar itens:", error);
//   }
// }

// // Função de Logout
// function logout() {
//   sessionStorage.clear();
//   window.location.href = "EntrarSistema.html";
// }

// // Para que o "Pesagem ABC"
// // mude automaticamente quando você trocar o tipo de extintor,
// // adicione isso ao seu arquivo de scripts:

// // Exemplo de como mudar o nome conforme a carga
// document.getElementById("tipo_carga").addEventListener("change", function () {
//   const valor = this.value || "ABC";
//   document.getElementById("titulo_pesagem").innerText = "Pesagem " + valor;
// });

// // Escuta mudanças no banco em tempo real
// _supabase
//   .channel("custom-all-channel")
//   .on(
//     "postgres_changes",
//     { event: "*", schema: "public", table: "itens_os" },
//     (payload) => {
//       console.log("Mudança detectada!", payload);
//       carregarItens(); // Chama a função que reconstrói a tabela
//     },
//   )
//   .subscribe();

// document.addEventListener("DOMContentLoaded", () => {
//   // Recupera o nome que guardamos no login
//   const nomeOperador = localStorage.getItem("nome_operador");
//   const nomeEmpresa = localStorage.getItem("nome_empresa");

//   // Alvo no seu HTML (certifique-se de que o ID coincida)
//   const displayElement = document.getElementById("nome-operador-logado");

//   if (displayElement && nomeOperador) {
//     displayElement.textContent = nomeOperador.toUpperCase();
//     console.log(`Unidade: ${nomeEmpresa} | Operador: ${nomeOperador}`);
//   }
// });
// Configuração do Supabase (YaSe PRO)
const SUPABASE_URL = "https://gzojpxgpgjapsegerscb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s";

// Variável global que todos os outros arquivos (renderizarTabela, EditarExcluir, etc) usam
window._supabase = null;

// Função de conexão segura que aguarda a biblioteca do CDN estar pronta
function conectarAoBanco() {
  if (window.supabase) {
    window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("YaSe PRO: Banco conectado com sucesso!");
    
    // Se a página já carregou a OS, dispara a busca inicial de itens
    if (window.currentOS) {
      loadItens();
    }
  } else {
    // Se a biblioteca ainda não carregou, tenta novamente em 100ms
    setTimeout(conectarAoBanco, 100);
  }
}

// Inicia o processo de conexão
conectarAoBanco();

// Variáveis de controle global
window.currentOS = "";
let selectedLevel = 1;
let editandoID = null;

// Inicialização da página ao carregar
window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  window.currentOS = urlParams.get("os") || sessionStorage.getItem("currentOS");

  if (!window.currentOS) {
    alert("Nenhuma Ordem de Serviço selecionada.");
    window.location.href = "GestaoOS.html";
    return;
  }

  // Atualiza os elementos visuais do cabeçalho
  const displayOS = document.getElementById("displayOS");
  const osBadgeNumber = document.getElementById("osBadgeNumber");

  if (displayOS) displayOS.innerText = window.currentOS;
  if (osBadgeNumber) osBadgeNumber.innerText = `OS: ${window.currentOS}`;

  // Define a data de hoje por padrão no campo de selagem
  const hoje = new Date().toISOString().split("T")[0];
  const campoData = document.getElementById("data_selagem");
  if (campoData) campoData.value = hoje;

  // Pequeno delay para garantir que o _supabase foi criado pela função conectarAoBanco
  setTimeout(() => {
    if (window._supabase) {
      loadItens();
      
      // Tenta focar no último registro após a renderização (se a função existir)
      setTimeout(() => {
        if (typeof focarUltimoRegistro === "function") {
          focarUltimoRegistro();
        }
      }, 600);
    }
  }, 500);
};

// Função centralizada para carregar itens da OS atual
async function loadItens() {
  if (!window._supabase) return;
  
  try {
    const { data, error } = await window._supabase
      .from("itens_os")
      .select("*")
      .eq("os_number", window.currentOS)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Chama a função de renderização que está no renderizarTabela.js
    if (typeof renderItens === "function") {
      renderItens(data);
    }
  } catch (error) {
    console.error("Erro ao carregar itens no main.js:", error);
  }
}

// Evento para atualizar o título da pesagem conforme o tipo de carga
document.addEventListener("DOMContentLoaded", () => {
  const campoCarga = document.getElementById("tipo_carga");
  if (campoCarga) {
    campoCarga.addEventListener("change", function () {
      const valor = this.value || "ABC";
      const titulo = document.getElementById("titulo_pesagem");
      if (titulo) titulo.innerText = "Pesagem " + valor;
    });
  }

  // Recupera o nome do operador para exibição
  const nomeOperador = localStorage.getItem("nome_operador");
  const displayElement = document.getElementById("nome-operador-logado");
  if (displayElement && nomeOperador) {
    displayElement.textContent = nomeOperador.toUpperCase();
  }
});

// Função de Logout
function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}