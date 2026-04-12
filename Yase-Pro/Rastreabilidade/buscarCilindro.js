// Garante acesso ao cliente Supabase global
const _supabase = window._supabase;

async function buscarCilindro() {
  const nrCilindro = document.getElementById("nr_cilindro").value.trim();
  const osAtual = document.getElementById("osBadgeNumber").innerText; // Pega o número da OS carregada

  if (!nrCilindro) {
    alert("Por favor, digite o número do cilindro.");
    return;
  }

  try {
    // 1. Tenta buscar na OS Atual primeiro para evitar duplicidade ou permitir edição
    const { data: itemLocal, error: errorLocal } = await _supabase
      .from("itens_rastreio") // Nome da sua tabela no Supabase
      .select("*")
      .eq("nr_cilindro", nrCilindro)
      .eq("os_vinculada", osAtual)
      .single();

    if (itemLocal) {
      preencherCampos(itemLocal);
      alert("Item encontrado nesta Ordem de Serviço.");
      return;
    }

    // 2. Se não achou na atual, busca em todo o histórico (Global)
    const { data: itemGlobal, error: errorGlobal } = await _supabase
      .from("itens_rastreio")
      .select("os_vinculada, data_lancamento")
      .eq("nr_cilindro", nrCilindro)
      .order("data_lancamento", { ascending: false })
      .limit(1)
      .single();

    if (itemGlobal) {
      alert(
        `Cilindro encontrado na OS: ${itemGlobal.os_vinculada}\nData do último registro: ${new Date(itemGlobal.data_lancamento).toLocaleDateString()}`,
      );
      // Opcional: Redirecionar ou perguntar se deseja importar os dados técnicos
    } else {
      alert("Cilindro não encontrado em nenhuma Ordem de Serviço.");
    }
  } catch (err) {
    console.error("Erro na busca:", err);
    alert("Erro ao consultar o banco de dados.");
  }
}

// Função auxiliar para popular o formulário se achar na OS atual
function preencherCampos(item) {
  document.getElementById("cod_barras").value = item.cod_barras || "";
  document.getElementById("ano_fab").value = item.ano_fab || "";
  document.getElementById("ult_reteste").value = item.ult_reteste || "";
  document.getElementById("tipo_carga").value = item.tipo_carga || "";
  // Adicione os demais campos conforme sua necessidade...
}

// Funções para Controle do Modal de Busca
function abrirModalBusca() {
  const modal = document.getElementById("modalBuscaCilindro");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    const input = document.getElementById("inputBuscaModal");
    input.value = "";
    input.focus();
  }
}

function fecharModalBusca() {
  const modal = document.getElementById("modalBuscaCilindro");
  if (modal) modal.classList.add("hidden");
}

async function executarBuscaModal() {
  const nrCilindroBusca = document
    .getElementById("inputBuscaModal")
    .value.trim();
  const osAtual = window.currentOS;

  if (!nrCilindroBusca) return;

  try {
    const { data: resultados, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("nr_cilindro", nrCilindroBusca)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (resultados && resultados.length > 0) {
      const item = resultados[0];
      fecharModalBusca();

      if (String(item.os_number) === String(osAtual)) {
        // 1. Localiza a linha na tabela
        const tbody = document.getElementById("itensList");
        const linhas = tbody.querySelectorAll("tr");
        let linhaParaDestacar = null;

        linhas.forEach((linha) => {
          // Procura o número do cilindro no texto da linha
          if (linha.innerText.includes(nrCilindroBusca)) {
            linhaParaDestacar = linha;
          }
        });

        if (linhaParaDestacar) {
          // 2. Limpa qualquer destaque anterior antes de aplicar o novo
          document.querySelectorAll(".row-highlight-active").forEach((el) => {
            el.classList.remove("row-highlight-active");
          });

          // 3. Rola e destaca
          linhaParaDestacar.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          linhaParaDestacar.classList.add("row-highlight-active");

          // 4. LÓGICA DE REMOÇÃO: Remove ao clicar fora
          const removerAoClicarFora = (e) => {
            // Se o clique não foi na própria linha, remove o destaque
            if (!linhaParaDestacar.contains(e.target)) {
              linhaParaDestacar.classList.remove("row-highlight-active");
              document.removeEventListener("click", removerAoClicarFora);
            }
          };

          // Ativa o ouvinte com um pequeno atraso
          setTimeout(() => {
            document.addEventListener("click", removerAoClicarFora);
          }, 200);
        } else {
          alert(
            `✅ Localizado na OS ${osAtual}, mas não está visível na tabela.`,
          );
        }
      } else {
        alert(`📍 Cilindro em outra OS: ${item.os_number}`);
      }
    } else {
      alert(`🔍 Cilindro ${nrCilindroBusca} não encontrado.`);
    }
  } catch (err) {
    console.error(err);
    alert("Erro na busca.");
  }
}

function exibirResultadosBusca(resultados, osAtual) {
  if (resultados && resultados.length > 0) {
    const item = resultados[0];

    // Verifica se pertence à OS que você está trabalhando
    if (String(item.os_number) === String(osAtual)) {
      fecharModalBusca();

      // Tenta encontrar a linha na tabela pelo número do cilindro
      // Nota: Isso depende de você ter o nr_cilindro em algum lugar da linha ou um ID nela
      const todasAsLinhas = document.querySelectorAll("tr");
      let linhaEncontrada = null;

      todasAsLinhas.forEach((linha) => {
        if (linha.innerText.includes(item.nr_cilindro)) {
          linhaEncontrada = linha;
        }
      });

      if (linhaEncontrada) {
        // 1. Faz a tela rolar suavemente até o item
        linhaEncontrada.scrollIntoView({ behavior: "smooth", block: "center" });

        // 2. Aplica o efeito visual
        linhaEncontrada.classList.add("row-highlight");

        // 3. Remove a classe depois de 3 segundos para poder repetir o efeito depois
        setTimeout(() => {
          linhaEncontrada.classList.remove("row-highlight");
        }, 3000);
      } else {
        alert(
          `✅ Este cilindro está nesta OS, mas a linha não foi renderizada na tabela.`,
        );
      }
    } else {
      alert(`📍 Cilindro localizado em outra OS!\n\nNº OS: ${item.os_number}`);
      fecharModalBusca();
    }
  } else {
    alert("🔍 Nenhum registro encontrado para este cilindro.");
  }
}

window.buscarCilindro = buscarCilindro;
window.preencherCampos = preencherCampos;
window.abrirModalBusca = abrirModalBusca;
window.fecharModalBusca = fecharModalBusca;
window.executarBuscaModal = executarBuscaModal;
window.exibirResultadosBusca = exibirResultadosBusca;
