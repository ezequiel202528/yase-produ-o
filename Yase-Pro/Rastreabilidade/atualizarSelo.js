/**
 * RASTREABILIDADE - YA SE PRO
 * Sincronização do Contador de Selos em Tempo Real
 */

// Garante acesso ao cliente Supabase global
const _supabase = window._supabase;

// async function sincronizarPainelSelos() {
//     const elLote = document.getElementById('lote_documento');
//     const elSeloProx = document.getElementById('proximo_selo_num');
//     const elQtd = document.getElementById('qtd_restante_texto');
//     const barra = document.getElementById('barra_progresso_selo');

//     try {
//         // 1. Busca o lote aberto no Supabase
//         const { data: lote, error: erroLote } = await _supabase
//             .from('rem_essas')
//             .select('*')
//             .eq('status_lote', 'ABERTO')
//             .maybeSingle();

//         if (erroLote || !lote) {
//             exibirDadosVazios();
//             return;
//         }

//         // 2. Busca os selos já usados para este prefixo
//         const { data: itens, error: erroItens } = await _supabase
//             .from('itens_os')
//             .select('selo_inmetro') // Nome correto da coluna no seu banco
//             .eq('prefixo_selo', lote.prefixo);

//         if (erroItens) throw erroItens;

//         // 3. Processamento dos números
//         const selosUsados = new Set(itens.map(i => parseInt(i.selo_inmetro)).filter(n => !isNaN(n)));
//         const seloInicial = parseInt(lote.selo_inicio);
//         const qtdTotalLote = parseInt(lote.qtd_selos);

//         // Acha o próximo número vago na sequência
//         let proximo = seloInicial;
//         while (selosUsados.has(proximo)) {
//             proximo++;
//         }

//         // Cálculo da quantidade real restante
//         const realRestante = qtdTotalLote - selosUsados.size;

//         // 4. ATUALIZAÇÃO DO HTML (Onde o "flash" acontece)
//         if (elLote) elLote.innerHTML = `LOTE: <span class="text-amber-500 font-black">${lote.prefixo}</span>`;
//         if (elSeloProx) elSeloProx.innerText = proximo;

//         if (elQtd) {
//             elQtd.innerText = realRestante; // Atualiza o 995
//         }

//         // 5. Atualiza a barra de progresso
//         if (barra) {
//             const porcentagem = (realRestante / qtdTotalLote) * 100;
//             barra.style.width = `${porcentagem}%`;
//         }

//         // Guarda em memória global para o registrarItem usar
//         window.prefixoAtualSelo = lote.prefixo;
//         window.proximoSeloCalculado = proximo;

//         // Chama o bloqueio se acabar
//         if (typeof aplicarBloqueioSistema === "function") {
//             aplicarBloqueioSistema(realRestante);
//         }

//     } catch (err) {
//         console.error("Erro na sincronização do painel:", err);
//     }
// }

async function sincronizarPainelSelos() {
  const elLote = document.getElementById("lote_documento");
  const elSeloProx = document.getElementById("proximo_selo_num");
  const elQtd = document.getElementById("qtd_restante_texto");

  try {
    // 1. Procura o lote aberto
    const { data: lote, error: erroLote } = await _supabase
      .from("rem_essas")
      .select("*")
      .eq("status_lote", "ABERTO")
      .maybeSingle();

    if (erroLote || !lote) {
      if (elLote) elLote.innerText = "NENHUM LOTE ATIVO";
      return;
    }

    // 2. Busca os selos usados (IMPORTANTE: selo_inmetro)
    const { data: itens, error: erroItens } = await _supabase
      .from("itens_os")
      .select("selo_inmetro")
      .eq("prefixo_selo", lote.prefixo);

    if (erroItens) throw erroItens;

    // 3. Filtra e organiza os números
    const selosUsados = new Set(
      itens.map((i) => parseInt(i.selo_inmetro)).filter((n) => !isNaN(n)),
    );
    const seloInicial = parseInt(lote.selo_inicio);
    const qtdTotal = parseInt(lote.qtd_selos);

    // 4. Acha o próximo vago (Recupera excluídos)
    let proximo = seloInicial;
    while (selosUsados.has(proximo)) {
      proximo++;
    }

    const restante = qtdTotal - selosUsados.size;

    // 5. ATUALIZA A TELA (O Flash)
    if (elLote)
      elLote.innerHTML = `LOTE: <span class="text-amber-500 font-black">${lote.prefixo}</span>`;
    if (elSeloProx) elSeloProx.innerText = proximo;
    if (elQtd) elQtd.innerText = restante;

    // Guarda globalmente para o registrarItem.js
    window.proximoSeloCalculado = proximo;
    window.prefixoAtualSelo = lote.prefixo;

    if (typeof aplicarBloqueioSistema === "function")
      aplicarBloqueioSistema(restante);
  } catch (err) {
    console.error("Erro na sincronização:", err);
  }
}

