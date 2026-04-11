// ui-updates.js - FUNÇÃO COMPLETA

// Inicia e escuta mudanças
window.addEventListener("load", () => {
  sincronizarPainelSelos();

  _supabase
    .channel("mudanca_selos")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "itens_os" },
      () => {
        setTimeout(sincronizarPainelSelos, 500);
      },
    )
    .subscribe();
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

window.abrirModalComponentes = abrirModalComponentes;
window.fecharModalComponentes = fecharModalComponentes;
