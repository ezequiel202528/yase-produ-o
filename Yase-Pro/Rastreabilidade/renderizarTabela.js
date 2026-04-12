/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js - Versão Integral 2026
 */

// Garante acesso ao cliente Supabase global inicializado no main.js
const _supabase = window._supabase;

// 1. CARREGAMENTO E SINCRONIZAÇÃO
// async function carregarItens() {
//   try {
//     // Usa a variável global unificada
//     const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");

//     if (!osAtiva) {
//       console.error("OS não definida para carregamento");
//       return;
//     }

//     const { data, error } = await _supabase
//       .from("itens_os")
//       .select("*")
//       .eq("os_number", osAtiva)
//       .order("created_at", { ascending: true });

//     if (error) throw error;

//     // Atualiza o contador na sidebar
//     const contadorEl = document.getElementById("itemCounter");
//     if (contadorEl) contadorEl.innerText = data ? data.length : 0;

//     renderItens(data);
//   } catch (err) {
//     console.error("Erro ao carregar tabela:", err);
//   }
// }

// Variável global para rastrear a linha selecionada na sessão atual
let selectedRowIndex = -1;

// 1. CARREGAMENTO E SINCRONIZAÇÃO (Mantido conforme seu original)
async function carregarItens() {
  try {
    const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");
    if (!osAtiva) return;

    // Tenta carregar com o nome do fabricante (Join)
    let { data, error } = await _supabase
      .from("itens_os")
      .select("*, fabricantes(nome)")
      .eq("os_number", osAtiva)
      .order("created_at", { ascending: true });

    // SEGUNDA CHANCE: Se o Join falhar (erro de relação no banco), busca apenas os dados básicos
    if (error) {
      console.warn(
        "⚠️ Falha na relação de fabricantes. Renderizando apenas com IDs para manter estabilidade.",
        error,
      );
      const fallback = await _supabase
        .from("itens_os")
        .select("*")
        .eq("os_number", osAtiva)
        .order("created_at", { ascending: true });

      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    const contadorEl = document.getElementById("itemCounter");
    if (contadorEl) contadorEl.innerText = data ? data.length : 0;

    renderItens(data);

    // --- NOVIDADE: Após renderizar, seleciona a última e ativa cliques ---
    configurarCliquesTabela();
    destacarUltimaLinha();
  } catch (err) {
    console.error("Erro ao carregar tabela:", err);
  }
}

// Auxiliar para formatar datas na visualização
function fixData(v) {
  if (!v || v === "-" || v === "null") return "-";
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR");
  } catch (e) {
    return v;
  }
}

// Função para rolar até o último item registrado
const focarUltimoRegistro = () => {
  const tabelaBody = document.getElementById("itensList");
  if (!tabelaBody) return;

  const linhas = tabelaBody.querySelectorAll("tr");

  if (linhas.length > 0) {
    const ultimaLinha = linhas[linhas.length - 1];

    // Scroll suave até o final da lista
    ultimaLinha.scrollIntoView({ behavior: "smooth", block: "center" });

    // Limpa destaques de carregamentos anteriores
    tabelaBody.querySelectorAll("td").forEach((td) => {
      td.classList.remove("bg-blue-600/20", "border-y", "border-blue-500/50");
    });

    // Aplica o azul suave em todas as células (incluindo o ID fixo)
    ultimaLinha.querySelectorAll("td").forEach((td) => {
      td.classList.add("bg-blue-600/20", "border-y", "border-blue-500/50");
    });

    // Adiciona a borda lateral azul no ID para destaque visual
    ultimaLinha.classList.add("border-l-4", "border-blue-500");
  }
};

// 2. RENDERIZAÇÃO DA TABELA (ORDEM SOLICITADA)

// function renderItens(itens) {

//   const list = document.getElementById("itensList");
//   if (!list) return;

//   if (!itens || itens.length === 0) {
//     list.innerHTML = `<tr><td colspan="40" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
//     return;
//   }

//   // Função interna de formatação corrigida para Timezone e Data/Hora
//   const formatarDataLocal = (dataStr) => {
//     if (!dataStr || dataStr === "" || dataStr === "-" || dataStr === "null")
//       return "-";

//     // Se for apenas data (AAAA-MM-DD) - Comum em data_selagem
//     if (dataStr.length === 10) {
//       const [ano, mes, dia] = dataStr.split("-");
//       return `${dia}/${mes}/${ano}`;
//     }

//     // Se for timestamp com hora (created_at)
//     const d = new Date(dataStr);
//     if (isNaN(d.getTime())) return dataStr;

//     return d.toLocaleString("pt-BR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   list.innerHTML = itens
//     .map((item, index) => {
//       const s = (item.status_servico || "APROVADO").toUpperCase();
//       let classesStatus =
//         "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

//       if (s === "REPROVADO" || s === "REP") {
//         classesStatus = "bg-red-500/10 text-red-400 border-red-500/20";
//       } else if (s === "NOVO") {
//         classesStatus = "bg-amber-500/10 text-amber-400 border-amber-500/20";
//       }

//       const dataLancamento = formatarDataLocal(item.created_at);
//       const dataAlteracao = item.updated_at
//         ? formatarDataLocal(item.updated_at)
//         : "Sem alterações";
//       const dataSelagem = formatarDataLocal(item.data_selagem);

