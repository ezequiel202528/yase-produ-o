// Função auxiliar para obter o Supabase com segurança
const getSupa = () => window._supabase || window.supabase;

function renderizarListaFabricantes(lista) {
  const container = document.getElementById("listaFabricantes");
  if (!container) return;

  container.innerHTML = (lista || [])
    .map(
      (fab) => `
            <div onclick="selecionarFabricante('${fab.id}', '${fab.nome}')" 
                 class="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-amber-500 hover:bg-slate-800/60 transition-all cursor-pointer group">
                <span class="bg-amber-500/10 text-amber-500 font-black text-[10px] px-2 py-1 rounded-md group-hover:bg-amber-500 group-hover:text-slate-900">ID: ${fab.id}</span>
                <span class="text-slate-200 text-xs font-bold uppercase">${fab.nome}</span>
            </div>
        `,
    )
    .join("");
}

/**
 * Busca a lista de fabricantes do Supabase e renderiza no modal
 */
async function carregarFabricantes() {
  try {
    const { data, error } = await getSupa()
      .from("fabricantes")
      .select("id, nome")
      .order("id", { ascending: true });

    if (error) throw error;
    renderizarListaFabricantes(data);
  } catch (err) {
    console.error("Erro ao carregar fabricantes:", err);
  }
}

function selecionarFabricante(id, nome) {
  // 1. Encontra o input de ID do fabricante
  const inputFabId = document.getElementById("X_input_id");

  if (inputFabId) {
    // 2. Coloca o ID do fabricante clicado dentro do input
    inputFabId.value = id;

    // 3. Atualiza a variável global para que o 'registrarItem' saiba que é válido
    window.fabricanteValido = true;

    // 4. Dispara a função de busca para atualizar o preview do nome ao lado do input
    // Isso garante que o nome apareça imediatamente sem precisar digitar
    buscarNomeFabricante(id);

    // 5. Opcional: Remove qualquer marcação de erro se existir
    inputFabId.classList.remove("input-error-shake", "border-red-500");

    console.log(`Fabricante selecionado: ${nome} (ID: ${id})`);
  }

  inputFabId.classList.add(
    "border-emerald-500",
    "ring-2",
    "ring-emerald-500/20",
  );
  setTimeout(
    () =>
      inputFabId.classList.remove(
        "border-emerald-500",
        "ring-2",
        "ring-emerald-500/20",
      ),
    1000,
  );

  // 6. Fecha o modal automaticamente após a seleção
  fecharModalFabricante();
}

// 3. Cadastro com atualização em tempo real
async function cadastrarFabricante() {
  const nomeInput = document.getElementById("novoFabricanteNome");
  if (!nomeInput) return;

  const nome = nomeInput.value.toUpperCase().trim();

  if (!nome) return;

  const _supabase = getSupa();
  const { data, error } = await _supabase
    .from("fabricantes")
    .insert([{ nome }])
    .select();

  if (!error) {
    nomeInput.value = "";
    carregarFabricantes(); // Atualiza a lista no modal na hora para mostrar o novo ID
  } else {
    console.error("Erro ao cadastrar:", error.message);
  }
}

// Funções de Interface
function abrirModalFabricante() {
  const modal = document.getElementById("modalFabricante");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    carregarFabricantes();
  }
}

