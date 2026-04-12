// /**
//  * GERENCIAMENTO DE AÇÕES DA TABELA
//  * Focado exclusivamente em Editar e Excluir
//  */

// // Variável global para controlar se estamos editando um item existente
// window.editandoID = null;

// /**
//  * PREPARAR EDIÇÃO: Busca dados no Supabase e preenche o formulário
//  */
// async function prepararEdicao(id) {
//     try {
//         const { data, error } = await _supabase
//             .from("itens_os")
//             .select("*")
//             .eq("id", id)
//             .single();

//         if (error) throw error;

//         // 1. Define o ID global para transformar o registro em UPDATE
//         window.editandoID = id;

//         // 2. Mapeamento de campos (IDs conforme seu Rastreio_Full.html)
//         const campos = {
//             "cod_barras": data.cod_barras,
//             "X_input_id": data.fabricante_id,
//             "nr_cilindro": data.nr_cilindro,
//             "ano_fab": data.ano_fab,
//             "ult_reteste": data.ult_reteste,
//             "tipo_carga": data.tipo_carga,
//             "capacidade": data.capacidade,
//             "nbr_select": data.nbr,
//             "lote_nitrogenio": data.lote_nitrogenio,
//             "ampola_vinculada": data.ampola_vinculada,
//             "data_selagem": data.data_selagem,
//             "selo_anterior": data.selo_anterior,
//             "N-Patrimonio": data.num_patrimonio,
//             "deposito_galpao": data.deposito_galpao,
//             "local_extintor": data.local_especifico,
//             "obs_ensaio": data.obs_ensaio,
//             // Ensaios Técnicos
//             "p_vazio_valvula": data.p_vazio_valvula,
//             "p_cheio_valvula": data.p_cheio_valvula,
//             "p_atual": data.p_atual,
//             "tara_cilindro": data.tara_cilindro,
//             "p_cil_vazio_kg": data.p_cil_vazio_kg,
//             "vol_litros": data.vol_litros,
//             "dvm_et": data.dvm_et,
//             "dvp_ep": data.dvp_ep
//         };

//         // Preenche os inputs automaticamente
//         Object.entries(campos).forEach(([id, valor]) => {
//             const el = document.getElementById(id);
//             if (el) el.value = valor || "";
//         });

//         // 3. Atualiza Nível (NV1/NV2/NV3)
//         if (data.nivel_manutencao && typeof setLevel === "function") {
//             setLevel(parseInt(data.nivel_manutencao));
//         }

//         // 4. Muda o visual do botão Registrar
//         const btnReg = document.querySelector('button[onclick="registrarItem()"]');
//         if (btnReg) {
//             btnReg.innerHTML = '<i class="fa-solid fa-save"></i> SALVAR ALTERAÇÕES';
//             btnReg.classList.replace("bg-indigo-600", "bg-emerald-500");
//         }

//         // 5. Feedback visual: sobe para o formulário
//         window.scrollTo({ top: 0, behavior: 'smooth' });

//         // Recalcula displays de validade se a função existir
//         if (typeof calcularDatasAutomaticas === "function") {
//             calcularDatasAutomaticas();
//         }

//     } catch (err) {
//         console.error("Erro ao carregar edição:", err);
//         alert("Erro ao buscar dados para edição.");
//     }
// }

// /**
//  * DELETAR ITEM: Remove o registro após confirmação
//  */
// // Função para deletar item
// window.deletarItem = async function(id) {
//     // Busca o modal de confirmação no HTML
//     const modal = document.getElementById("confirmacaoGeral");
//     const btnConfirmar = document.getElementById("btnConfirmarAcaoGeral");

//     if (!modal) {
//         // Se não achar o modal customizado, usa o do navegador para não travar o usuário
//         if (confirm("Tem certeza que deseja excluir este item permanentemente?")) {
//             await executarExclusao(id);
//         }
//         return;
//     }

//     // Abre o modal
//     modal.classList.remove("hidden");
//     modal.classList.add("flex");

//     // Configura o botão de confirmação
//     btnConfirmar.onclick = async () => {
//         await executarExclusao(id);
//         fecharConfirmacaoGeral();
//     };
// };

// // Função interna que realmente fala com o Banco de Dados
// async function executarExclusao(id) {
//     try {
//         const { error } = await _supabase
//             .from("itens_os")
//             .delete()
//             .eq("id", id);

//         if (error) {
//             console.error("Erro Supabase:", error);
//             alert("Erro ao excluir: Verifique as permissões do banco.");
//             return;
//         }

//         // Sucesso: Atualiza a tabela
//         if (typeof carregarItens === "function") {
//             await carregarItens();
//         }
//     } catch (err) {
//         console.error("Erro crítico na exclusão:", err);
//         alert("Ocorreu um erro inesperado ao tentar excluir.");
//     }
// }

// // Função para fechar o modal
// window.fecharConfirmacaoGeral = function() {
//     const modal = document.getElementById("confirmacaoGeral");
//     if (modal) {
//         modal.classList.add("hidden");
//         modal.classList.remove("flex");
//     }
// };

// function fecharConfirmacao() {
//     const modal = document.getElementById("confirmacaoGeral");
//     if (modal) {
//         modal.classList.add("hidden");
//         modal.classList.remove("flex");
//     }
// }

/**
 * GERENCIAMENTO DE AÇÕES DA TABELA - YA SE PRO
 * Edição, Exclusão e Sincronização em Tempo Real
 */