//       return `
//         <tr class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors whitespace-nowrap">
//       <td class="p-3 sticky left-0 z-[40] bg-[#0f172a] border-r border-slate-700 text-slate-500 font-bold group-hover:bg-[#1e293b] transition-colors">
//          ${index + 1}
//       </td>
//             <td class="p-3 font-black text-amber-500 bg-amber-500/5">
//                 ${item.prefixo_selo ? item.prefixo_selo + "-" : ""}${item.selo_inmetro ?? "-"}
//             </td>
//             <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
//             <td class="p-3">${item.nbr || "-"}</td>
//             <td class="p-3">${item.fabricante_id || "-"}</td>
//             <td class="p-3">${item.ano_fab || "-"}</td>
//             <td class="p-3">${item.ult_reteste || "-"}</td>
//             <td class="px-4 py-3 text-xs font-bold text-orange-500">${item.prox_reteste || "-"}</td>
//             <td class="p-3 text-amber-500 font-bold">${item.prox_recarga || "-"}</td>

//            <td class="p-3 font-bold text-indigo-400">
//               ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
//             </td>

//             <td class="p-3">${item.usuario_lancamento || "-"}</td>
//             <td class="p-3 text-center">${item.nivel_manutencao || "2"}</td>

//             <td class="p-3">
//                 <span class="px-2 py-0.5 rounded border font-bold text-[9px] ${classesStatus}">
//                     ${s}
//                 </span>
//             </td>

//             <td class="p-3 bg-orange-500/5 border-l border-slate-800">${item.p_vazio_valvula || "-"}</td>
//             <td class="p-3 bg-orange-500/5">${item.p_cheio_valvula || "-"}</td>
//             <td class="p-3 bg-orange-500/5 font-bold text-orange-300">${item.p_atual || "-"}</td>
//             <td class="p-3 bg-orange-500/5">${item.porcent_dif || "0"}%</td>

//             <td class="p-3 bg-emerald-500/5 border-l border-slate-800">${item.tara_cilindro || "-"}</td>
//             <td class="p-3 bg-emerald-500/5">${item.p_cil_vazio_kg || "-"}</td>
//             <td class="p-3 bg-emerald-500/5 text-emerald-400">${item.perda_massa_porcent || "0"}%</td>

//             <td class="p-3 bg-blue-500/5 border-l border-slate-800">${item.vol_litros || "-"}</td>
//             <td class="p-3 bg-blue-500/5">${item.dvh || "-"}</td>
//             <td class="p-3 bg-blue-500/5">${item.dvp || "-"}</td>
//             <td class="p-3 bg-blue-500/5">${item.ee || "-"}</td>

//             <td class="p-3 bg-red-500/5 border-l border-slate-800">${item.dvm_et || "-"}</td>
//             <td class="p-3 bg-red-500/5">${item.dvp_ep || "-"}</td>
//             <td class="p-3 bg-red-500/5">${item.ee_calculado || "-"}</td>
//             <td class="p-3 bg-red-500/5 font-bold text-red-400">${item.ep_porcent_final || "0"}%</td>

//             <td class="p-3 text-slate-400  text-[10px]">${dataLancamento}</td>
//             <td class="p-3  text-[10px]">${item.cod_barras || "-"}</td>
//             <td class="p-3">${item.lote_nitrogenio || "-"}</td>
//             <td class="p-3">${item.ampola_vinculada || "-"}</td>
//             <td class="p-3">${item.deposito_galpao || "-"}</td>
//             <td class="p-3 font-bold text-indigo-400 bg-indigo-500/5 text-center border-x border-slate-800/20">${item.num_patrimonio || "-"}</td>
//             <td class="p-3">${item.local_especifico || "-"}</td>

//             <td class="p-3 text-[9px] text-slate-500 italic ">${dataAlteracao}</td>
//             <td class="p-3 text-[9px] font-bold text-amber-600/80">${item.usuario_alteracao || "-"}</td>

//            <td class="p-3 sticky right-0 z-20 bg-[#0f172a] border-l border-slate-700 text-right pr-4 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b] transition-colors">
//                 <div class="flex gap-2 justify-end">
//                   <button onclick="prepararEdicao('${item.id}')" class="text-amber-500 hover:text-amber-400"><i class="fa-solid fa-pen-to-square"></i></button>
//                   <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>

// <button onclick="abrirModalInutilizar('${item.id}')" class="text-gray-400 hover:text-gray-300">
//     <i class="fa-solid fa-ban text-[10px]"></i>
// </button>
//                 </div>
//               </td>
//         </tr>`;
//     })
//     .join("");
// }
// function renderItens(itens) {
//   const list = document.getElementById("itensList");
//   if (!list) return;

//   if (!itens || itens.length === 0) {
//     list.innerHTML = `<tr><td colspan="40" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
//     return;
//   }

//   const formatarDataLocal = (dataStr) => {
//     if (!dataStr || dataStr === "" || dataStr === "-" || dataStr === "null") return "-";
//     if (dataStr.length === 10) {
//       const [ano, mes, dia] = dataStr.split("-");
//       return `${dia}/${mes}/${ano}`;
//     }
//     const d = new Date(dataStr);
//     if (isNaN(d.getTime())) return dataStr;
//     return d.toLocaleString("pt-BR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   list.innerHTML = itens
//     .map((item, index) => {
//       // 1. Pegamos o status (usando fallback para o que estiver no banco)
//       const s = (item.status || item.status_servico || "APROVADO").toUpperCase();