function fecharModalFabricante() {
  const modal = document.getElementById("modalFabricante");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function filtrarFabricantes() {
  // Pega o termo digitado e transforma em minúsculo
  const termo = document.getElementById("filtroFabricante").value.toLowerCase();
  const lista = document.getElementById("listaFabricantes");
  const itens = lista.getElementsByTagName("div"); // Pega todos os cards de fabricante

  // Percorre a lista e esconde o que não combina
  for (let i = 0; i < itens.length; i++) {
    const nomeFabricante = itens[i].innerText.toLowerCase();

    if (nomeFabricante.includes(termo)) {
      itens[i].style.display = "flex"; // Mostra
    } else {
      itens[i].style.display = "none"; // Esconde
    }
  }
}

// Variável global para controle de validação
window.fabricanteValido = false;

async function buscarNomeFabricante(id) {
  const display = document.getElementById("nome_fabricante_preview");
  window.fabricanteValido = false; // Reseta a cada digitação

  if (!id) {
    display.innerText = "";
    return;
  }

  try {
    const { data, error } = await getSupa()
      .from("fabricantes")
      .select("nome")
      .eq("id", parseInt(id))
      .single();

    if (data && data.nome) {
      const primeiroNome = data.nome.split(" ")[0];
      display.innerText = primeiroNome.substring(0, 10);
      display.classList.remove("text-red-500");
      display.classList.add("text-emerald-500"); // Fica verde se achar
      window.fabricanteValido = true;
    } else {
      display.innerText = "NÃO ENCONTRADO";
      display.classList.remove("text-emerald-500");
      display.classList.add("text-red-500"); // Vermelho se não existir
      window.fabricanteValido = false;
    }
  } catch (err) {
    display.innerText = "ERRO";
    window.fabricanteValido = false;
  }
}

function validarFabricanteAntesDeSeguir(event) {
  if (!window.fabricanteValido) {
    event.preventDefault(); // Impede o envio do formulário/registro

    // Alerta moderno usando a estrutura de cores do seu sistema
    const msg = document.createElement("div");
    msg.innerHTML = `
            <div id="alert-fabricante" class="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 border-l-4 border-red-500 p-4 rounded shadow-2xl animate-bounce">
                <div class="flex items-center">
                    <i class="fa-solid fa-triangle-exclamation text-red-500 mr-3"></i>
                    <span class="text-white text-[11px] font-bold uppercase">Fabricante Inválido! Informe um ID cadastrado.</span>
                </div>
            </div>
        `;
    document.body.appendChild(msg);

    // Remove o alerta após 3 segundos
    setTimeout(() => {
      const alert = document.getElementById("alert-fabricante");
      if (alert) alert.remove();
    }, 3000);

    return false;
  }
}

function exibirAlertaErro(mensagem) {
  // Remove se já houver um alerta na tela para não acumular
  const alertaAntigo = document.getElementById("yase-alert-premium");
  if (alertaAntigo) alertaAntigo.remove();

  // Cria o container do Modal/Toast
  const modal = document.createElement("div");
  modal.id = "yase-alert-premium";

  // Estilização Premium (Tailwind)
  modal.className = `
        fixed top-8 left-1/2 -translate-x-1/2 z-[10000] 
        flex items-center gap-4 px-6 py-4
        bg-slate-900/90 backdrop-blur-xl
        border border-red-500/50 rounded-2xl
        shadow-[0_20px_50px_rgba(239,68,68,0.3)]
        animate-in fade-in zoom-in slide-in-from-top-8 duration-300
    `;

  modal.innerHTML = `
        <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <i class="fa-solid fa-triangle-exclamation text-red-500 text-lg"></i>
        </div>
        <div class="flex flex-col">
            <span class="text-[10px] font-black text-red-500 uppercase tracking-[2px]">Erro de Validação</span>
            <span class="text-white text-xs font-bold">${mensagem}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-4 text-slate-500 hover:text-white transition-colors">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

  document.body.appendChild(modal);

  // Remove automaticamente após 4 segundos com animação de saída
  setTimeout(() => {
    if (modal) {
      modal.classList.add(
        "animate-out",
        "fade-out",
        "zoom-out",
        "slide-out-to-top-8",
      );
      setTimeout(() => modal.remove(), 300);
    }
  }, 4000);
}

window.abrirModalFabricante = abrirModalFabricante;
window.fecharModalFabricante = fecharModalFabricante;
window.carregarFabricantes = carregarFabricantes;
window.renderizarListaFabricantes = renderizarListaFabricantes;
window.selecionarFabricante = selecionarFabricante;
window.cadastrarFabricante = cadastrarFabricante;
window.filtrarFabricantes = filtrarFabricantes;
window.buscarNomeFabricante = buscarNomeFabricante;
window.validarFabricanteAntesDeSeguir = validarFabricanteAntesDeSeguir;
window.exibirAlertaErro = exibirAlertaErro;