// Garante acesso ao cliente Supabase global
const _supabase = window._supabase;

// Variável global para controlar se estamos editando um item existente
window.editandoID = null;

/**
 * PREPARAR EDIÇÃO: Busca dados no Supabase e preenche o formulário
 */
async function prepararEdicao(id) {
  try {
    const { data, error } = await _supabase
      .from("itens_os")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // 1. Define o ID global para transformar o registro em UPDATE no registrarItem
    window.editandoID = id;

    // 2. Mapeamento de campos (Conforme o teu Rastreio_Full.html)
    const campos = {
      nr_cilindro: data.nr_cilindro,
      ano_fab: data.ano_fab,
      ult_reteste: data.ult_reteste,
      tipo_carga: data.tipo_carga,
      capacidade: data.capacidade,
      nbr_select: data.nbr,
      lote_nitrogenio: data.lote_nitrogenio,
      ampola_vinculada: data.ampola_vinculada,
      selo_anterior: data.selo_anterior,
      "N-Patrimonio": data.num_patrimonio,
      deposito_galpao: data.deposito_galpao,
      local_extintor: data.local_especifico,
      obs_ensaio: data.obs_ensaio,
      p_vazio_valvula: data.p_vazio_valvula,
      p_cheio_valvula: data.p_cheio_valvula,
      p_atual: data.p_atual,
      tara_cilindro: data.tara_cilindro,
      p_cil_vazio_kg: data.p_cil_vazio_kg,
      vol_litros: data.vol_litros,
      dvm_et: data.dvm_et,
      dvp_ep: data.dvp_ep,
    };

    // Preenche os inputs
    Object.entries(campos).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el) el.value = valor || "";
    });

    // 3. Atualiza o Nível de Manutenção (NV1/NV2/NV3)
    if (data.nivel_manutencao && typeof setLevel === "function") {
      setLevel(parseInt(data.nivel_manutencao));
    }

    // 4. Altera o botão para modo de Edição (Visual e Texto)
    const btnReg = document.querySelector('button[onclick="registrarItem()"]');
    if (btnReg) {
      btnReg.innerHTML =
        '<i class="fa-solid fa-save mr-2"></i> SALVAR ALTERAÇÕES';
      btnReg.classList.remove("bg-indigo-600");
      btnReg.classList.add("bg-emerald-500", "scale-105");
    }

    // 5. Scroll suave para o topo para o técnico editar
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (typeof calcularDatasAutomaticas === "function") {
      calcularDatasAutomaticas();
    }

    console.log("Modo de edição ativado para o ID:", id);
  } catch (err) {
    console.error("Erro ao carregar edição:", err);
    alert("Erro ao buscar dados para edição.");
  }
}

/**
 * EXCLUSÃO DE ITEM: Com confirmação e sincronização em tempo real
 */
window.deletarItem = async function (id) {
  const modal = document.getElementById("confirmacaoGeral");
  const btnConfirmar = document.getElementById("btnConfirmarAcaoGeral");

  if (!modal) {
    if (confirm("Tem certeza que deseja excluir este item permanentemente?")) {
      await executarExclusao(id);
    }
    return;
  }

  // Abre o teu modal customizado
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Configura o clique de confirmação
  btnConfirmar.onclick = async () => {
    await executarExclusao(id);
    fecharConfirmacaoGeral();
  };
};

// async function executarExclusao(id) {
//     try {
//         const { error } = await _supabase
//             .from("itens_os")
//             .delete()
//             .eq("id", id);

//         if (error) throw error;

//         // --- ATUALIZAÇÃO FLASH ---
//         // 1. Recarrega a tabela
//         if (typeof carregarItens === "function") await carregarItens();

//         // 2. Recalcula os selos e o contador (O segredo do flash)
//         if (typeof sincronizarPainelSelos === "function") {
//             await sincronizarPainelSelos();
//         }

//         console.log("Item removido e contador atualizado.");

//     } catch (err) {
//         console.error("Erro na exclusão:", err);
//         alert("Erro ao excluir item.");
//     }
// }

async function executarExclusao(id) {
  try {
    const { error } = await _supabase.from("itens_os").delete().eq("id", id);
    if (error) throw error;

    // 1. Recarrega a tabela visualmente
    if (typeof carregarItens === "function") await carregarItens();

    // 2. O FLASH: Aguarda um milisegundo e força a atualização do contador
    setTimeout(async () => {
      await sincronizarPainelSelos();
      console.log("Contador atualizado após exclusão!");
    }, 100);
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert("Erro na exclusão.");
  }
}

/**
 * FUNÇÕES DE INTERFACE (MODAIS)
 */
window.fecharConfirmacaoGeral = function () {
  const modal = document.getElementById("confirmacaoGeral");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

// Alias para garantir que chame a função correta
function fecharConfirmacao() {
  fecharConfirmacaoGeral();
}

/**
 * RESET DE FORMULÁRIO: Volta o botão ao estado original
 */
function resetarBotaoRegistro() {
  window.editandoID = null;
  const btnReg = document.querySelector('button[onclick="registrarItem()"]');
  if (btnReg) {
    btnReg.innerHTML =
      '<i class="fa-solid fa-plus mr-2"></i> REGISTRAR EXTINTOR';
    btnReg.classList.remove("bg-emerald-500", "scale-105");
    btnReg.classList.add("bg-indigo-600");
  }
}