//       // 2. Definimos a cor da linha toda (se for Inutilizado, fica vermelho)
//       const corDaLinha = s === "INUTILIZADO" ? "text-red-500 font-bold" : "text-slate-300";

//       let classesStatus = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

//       if (s === "REPROVADO" || s === "REP" || s === "INUTILIZADO") {
//         classesStatus = "bg-red-500/10 text-red-400 border-red-500/20";
//       } else if (s === "NOVO") {
//         classesStatus = "bg-amber-500/10 text-amber-400 border-amber-500/20";
//       }

//       const dataLancamento = formatarDataLocal(item.created_at);
//       const dataAlteracao = item.updated_at ? formatarDataLocal(item.updated_at) : "Sem alterações";

//       // 3. Aplicamos a variável ${corDaLinha} na class da <tr>
//       return `
//         <tr class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors whitespace-nowrap ${corDaLinha}">
//       <td class="p-3 sticky left-0 z-[40] bg-[#0f172a] border-r border-slate-700 font-bold group-hover:bg-[#1e293b] transition-colors">
//          ${index + 1}
//       </td>
//             <td class="p-3 font-black text-amber-500 bg-amber-500/5">
//                 ${item.prefixo_selo ? item.prefixo_selo + "-" : ""}${item.selo_inmetro ?? "-"}
//             </td>
//             <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
//             <td class="p-3">${item.nbr || "-"}</td>
//             <td class="p-3">${item.fabricante_id || "-"}</td>
//             <td class="p-3">${item.ano_fab || "-"}</td>
//             <td class="p-3">${item.ult_reteste || "-"}</td>
//             <td class="px-4 py-3 text-xs font-bold text-orange-500">${item.prox_reteste || "-"}</td>
//             <td class="p-3 text-amber-500 font-bold">${item.prox_recarga || "-"}</td>

//             <td class="p-3 font-bold text-indigo-400">
//                ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
//             </td>

//             <td class="p-3">${item.usuario_lancamento || "-"}</td>
//             <td class="p-3 text-center">${item.nivel_manutencao || "2"}</td>

//             <td class="p-3">
//                 <span class="px-2 py-0.5 rounded border font-bold text-[9px] ${classesStatus}">
//                     ${s}
//                 </span>
//             </td>

//             <td class="p-3 bg-orange-500/5 border-l border-slate-800">${item.p_vazio_valvula || "-"}</td>
//             <td class="p-3 bg-orange-500/5">${item.p_cheio_valvula || "-"}</td>
//             <td class="p-3 bg-orange-500/5 font-bold text-orange-300">${item.p_atual || "-"}</td>
//             <td class="p-3 bg-orange-500/5">${item.porcent_dif || "0"}%</td>

//             <td class="p-3 bg-emerald-500/5 border-l border-slate-800">${item.tara_cilindro || "-"}</td>
//             <td class="p-3 bg-emerald-500/5">${item.p_cil_vazio_kg || "-"}</td>
//             <td class="p-3 bg-emerald-500/5 text-emerald-400">${item.perda_massa_porcent || "0"}%</td>

//             <td class="p-3 bg-blue-500/5 border-l border-slate-800">${item.vol_litros || "-"}</td>
//             <td class="p-3 bg-blue-500/5">${item.dvh || "-"}</td>
//             <td class="p-3 bg-blue-500/5">${item.dvp || "-"}</td>
//             <td class="p-3 bg-blue-500/5">${item.ee || "-"}</td>

//             <td class="p-3 bg-red-500/5 border-l border-slate-800">${item.dvm_et || "-"}</td>
//             <td class="p-3 bg-red-500/5">${item.dvp_ep || "-"}</td>
//             <td class="p-3 bg-red-500/5">${item.ee_calculado || "-"}</td>
//             <td class="p-3 bg-red-500/5 font-bold text-red-400">${item.ep_porcent_final || "0"}%</td>

//             <td class="p-3 text-slate-400  text-[10px]">${dataLancamento}</td>
//             <td class="p-3  text-[10px]">${item.cod_barras || "-"}</td>
//             <td class="p-4">${item.lote_nitrogenio || "-"}</td>
//             <td class="p-3">${item.ampola_vinculada || "-"}</td>
//             <td class="p-3">${item.deposito_galpao || "-"}</td>
//             <td class="p-3 font-bold text-indigo-400 bg-indigo-500/5 text-center border-x border-slate-800/20">${item.num_patrimonio || "-"}</td>
//             <td class="p-3">${item.local_especifico || "-"}</td>

//             <td class="p-3 text-[9px] text-slate-500 italic ">${dataAlteracao}</td>
//             <td class="p-3 text-[9px] font-bold text-amber-600/80">${item.usuario_alteracao || "-"}</td>

//            <td class="p-3 sticky right-0 z-20 bg-[#0f172a] border-l border-slate-700 text-right pr-4 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b] transition-colors">
//                 <div class="flex gap-2 justify-end">
//                   <button onclick="prepararEdicao('${item.id}')" class="text-amber-500 hover:text-amber-400"><i class="fa-solid fa-pen-to-square"></i></button>
//                   <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
//                   <button onclick="abrirModalInutilizar('${item.id}')" class="text-gray-400 hover:text-gray-300">
//                     <i class="fa-solid fa-ban text-[10px]"></i>
//                   </button>
//                 </div>
//               </td>
//         </tr>`;

//     })
//     .join("");
// }

// 2. RENDERIZAÇÃO DA TABELA (Ajustada para suportar a navegação)
/**
 * RASTREABILIDADE - YA SE PRO
 * renderizarTabela.js - Versão Integral com Navegação e Todas as Colunas
 */

