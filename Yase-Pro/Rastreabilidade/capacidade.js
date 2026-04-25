/**
 * GERENCIAMENTO DE CAPACIDADES - YA SE PRO
 */

const getSupa = () => window._supabase || window.supabase;
window.editandoCapacidadeId = null;

async function carregarCapacidades() {
  try {
    const { data, error } = await getSupa()
      .from("capacidades")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;
    renderizarListaCapacidade(data);
    atualizarSelectCapacidade(data);
  } catch (err) {
    console.error("Erro ao carregar capacidades:", err);
  }
}

function renderizarListaCapacidade(lista) {
  const container = document.getElementById("listaCapacidades");
  if (!container) return;

  container.innerHTML = (lista || [])
    .map(
      (item) => `
        <div class="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-amber-500 hover:bg-slate-800/60 transition-all group">
            <div onclick="selecionarCapacidade('${item.nome}')" class="flex-1 cursor-pointer">
                <span class="text-slate-200 text-xs font-bold uppercase">${item.nome}</span>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="prepararEdicaoCapacidade('${item.id}', '${item.nome}')" class="text-amber-500 hover:text-amber-400 p-1">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>
                <button onclick="deletarCapacidade('${item.id}')" class="text-red-500 hover:text-red-400 p-1">
                    <i class="fa-solid fa-trash text-[10px]"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function atualizarSelectCapacidade(lista) {
  const select = document.getElementById("capacidade");
  if (!select) return;
  const valorAtual = select.value;
  select.innerHTML =
    '<option value="">Capacidade</option>' +
    lista.map((n) => `<option value="${n.nome}">${n.nome}</option>`).join("");
  select.value = valorAtual;
}

function selecionarCapacidade(nome) {
  const select = document.getElementById("capacidade");
  if (select) {
    select.value = nome;
    select.classList.remove("input-error-shake", "border-red-500");
    select.classList.add("border-emerald-500", "ring-2", "ring-emerald-500/20");
    select.dispatchEvent(new Event("change"));

    setTimeout(() => {
      select.classList.remove(
        "border-emerald-500",
        "ring-2",
        "ring-emerald-500/20",
      );
    }, 1000);
  }
  fecharModalCapacidade();
}

async function salvarCapacidade() {
  const input = document.getElementById("novoCapacidadeNome");
  const nome = input.value.toUpperCase().trim();
  if (!nome) return;

  const supa = getSupa();
  if (window.editandoCapacidadeId) {
    const { error } = await supa
      .from("capacidades")
      .update({ nome })
      .eq("id", window.editandoCapacidadeId);
    if (!error) {
      window.editandoCapacidadeId = null;
      document.getElementById("btnSalvarCapacidade").innerText = "ADICIONAR";
      input.value = "";
      carregarCapacidades();
    }
  } else {
    const { error } = await supa.from("capacidades").insert([{ nome }]);
    if (!error) {
      input.value = "";
      carregarCapacidades();
    }
  }
}

function prepararEdicaoCapacidade(id, nome) {
  window.editandoCapacidadeId = id;
  const input = document.getElementById("novoCapacidadeNome");
  input.value = nome;
  input.focus();
  document.getElementById("btnSalvarCapacidade").innerText = "SALVAR";
}

async function deletarCapacidade(id) {
  if (confirm("Deseja realmente excluir esta capacidade?")) {
    const { error } = await getSupa().from("capacidades").delete().eq("id", id);
    if (!error) carregarCapacidades();
  }
}

window.abrirModalCapacidade = () => {
  const modal = document.getElementById("modalCapacidade");
  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
  carregarCapacidades();
};
window.fecharModalCapacidade = () => {
  document.getElementById("modalCapacidade")?.classList.add("hidden");
  document.getElementById("modalCapacidade")?.classList.remove("flex");
};

window.carregarCapacidades = carregarCapacidades;
window.salvarCapacidade = salvarCapacidade;
window.selecionarCapacidade = selecionarCapacidade;
window.prepararEdicaoCapacidade = prepararEdicaoCapacidade;
window.deletarCapacidade = deletarCapacidade;
