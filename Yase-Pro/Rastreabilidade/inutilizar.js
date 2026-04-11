let idParaInutilizar = null;

function abrirModalInutilizar(id) {
    idParaInutilizar = id;
    document.getElementById('modalInutilizar').classList.remove('hidden');
    document.getElementById('modalInutilizar').classList.add('flex');
}

function fecharModalInutilizar() {
    document.getElementById('modalInutilizar').classList.add('hidden');
    idParaInutilizar = null;
}

async function confirmarInutilizacao() {
    const motivo = document.getElementById('motivoReprovacao').value;

    if (!motivo) {
        alert("Por favor, selecione um motivo.");
        return;
    }

    try {
        // Update no Supabase com o status correto
        const { data, error } = await _supabase
            .from('itens_os')
            .update({ 
                status: 'Inutilizado', 
                motivo_inutilizacao: motivo 
            })
            .eq('id', idParaInutilizar)
            .select();

        if (error) {
            console.error("Erro técnico do Supabase:", error);
            alert("Erro do Banco: " + error.message);
            return;
        }

        alert("✅ Extintor inutilizado com sucesso!");
        fecharModalInutilizar();
        
        // Recarrega a tabela para aplicar a cor vermelha via renderizarTabela.js
        if (typeof carregarItens === 'function') {
            carregarItens(); 
        }

    } catch (err) {
        console.error("Erro inesperado:", err);
        alert("Erro de conexão ou permissão.");
    }
}

// Dentro da sua função de renderização (ex: carregarItens ou renderizar)
function renderizarLinhas(itens) {
    const lista = document.getElementById('itensList');
    lista.innerHTML = '';

    itens.forEach(item => {
        // Define a pureza visual: se for Inutilizado, fica vermelho.
        const classeInutilizado = item.status === 'Inutilizado' ? 'text-red-500 font-bold' : 'text-slate-300';

        const tr = document.createElement('tr');
        tr.className = `${classeInutilizado} border-b border-slate-800 hover:bg-slate-800/30 transition-colors`;
        
        tr.innerHTML = `
            <td class="p-3 sticky left-0 z-[50] bg-slate-900 border-r border-slate-800">${item.id}</td>
            <td class="p-4">${item.num_selo || '---'}</td>
            <td class="p-4 font-black">${item.status}</td>
            <td class="p-4 text-right sticky right-0 bg-slate-900 border-l border-slate-800">
                <button onclick="abrirModalInutilizar(${item.id})" class="text-red-500 hover:text-red-400">
                    <i class="fa-solid fa-ban"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}