function renderItens(itens) {
  const list = document.getElementById("itensList");
  if (!list) return;

  if (!itens || itens.length === 0) {
    list.innerHTML = `<tr><td colspan="40" class="p-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  const formatarDataLocal = (dataStr) => {
    if (!dataStr || dataStr === "" || dataStr === "-" || dataStr === "null")
      return "-";
    if (dataStr.length === 10) {
      const [ano, mes, dia] = dataStr.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return dataStr;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  list.innerHTML = itens
    .map((item, index) => {
      // 1. Definição de Status e Cores
      const s = (
        item.status ||
        item.status_servico ||
        "APROVADO"
      ).toUpperCase();
      const corDaLinha =
        s === "INUTILIZADO" ? "text-red-500 font-bold" : "text-slate-300";

      let classesStatus =
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (s === "REPROVADO" || s === "REP" || s === "INUTILIZADO") {
        classesStatus = "bg-red-500/10 text-red-400 border-red-500/20";
      } else if (s === "NOVO") {
        classesStatus = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }

      // --- AJUSTE AQUI: Variáveis dentro do MAP para ler cada item ---
      const dataLancamento = formatarDataLocal(item.created_at);
      const dataAlteracao = item.updated_at
        ? formatarDataLocal(item.updated_at)
        : "Sem alterações";
      const usuarioAlt = item.usuario_alteracao || "-";

      // Lógica Metódica: Prioriza o Nome vindo do Join, senão usa o ID
      let nomeExibicao = item.fabricante_id || "-";

      // Verifica se o Supabase trouxe o objeto relacionado (fabricantes ou fabricante)
      const relacaoFab = item.fabricantes || item.fabricante;
      if (relacaoFab) {
        const nomeBruto = Array.isArray(relacaoFab)
          ? relacaoFab[0]?.nome
          : relacaoFab.nome;
        if (nomeBruto) nomeExibicao = String(nomeBruto).toUpperCase();
      }
      return `
        <tr data-index="${index}" class="group text-[11px] border-b border-slate-800 hover:bg-slate-800/40 transition-colors whitespace-nowrap ${corDaLinha}">
          <td class="p-3 sticky left-0 z-[40] bg-[#0f172a] border-r border-slate-700 font-bold group-hover:bg-[#1e293b] transition-colors">
             ${index + 1}
          </td>
          <td class="p-3 font-black text-amber-500 bg-amber-500/5">
              ${item.prefixo_selo ? item.prefixo_selo + "-" : ""}${item.selo_inmetro ?? "-"}
          </td>
          <td class="p-3 font-bold text-slate-200">${item.nr_cilindro || "S/N"}</td>
          <td class="p-3 font-bold text-slate-300">${item.nbr || "-"}</td>
          <td class="p-3 font-bold text-slate-300">${nomeExibicao}</td>
          <td class="p-3">${item.ano_fab || "-"}</td>
          <td class="p-3">${item.ult_reteste || "-"}</td>
          <td class="px-4 py-3 text-xs font-bold text-orange-500">${item.prox_reteste || "-"}</td>
          <td class="p-3 text-amber-500 font-bold">${item.prox_recarga || "-"}</td>

          <td class="p-3 font-bold text-indigo-400">
              ${item.tipo_carga || "-"} / ${item.capacidade || "-"}
          </td>

          <td class="p-3">${item.usuario_lancamento || "-"}</td>
          <td class="p-3 text-center">${item.nivel_manutencao || "2"}</td>

          <td class="p-3">
              <span class="px-2 py-0.5 rounded border font-bold text-[9px] ${classesStatus}">
                  ${s}
              </span>
          </td>

          <td class="p-3 bg-orange-500/5 border-l border-slate-800">${item.p_vazio_valvula || "-"}</td>
          <td class="p-3 bg-orange-500/5">${item.p_cheio_valvula || "-"}</td>
          <td class="p-3 bg-orange-500/5 font-bold text-orange-300">${item.p_atual || "-"}</td>
          <td class="p-3 bg-orange-500/5">${item.porcent_dif || "0"}%</td>

          <td class="p-3 bg-emerald-500/5 border-l border-slate-800">${item.tara_cilindro || "-"}</td>
          <td class="p-3 bg-emerald-500/5">${item.p_cil_vazio_kg || "-"}</td>
          <td class="p-3 bg-emerald-500/5 text-emerald-400">${item.perda_massa_porcent || "0"}%</td>

          <td class="p-3 bg-blue-500/5 border-l border-slate-800">${item.vol_litros || "-"}</td>
          <td class="p-3 bg-blue-500/5">${item.dvh || "-"}</td>
          <td class="p-3 bg-blue-500/5">${item.dvp || "-"}</td>
          <td class="p-3 bg-blue-500/5">${item.ee || "-"}</td>

          <td class="p-3 bg-red-500/5 border-l border-slate-800">${item.dvm_et || "-"}</td>
          <td class="p-3 bg-red-500/5">${item.dvp_ep || "-"}</td>
          <td class="p-3 bg-red-500/5">${item.ee_calculado || "-"}</td>
          <td class="p-3 bg-red-500/5 font-bold text-red-400">${item.ep_porcent_final || "0"}%</td>

          <td class="p-3 text-slate-400 text-[10px]">${dataLancamento}</td>
          <td class="p-3 text-[10px]">${item.cod_barras || "-"}</td>
          <td class="p-4">${item.lote_nitrogenio || "-"}</td>
          <td class="p-3">${item.ampola_vinculada || "-"}</td>
          <td class="p-3">${item.deposito_galpao || "-"}</td>
          <td class="p-3 font-bold text-indigo-400 bg-indigo-500/5 text-center border-x border-slate-800/20">${item.num_patrimonio || "-"}</td>
          <td class="p-3">${item.local_especifico || item.local_extintor || "-"}</td>

          <td class="p-3 text-[9px] text-slate-500 italic">
            ${dataAlteracao}
          </td>

          <td class="p-3 text-[9px] font-bold text-amber-600/80">
            ${usuarioAlt}
          </td>

          <td class="p-3 sticky right-0 z-20 bg-[#0f172a] border-l border-slate-700 text-right pr-4 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] group-hover:bg-[#1e293b] transition-colors">
              <div class="flex gap-2 justify-end">
                <button onclick="prepararEdicao('${item.id}')" class="text-amber-500 hover:text-amber-400"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deletarItem('${item.id}')" class="text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
                <button onclick="abrirModalInutilizar('${item.id}')" class="text-gray-400 hover:text-gray-300">
                  <i class="fa-solid fa-ban text-[10px]"></i>
                </button>
              </div>
          </td>
        </tr>`;
    })
    .join("");
}

// 3. LÓGICA DE DESTAQUE E NAVEGAÇÃO
function destacarLinha(index) {
  const rows = document.querySelectorAll("#itensList tr");
  if (rows.length === 0) return;

  // Limita o índice
  if (index < 0) index = 0;
  if (index >= rows.length) index = rows.length - 1;

  // Remove destaques de todas as linhas
  rows.forEach((row) => {
    row.classList.remove(
      "row-highlight-active",
      "linha-recente",
      "border-l-4",
      "border-blue-500",
    );
    row
      .querySelectorAll("td")
      .forEach((td) =>
        td.classList.remove("bg-blue-600/20", "border-y", "border-blue-500/50"),
      );
  });

  // Aplica novo destaque
  const activeRow = rows[index];
  activeRow.classList.add(
    "row-highlight-active",
    "border-l-4",
    "border-blue-500",
  );
  activeRow
    .querySelectorAll("td")
    .forEach((td) =>
      td.classList.add("bg-blue-600/20", "border-y", "border-blue-500/50"),
    );

  selectedRowIndex = index;
  activeRow.scrollIntoView({ behavior: "smooth", block: "center" });
}

function configurarCliquesTabela() {
  const tableBody = document.getElementById("itensList");
  tableBody.onclick = (e) => {
    const row = e.target.closest("tr");
    if (row && row.dataset.index !== undefined) {
      destacarLinha(parseInt(row.dataset.index));
    }
  };
}

function destacarUltimaLinha() {
  const rows = document.querySelectorAll("#itensList tr");
  if (rows.length > 0) {
    destacarLinha(rows.length - 1);
  }
}

// 4. EVENTOS DE TECLADO (SETAS)
document.addEventListener("keydown", (e) => {
  // Evita mover se estiver digitando em campos
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    destacarLinha(selectedRowIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    destacarLinha(selectedRowIndex - 1);
  }
});

// async function registrarItem() {
//   // 1. RECUPERAÇÃO DE CONTEXTO
//   const empresaIdLogada = localStorage.getItem("empresa_id");
//   const nomeOperadorLogado = localStorage.getItem("nome_operador");
//   const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");

//   if (!validarAnoReteste()) return;

//   if (!empresaIdLogada || !osAtiva) {
//     alert("⚠️ Erro: Dados de login ou OS não encontrados.");
//     return;
//   }

//   try {
//     // 2. BUSCA O SELO REAL NO BANCO (O GATILHO DO FLASH)
//     // Chamamos uma vez só aqui no início do try
//     const checagem = await sincronizarPainelSelos();

//     // Se a função retornar que não pode gravar (lote vazio), paramos aqui
//     if (window.proximoSeloCalculado === undefined) {
//        alert("⚠️ Erro ao calcular próximo selo ou lote esgotado.");
//        return;
//     }

//     const seloNumParaGravar = window.proximoSeloCalculado;
//     const prefixoParaGravar = window.prefixoAtualSelo;

//     // Função auxiliar de limpeza
//     const limpar = (id, tipo = "text") => {
//       const el = document.getElementById(id);
//       if (!el) return null;
//       const val = el.value.trim();
//       if (val === "") return null;
//       return tipo === "num" ? parseFloat(val.replace(",", ".")) : val;
//     };

//     const checks = document.querySelectorAll(".custom-checkbox");
//     const textoReteste = document.getElementById("display_prox_reteste")?.innerText;
//     const textoRecarga = document.getElementById("display_prox_recarga")?.innerText;

//     // 3. MONTAGEM DO OBJETO DE DADOS
//     const dados = {

//       os_number: osAtiva,
//       empresa_id: empresaIdLogada,
//       usuario_lancamento: nomeOperadorLogado || "Técnico",

//       // ✅ SEQUÊNCIA CORRETA
//       selo_inmetro: seloNumParaGravar,
//       prefixo_selo: prefixoParaGravar,
//       cod_barras: "21" + seloNumParaGravar.toString().padStart(6, "0"),

//       nr_cilindro: limpar("nr_cilindro"),
//       num_patrimonio: limpar("N-Patrimonio") || limpar("pallet"),
//       fabricante_id: limpar("X_input_id", "num"),
//       nbr: limpar("nbr_select"),
//       tipo_carga: limpar("tipo_carga"),
//       capacidade: limpar("capacidade"),
//       ano_fab: limpar("ano_fab", "num"),
//       ult_reteste: limpar("ult_reteste", "num"),

//       prox_reteste: textoReteste && textoReteste !== "----" ? parseInt(textoReteste) : null,
//       prox_recarga: typeof converterDataBRparaISO === "function"
//         ? converterDataBRparaISO(textoRecarga)
//         : null,

//       p_vazio_valvula: limpar("p_vazio_valvula", "num"),
//       p_cheio_valvula: limpar("p_cheio_valvula", "num"),
//       p_atual: limpar("p_atual", "num"),
//       tara_cilindro: limpar("tara_cilindro", "num"),
//       p_cil_vazio_kg: limpar("p_cil_vazio_kg", "num"),
//       vol_litros: limpar("vol_litros", "num"),
//       dvm_et: limpar("dvm_et", "num"),
//       dvp_ep: limpar("dvp_ep", "num"),

//       nivel_manutencao: window.selectedLevel || 2,
//       status_servico: document.getElementById("resultado_valor")?.value || "APROVADO",
//       lote_nitrogenio: limpar("lote_nitrogenio"),
//       ampola_vinculada: limpar("ampola_vinculada"),
//       deposito_galpao: limpar("deposito_galpao"),
//       local_extintor: limpar("local_extintor"),
//     };

//     // 4. MAPEAMENTO DE COMPONENTES
//     const listaComp = ["pistola","valvula","bucha","sifao","punho_pino","quebra_jato","manometro","mangueira","cord_plastico","saia_plastica","conj_apague","difusor","pera_ved","mola_rosca","conj_miolo","conj_haste","anel_oring","sifao_aluminio","conj_seguranca","haste_valvula","gancho_sup","trava_corrente"];
//     listaComp.forEach(item => {
//       const el = document.getElementById(`comp_${item}`);
//       dados[`comp_${item}`] = el ? el.checked : false;
//     });

//     // 5. SALVAMENTO
//     let resultado;
//     if (window.editandoID) {
//       resultado = await _supabase.from("itens_os").update(dados).eq("id", window.editandoID);
//     } else {
//       resultado = await _supabase.from("itens_os").insert([dados]);
//     }

//     if (resultado.error) throw resultado.error;

//     // 6. SUCESSO - O FLASH DE LUZ ESTÁ AQUI
//     console.log("Item salvo! Selo:", seloNumParaGravar);

//     await carregarItens();
//     focarUltimoRegistro();
//     limparCamposAposRegistro();

//     // ✅ CHAMADA CRÍTICA: Atualiza o contador de 995 para 994 (ou vice-versa)
//     if (typeof sincronizarPainelSelos === "function") {
//         await sincronizarPainelSelos();
//     }

//     // Se houver função de resetar botão de edição
//     if (typeof resetarBotaoRegistro === "function") resetarBotaoRegistro();

//   } catch (err) {
//     console.error("Erro no salvamento:", err);
//     alert("Erro ao salvar: " + (err.message || "Erro desconhecido."));
//   }
// }

async function registrarItem() {
  // 1. RECUPERAÇÃO DE CONTEXTO
  const empresaIdLogada = localStorage.getItem("empresa_id");
  const nomeOperadorLogado = localStorage.getItem("nome_operador");
  const osAtiva = window.currentOS || sessionStorage.getItem("currentOS");

  if (window.fabricanteValido === false) {
    exibirAlertaErro("ID do Fabricante não encontrado no banco de dados.");

    const inputFab = document.getElementById("X_input_id");
    if (inputFab) {
      inputFab.focus();
      inputFab.classList.add("input-error-shake");
      // Remove a classe de erro após 2 segundos para o usuário tentar de novo
      setTimeout(() => inputFab.classList.remove("input-error-shake"), 2000);
    }
    return;
  }

  if (!validarAnoReteste()) return;

  if (!empresaIdLogada || !osAtiva) {
    alert("⚠️ Erro: Dados de login ou OS não encontrados.");
    return;
  }

  try {
    // 2. BUSCA O SELO REAL NO BANCO (O GATILHO DO FLASH)
    if (typeof window.sincronizarPainelSelos === "function") {
      await window.sincronizarPainelSelos();
    }

    // Validação de segurança para novo registro
    if (!window.proximoSeloCalculado && !window.editandoID) {
      alert("⚠️ Sistema de controle de selos não inicializado.");
      return;
    }

    const seloNumParaGravar = window.proximoSeloCalculado;
    const prefixoParaGravar = window.prefixoAtualSelo;

    // Função auxiliar de limpeza
    const limpar = (id, tipo = "text") => {
      const el = document.getElementById(id);
      if (!el) return null;
      const val = el.value.trim();
      if (val === "") return null;
      return tipo === "num" ? parseFloat(val.replace(",", ".")) : val;
    };

    const checks = document.querySelectorAll(".custom-checkbox");
    const textoReteste = document.getElementById(
      "display_prox_reteste",
    )?.innerText;
    const textoRecarga = document.getElementById(
      "display_prox_recarga",
    )?.innerText;

    // 3. MONTAGEM DO OBJETO DE DADOS
    const dados = {
      os_number: osAtiva,
      empresa_id: empresaIdLogada,
      usuario_lancamento: window.editandoID
        ? undefined
        : nomeOperadorLogado || "Sistema",
      usuario_alteracao: nomeOperadorLogado || "Sistema",
      updated_at: new Date().toISOString(),
      selo_inmetro: seloNumParaGravar,
      prefixo_selo: prefixoParaGravar,
      cod_barras: "21" + seloNumParaGravar.toString().padStart(6, "0"),

      nr_cilindro: limpar("nr_cilindro"),
      num_patrimonio: limpar("N-Patrimonio") || limpar("pallet"),
      fabricante_id: limpar("X_input_id", "num"),
      nbr: limpar("nbr_select"),
      tipo_carga: limpar("tipo_carga"),
      capacidade: limpar("capacidade"),
      ano_fab: limpar("ano_fab", "num"),
      ult_reteste: limpar("ult_reteste", "num"),

      prox_reteste:
        textoReteste && textoReteste !== "----" ? parseInt(textoReteste) : null,
      prox_recarga:
        typeof converterDataBRparaISO === "function"
          ? converterDataBRparaISO(textoRecarga)
          : null,

      p_vazio_valvula: limpar("p_vazio_valvula", "num"),
      p_cheio_valvula: limpar("p_cheio_valvula", "num"),
      p_atual: limpar("p_atual", "num"),
      tara_cilindro: limpar("tara_cilindro", "num"),
      p_cil_vazio_kg: limpar("p_cil_vazio_kg", "num"),
      vol_litros: limpar("vol_litros", "num"),
      dvm_et: limpar("dvm_et", "num"),
      dvp_ep: limpar("dvp_ep", "num"),

      nivel_manutencao: window.selectedLevel || 2,
      status_servico:
        document.getElementById("resultado_valor")?.value || "APROVADO",
      lote_nitrogenio: limpar("lote_nitrogenio"),
      ampola_vinculada: limpar("ampola_vinculada"),
      deposito_galpao: limpar("deposito_galpao"),
      local_extintor: limpar("local_extintor"),
    };

    // 4. MAPEAMENTO DE COMPONENTES
    const listaComp = [
      "pistola",
      "valvula",
      "bucha",
      "sifao",
      "punho_pino",
      "quebra_jato",
      "manometro",
      "mangueira",
      "cord_plastico",
      "saia_plastica",
      "conj_apague",
      "difusor",
      "pera_ved",
      "mola_rosca",
      "conj_miolo",
      "conj_haste",
      "anel_oring",
      "sifao_aluminio",
      "conj_seguranca",
      "haste_valvula",
      "gancho_sup",
      "trava_corrente",
    ];
    listaComp.forEach((item) => {
      const el = document.getElementById(`comp_${item}`);
      dados[`comp_${item}`] = el ? el.checked : false;
    });

    // 5. SALVAMENTO
    let resultado;
    if (window.editandoID) {
      resultado = await _supabase
        .from("itens_os")
        .update(dados)
        .eq("id", window.editandoID);
    } else {
      resultado = await _supabase.from("itens_os").insert([dados]);
    }

    if (resultado.error) throw resultado.error;

    // 6. SUCESSO
    console.log("Item salvo! Selo:", seloNumParaGravar);

    await carregarItens();
    focarUltimoRegistro();
    limparCamposAposRegistro();

    if (typeof window.sincronizarPainelSelos === "function") {
      await window.sincronizarPainelSelos();
    }

    if (typeof window.resetarBotaoRegistro === "function") {
      window.resetarBotaoRegistro();
    }
  } catch (err) {
    console.error("Erro no salvamento:", err);
    alert("Erro ao salvar: " + (err.message || "Erro desconhecido."));
  }
}

function converterDataBRparaISO(dataBR) {
  if (
    !dataBR ||
    dataBR === "----" ||
    dataBR.includes("undefined") ||
    dataBR.length < 8
  )
    return null;
  const partes = dataBR.trim().split("/");
  if (partes.length !== 3) return null;
  const [d, m, a] = partes;
  return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function limparCamposAposRegistro() {
  console.log("Executando limpeza completa...");

  // 1. Limpa todos os Inputs e Selects da lista
  const idsParaLimpar = [
    "X_input_id",
    "ano_fab",
    "nr_cilindro",
    "ult_reteste",
    "tipo_carga",
    "capacidade",
    "nbr_select",
    "lote_nitrogenio",
    "ampola_vinculada",
    "selo_anterior",
    "data_selagem",
    "cod_barras",
    "deposito_galpao",
    "N-Patrimonio",
    "local_extintor",
    "resultado_valor",
    "obs_ensaio",
    "p_vazio_valvula",
    "p_cheio_valvula",
    "p_atual",
    "porcent_dif",
    "tara_cilindro",
    "p_cil_vazio_kg",
    "perda_massa_porcent",
    "vol_litros",
    "dvm_et",
    "dvp_ep",
    "ee_resultado",
    "et_ensaio",
    "ep_ensaio",
    "ee_calculado",
    "ep_porcent_final",
  ];

  idsParaLimpar.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // 2. O PULO DO GATO: Limpar os campos de exibição (os que você circulou)
  // Usamos innerText porque eles não são inputs de digitação
  const displayRecarga = document.getElementById("display_prox_recarga");
  const displayReteste = document.getElementById("display_prox_reteste");
  const displayFabricante = document.getElementById("nome_fabricante_preview");

  if (displayRecarga) {
    displayRecarga.innerText = "--/--/----"; // Limpa o campo Azul
  }
  if (displayReteste) {
    displayReteste.innerText = "----"; // Limpa o campo Vermelho
  }
  if (displayFabricante) {
    displayFabricante.innerText = ""; // Limpa o nome do fabricante
  }

  // 3. Reset dos Checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    if (cb.id !== "switchEtiqueta") {
      cb.checked = false;
    }
  });

  // 4. Reset do Badge de componentes
  const badgeComp = document.getElementById("badge-comp");
  if (badgeComp) {
    badgeComp.innerText = "0";
    badgeComp.classList.add("hidden");
  }

  // 5. Reset de Estado (Nível 2 padrão)
  window.editandoID = null;
  window.fabricanteValido = false;
  if (typeof setLevel === "function") {
    setLevel(2);
  }

  // 6. Foco no primeiro campo para iniciar novo registro
  setTimeout(() => {
    document.getElementById("X_input_id")?.focus();
  }, 100);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    // Ignora a navegação automática se o usuário estiver dentro de qualquer Modal
    if (e.target.closest(".fixed") || e.target.closest("[id^='modal']")) return;

    // Ignora botões e áreas de texto
    if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA")
      return;

    const sequence = [
      "cod_barras",
      "X_input_id",
      "nr_cilindro",
      "ano_fab",
      "ult_reteste",
      "tipo_carga",
      "capacidade",
      "nbr_select",
      "lote_nitrogenio",
      "ampola_vinculada",
      "data_selagem",
      "selo_anterior",
      "pallet",
      "deposito_galpao",
      "local_extintor",

      // GRUPO PESAGEM
      "p_vazio_valvula",
      "p_cheio_valvula",
      "p_atual",
      "porcent_dif", // <-- Adicionado (Visualização)

      // GRUPO PERDA DE MASSA
      "tara_cilindro",
      "p_cil_vazio_kg",
      "perda_massa_porcent", // <-- Adicionado (Visualização)

      // GRUPO CUBAGEM
      "vol_litros",
      "dvm_et",
      "dvp_ep",
      "ee_resultado", // <-- Adicionado (Visualização)

      // GRUPO HIDROSTÁTICO
      "et_ensaio",
      "ep_ensaio",
      "ee_calculado",
      "ep_porcent_final", // <-- Adicionado (Visualização)
    ];

    const currentIndex = sequence.indexOf(e.target.id);

    if (currentIndex !== -1) {
      e.preventDefault();

      for (let i = currentIndex + 1; i < sequence.length; i++) {
        const nextField = document.getElementById(sequence[i]);

        if (nextField && nextField.offsetParent !== null) {
          nextField.focus();

          // Se o campo for readonly (como as porcentagens), apenas foca para conferência
          // Se for input normal, seleciona o texto.
          if (nextField.tagName === "INPUT" && !nextField.readOnly) {
            nextField.select();
          }
          return;
        }
      }

      // Ao final de tudo, foca no botão REGISTRAR
      const btnRegistrar = document.querySelector(
        'button[onclick="registrarItem()"]',
      );
      if (btnRegistrar) btnRegistrar.focus();
    }
  }
});

window.carregarItens = carregarItens;
window.focarUltimoRegistro = focarUltimoRegistro;
window.renderItens = renderItens;
window.destacarLinha = destacarLinha;
window.configurarCliquesTabela = configurarCliquesTabela;
window.destacarUltimaLinha = destacarUltimaLinha;
window.registrarItem = registrarItem;
window.converterDataBRparaISO = converterDataBRparaISO;
window.limparCamposAposRegistro = limparCamposAposRegistro;

// --- VERIFICAÇÃO DE SEGURANÇA DO LOTE (COLE NO FIM DO ARQUIVO) ---
// async function verificarDisponibilidadeSeloRealtime() {
//   try {
//     // 1. Busca o lote aberto (Garanta que rem_essas esteja em minúsculo)
//     const { data: lote, error: erroLote } = await _supabase
//       .from("rem_essas")
//       .select("qtd_selos, prefixo, selo_inicio")
//       .eq("status_lote", "ABERTO")
//       .maybeSingle();

//     if (erroLote) {
//       console.error("Erro na tabela rem_essas:", erroLote.message);
//       return {
//         podeGravar: false,
//         motivo: "Erro ao acessar tabela de remessas.",
//       };
//     }

//     if (!lote) {
//       return {
//         podeGravar: false,
//         motivo: "Nenhum lote de selos ABERTO encontrado!",
//       };
//     }

//     // 2. Conta os itens (Garanta que itens_os e prefixo_selo estejam em minúsculo)
//     const { count: usados, error: erroContagem } = await _supabase
//       .from("itens_os")
//       .select("id", { count: "exact", head: true })
//       .eq("prefixo_selo", lote.prefixo);

//     if (erroContagem) {
//       console.error("Erro na tabela itens_os:", erroContagem.message);
//       return {
//         podeGravar: false,
//         motivo: "Tabela itens_os ou coluna prefixo_selo não encontrada.",
//       };
//     }

//     const disponiveis = lote.qtd_selos - (usados || 0);
//     return {
//       podeGravar: disponiveis > 0,
//       motivo: disponiveis <= 0 ? "Limite de selos atingido!" : "",
//     };
//   } catch (err) {
//     console.error("Erro inesperado:", err);
//     return { podeGravar: false, motivo: "Falha de comunicação com o banco." };
//   }
// }
