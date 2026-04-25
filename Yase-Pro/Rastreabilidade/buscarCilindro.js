const getSupabase = () =>
  window._supabase ||
  window.supabase.createClient(
    "https://gzojpxgpgjapsegerscb.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b2pweGdwZ2phcHNlZ2Vyc2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc2MzUsImV4cCI6MjA4NTQ1MzYzNX0.vSaIuKyEuzNEGxFsawugLwtUpwWqYpCMP_a3JfWrY5s",
  );

/**
 * Busca informações técnicas de um cilindro no banco de dados.
 */
async function buscarCilindro() {
  const _supabase = getSupabase();
  const nrCilindro = document.getElementById("nr_cilindro").value.trim();
  const osAtual = document.getElementById("osBadgeNumber").innerText;

  if (!nrCilindro) {
    alert("Por favor, digite o número do cilindro.");
    return;
  }

  try {
    // 1. Tenta buscar na OS Atual primeiro para evitar duplicidade ou permitir edição
    const { data: itemLocal } = await _supabase
      .from("itens_os")
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
    const { data: itemGlobal } = await _supabase
      .from("itens_os")
      .select("os_vinculada, data_lancamento")
      .eq("nr_cilindro", nrCilindro)
      .order("data_lancamento", { ascending: false })
      .limit(1)
      .single();

    if (itemGlobal) {
      alert(
        `Cilindro encontrado na OS: ${itemGlobal.os_vinculada}\nData do último registro: ${new Date(itemGlobal.data_lancamento).toLocaleDateString()}`,
      );
    } else {
      alert("Cilindro não encontrado em nenhuma Ordem de Serviço.");
    }
  } catch (err) {
    console.error("Erro na busca:", err);
    alert("Erro ao consultar o banco de dados.");
  }
}

/**
 * Preenche os campos do formulário com dados de um cilindro encontrado.
 */
function preencherCampos(item) {
  document.getElementById("cod_barras").value = item.cod_barras || "";
  document.getElementById("ano_fab").value = item.ano_fab || "";
  document.getElementById("ult_reteste").value = item.ult_reteste || "";
  document.getElementById("tipo_carga").value = item.tipo_carga || "";
}

/**
 * Abre o modal de busca de cilindros.
 */
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

/**
 * Fecha o modal de busca de cilindros.
 */
function fecharModalBusca() {
  const modal = document.getElementById("modalBuscaCilindro");
  if (modal) {
    document.getElementById("inputBuscaModal").blur();
    modal.classList.add("hidden");
    document.getElementById("inputBuscaModal").value = "";
  }
}

/**
 * Executa a busca de um cilindro dentro do modal e destaca na tabela caso pertença à OS atual.
 */
async function executarBuscaModal() {
  const _supabase = getSupabase();
  const nrCilindroBusca = document
    .getElementById("inputBuscaModal")
    .value.trim();
  const osAtual = window.currentOS || sessionStorage.getItem("currentOS");

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
        const tbody = document.getElementById("itensList");
        const linhas = tbody.querySelectorAll("tr");
        let linhaParaDestacar = null;

        linhas.forEach((linha) => {
          if (linha.innerText.includes(nrCilindroBusca)) {
            linhaParaDestacar = linha;
          }
        });

        if (linhaParaDestacar) {
          document.querySelectorAll(".row-highlight-active").forEach((el) => {
            el.classList.remove("row-highlight-active");
          });
          linhaParaDestacar.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          linhaParaDestacar.classList.add("row-highlight-active");
          const removerAoClicarFora = (e) => {
            // Se o clique não foi na própria linha, remove o destaque
            if (!linhaParaDestacar.contains(e.target)) {
              linhaParaDestacar.classList.remove("row-highlight-active");
              document.removeEventListener("click", removerAoClicarFora);
            }
          };

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

/**
 * Renderiza os resultados da busca e aplica efeitos visuais na tabela.
 */
function exibirResultadosBusca(resultados, osAtual) {
  if (resultados && resultados.length > 0) {
    const item = resultados[0];

    if (String(item.os_number) === String(osAtual)) {
      fecharModalBusca();
      const todasAsLinhas = document.querySelectorAll("tr");
      let linhaEncontrada = null;
      todasAsLinhas.forEach((linha) => {
        if (linha.innerText.includes(item.nr_cilindro)) {
          linhaEncontrada = linha;
        }
      });
      if (linhaEncontrada) {
        linhaEncontrada.scrollIntoView({ behavior: "smooth", block: "center" });
        linhaEncontrada.classList.add("row-highlight");
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
