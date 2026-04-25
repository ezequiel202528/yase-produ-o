// ui-updates.js - FUNÇÃO COMPLETA

// Inicia e escuta mudanças
window.addEventListener("load", () => {
  // Espera o Supabase estar disponível
  const iniciarSincronizacao = () => {
    if (window._supabase) {
      sincronizarPainelSelos();

      window._supabase
        .channel("mudanca_selos")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "itens_os" },
          () => {
            setTimeout(sincronizarPainelSelos, 500);
          },
        )
        .subscribe();
    } else {
      setTimeout(iniciarSincronizacao, 500);
    }
  };
  iniciarSincronizacao();
});

// Função para abrir o modal de componentes
function abrirModalComponentes() {
  const modal = document.getElementById("modalComponentes");
  if (modal) {
    // Remove 'hidden' para tornar visível e adiciona 'flex' para centralizar
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } else {
    console.error("Erro: O modal 'modalComponentes' não foi encontrado.");
  }
}

// Função para fechar o modal
function fecharModalComponentes() {
  const modal = document.getElementById("modalComponentes");
  if (modal) {
    // Adiciona 'hidden' para esconder e remove 'flex'
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Funções de busca rápida (Placeholders para evitar erro de 'not defined')
function X_ABRIR_TIPO() {
  if (typeof window.abrirModalTipo === "function") {
    window.abrirModalTipo();
  }
}

function openCapacidadeModal() {
  if (typeof window.abrirModalCapacidade === "function") {
    window.abrirModalCapacidade();
  }
}

function X_ABRIR_NBR() {
  if (typeof window.abrirModalNBR === "function") {
    window.abrirModalNBR();
  }
}

window.abrirModalComponentes = abrirModalComponentes;
window.fecharModalComponentes = fecharModalComponentes;
window.X_ABRIR_TIPO = X_ABRIR_TIPO;
window.openCapacidadeModal = openCapacidadeModal;
window.X_ABRIR_NBR = X_ABRIR_NBR;