function exibirDadosVazios() {
  const elLote = document.getElementById("lote_documento");
  const elQtd = document.getElementById("qtd_restante_texto");
  if (elLote) elLote.innerText = "NENHUM LOTE ATIVO";
  if (elQtd) elQtd.innerText = "0";
}

// Inicia ao carregar a página
document.addEventListener("DOMContentLoaded", sincronizarPainelSelos);

// atualizarSelo.js - FUNÇÃO COMPLETA
function aplicarBloqueioSistema(quantidade) {
  const isBloqueado = quantidade <= 0;

  const barra = document.getElementById("barra_progresso_selo");
  const totalLote = 100; // Substitua pelo valor real vindo do seu banco/lote
  const porcentagem = Math.min((quantidade / totalLote) * 100, 100);

  if (barra) {
    barra.style.width = `${porcentagem}%`;

    // Opcional: Mudar a cor se estiver acabando
    if (porcentagem < 10) {
      barra.classList.replace("bg-amber-500", "bg-red-500");
    } else {
      barra.classList.replace("bg-red-500", "bg-amber-500");
    }
  }

  // Seleciona o botão de registro (baseado no seu HTML)
  const btnRegistrar = document.querySelector(
    'button[onclick="registrarItem()"]',
  );
  const inputs = document.querySelectorAll("main input, main select");
  const badgeSelo = document.getElementById("qtd_restante_texto");

  if (isBloqueado) {
    // ESTADO BLOQUEADO
    if (btnRegistrar) {
      btnRegistrar.disabled = true;
      btnRegistrar.innerHTML =
        '<i class="fa-solid fa-lock mr-2"></i> SEM SELOS DISPONÍVEIS';
      btnRegistrar.className =
        "px-6 py-2 bg-slate-700 text-slate-400 rounded-lg text-[10px] font-black uppercase cursor-not-allowed transition-all opacity-80";
    }

    inputs.forEach((el) => {
      el.disabled = true;
      el.classList.add("opacity-50", "cursor-not-allowed");
    });

    if (badgeSelo) {
      // Muda a cor do contador para vermelho indicando erro
      badgeSelo.parentElement.classList.replace(
        "bg-amber-500/10",
        "bg-red-500/10",
      );
      badgeSelo.classList.replace("text-amber-500", "text-red-600");
    }
  } else {
    // ESTADO LIBERADO
    if (btnRegistrar) {
      btnRegistrar.disabled = false;
      btnRegistrar.innerHTML =
        '<i class="fa-solid fa-plus-circle mr-2"></i> REGISTRAR';
      btnRegistrar.className =
        "px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95";
    }

    inputs.forEach((el) => {
      el.disabled = false;
      el.classList.remove("opacity-50", "cursor-not-allowed");
    });

    if (badgeSelo) {
      badgeSelo.parentElement.classList.remove("bg-red-500/10");
      badgeSelo.classList.remove("text-red-600");
      badgeSelo.classList.add("text-amber-500");
    }
  }
}

// Inicializa
document.addEventListener("DOMContentLoaded", monitorarLoteAtivo);

async function verificarDisponibilidadeSeloRealtime() {
  try {
    const { data: lote, error: erroLote } = await _supabase
      .from("rem_essas")
      .select("qtd_selos, prefixo, selo_inicio")
      .eq("status_lote", "ABERTO")
      .maybeSingle();

    if (erroLote || !lote)
      return { podeGravar: false, motivo: "Lote não encontrado." };

    const { data: itens, error: erroItens } = await _supabase
      .from("itens_os")
      .select("selo_inmetro") // Certifique-se de que o nome da coluna no banco é este
      .eq("prefixo_selo", lote.prefixo);

    if (erroItens) throw erroItens;

    // ✅ O SEGREDO: Converter tudo para número e remover nulos
    const selosUsados = itens
      .map((i) => parseInt(i.selo_inmetro))
      .filter((n) => !isNaN(n));

    const seloInicial = parseInt(lote.selo_inicio);
    const seloFinal = seloInicial + parseInt(lote.qtd_selos) - 1;

    let seloCerto = seloInicial;

    // Agora o includes vai funcionar porque ambos são Números
    while (selosUsados.includes(seloCerto)) {
      seloCerto++;
    }

    return {
      podeGravar: seloCerto <= seloFinal,
      proximoSelo: seloCerto,
      prefixo: lote.prefixo,
      disponiveis: parseInt(lote.qtd_selos) - selosUsados.length,
      motivo: seloCerto > seloFinal ? "Lote esgotado!" : "",
    };
  } catch (err) {
    console.error("Erro técnico:", err);
    return { podeGravar: false, motivo: "Erro na sequência." };
  }
}

window.sincronizarPainelSelos = sincronizarPainelSelos;
window.exibirDadosVazios = exibirDadosVazios;
window.aplicarBloqueioSistema = aplicarBloqueioSistema;
window.verificarDisponibilidadeSeloRealtime =
  verificarDisponibilidadeSeloRealtime;
