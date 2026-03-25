/**
 * Core Application Logic
 * Handles State, Roles and UI Updates
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB81J-a9i5ZMSnuEf0_E6B_fBmmf8r9bBo",
    authDomain: "alien-bruin-339920.firebaseapp.com",
    databaseURL: "https://alien-bruin-339920-default-rtdb.firebaseio.com",
    projectId: "alien-bruin-339920",
    storageBucket: "alien-bruin-339920.firebasestorage.app",
    messagingSenderId: "330511053030",
    appId: "1:330511053030:web:0526e66e56ef9782474b27"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const state = {
    currentUser: null,
    relatores: [],
    currentJunta: 'JIRFI',
    juntaRef: null,
    save: () => {
        if (state.juntaRef) {
            state.juntaRef.set(state.relatores);
        }
    }
};

function initJuntaListener() {
    if (state.juntaRef) {
        state.juntaRef.off('value');
    }
    
    // Default JIRFI uses 'relatores' path to preserve existing data. Others use isolated paths.
    const path = state.currentJunta === 'JIRFI' ? 'relatores' : `juntas/${state.currentJunta}/relatores`;
    state.juntaRef = db.ref(path);
    
    state.juntaRef.on('value', (snapshot) => {
        const data = snapshot.val();
        state.relatores = data || [];
        
        if (state.currentUser) {
            updateSelectors();
            renderDashboard();
        } else {
            updateSelectors(); // Still need to update login Dropdown if new relators added
        }
    });
}

// Initialize realtime listener for the first time
initJuntaListener();

// UI Elements
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const userSelector = document.getElementById('user-selector');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-link');
const currentUDisplay = document.getElementById('current-user-display');
const roleBadge = document.getElementById('role-badge');

const secretaryTools = document.getElementById('secretary-tools');
const spreadsheetView = document.getElementById('spreadsheet-view');
const relatorsContainer = document.getElementById('relators-container');
const sheetTitle = document.getElementById('sheet-title');
const passwordContainer = document.getElementById('password-container');
const passwordInput = document.getElementById('user-password');

// Constants for passwords
const PASSWORDS = {
    'JEDI': 'Mestre@Yoda',
    'SECRETARIA': {
        'JIRFI': 'Tarja@Preta',
        'JIJFI-I': 'shir@like',
        'JIJFI-II': 'fe@fe',
        'JIJFI-III': 'ga@by',
        'JIJFI-IV': 'geo@gi',
        'JIJFI-V': 'ma@ma'
    }
};

// Initialize User Selector
function updateSelectors() {
    // Manter as opções fixas e adicionar os relatores
    const currentOptions = Array.from(userSelector.options).slice(0, 3);
    userSelector.innerHTML = '';
    currentOptions.forEach(opt => userSelector.appendChild(opt));
    
    state.relatores.forEach(r => {
        const opt = document.createElement('option');
        opt.value = `RELATOR:${r.name}`;
        opt.textContent = `Relator: ${r.name}`;
        userSelector.appendChild(opt);
    });
}

userSelector.onchange = () => {
    const val = userSelector.value;
    if (val === 'JEDI' || val === 'SECRETARIA') {
        passwordContainer.classList.remove('hidden');
    } else {
        passwordContainer.classList.add('hidden');
        passwordInput.value = '';
    }
};

// Login Logic
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && loginScreen.style.display !== 'none') {
        loginBtn.click();
    }
});

loginBtn.onclick = () => {
    const val = userSelector.value;
    if (!val) return alert('Selecione um usuário');

    if (val === 'JEDI' || val === 'SECRETARIA') {
        const pass = passwordInput.value;
        const expectedPass = val === 'SECRETARIA' ? PASSWORDS['SECRETARIA'][state.currentJunta] : PASSWORDS['JEDI'];
        
        if (pass !== expectedPass) {
            return alert('Senha incorreta para este perfil!');
        }
        state.currentUser = { name: val, role: val };
    } else {
        const name = val.split(':')[1];
        state.currentUser = { name: name, role: 'RELATOR' };
    }

    passwordInput.value = '';
    renderDashboard();
};

logoutBtn.onclick = () => {
    state.currentUser = null;
    appContainer.style.display = 'none';
    loginScreen.style.display = 'flex';
};

// Junta Selection Logic
const juntaOptions = document.querySelectorAll('#junta-options a');
const displayJuntaAtual = document.getElementById('display-junta-atual');

juntaOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.preventDefault();
        
        const newJunta = e.target.getAttribute('data-junta');
        if(state.currentJunta === newJunta) return;
        
        state.currentJunta = newJunta;
        displayJuntaAtual.textContent = newJunta;
        
        juntaOptions.forEach(o => o.classList.remove('active'));
        e.target.classList.add('active');
        
        // Log out user on Junta change for security and refresh
        state.currentUser = null;
        appContainer.style.display = 'none';
        loginScreen.style.display = 'flex';
        passwordInput.value = '';
        
        // Re-init listener for new Junta
        initJuntaListener();
    });
});

function renderDashboard() {
    loginScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    currentUDisplay.textContent = state.currentUser.name;
    roleBadge.textContent = state.currentUser.role;

    // Permissions logic
    secretaryTools.classList.add('hidden');
    spreadsheetView.classList.add('hidden');

    if (state.currentUser.role === 'SECRETARIA' || state.currentUser.role === 'JEDI') {
        secretaryTools.classList.remove('hidden');
        spreadsheetView.classList.remove('hidden');
        renderSpreadsheet(null);
    } else {
        spreadsheetView.classList.remove('hidden');
        renderSpreadsheet(null); // Relator agora vê tudo
    }
}

const VOTE_OPTIONS = [
    "deferido", "deferido em parte", "indeferido", "intempestivo", 
    "diligência", "não conhecido", "retirado de pauta", "Impedido", 
    "confirmada a decisão", "reformada a decisão", "cassada a decisão"
];

function renderSpreadsheet(relatorName) {
    relatorsContainer.innerHTML = '';
    const isJedi = state.currentUser.role === 'JEDI';
    const isRelator = state.currentUser.role === 'RELATOR';
    
    sheetTitle.textContent = (isRelator || isJedi) ? "Sessão de Julgamento" : "Painel Geral Administrativo";
    
    if (isJedi) sheetTitle.textContent += " (Admin)";
    
    const filter = state.relatores;

    filter.forEach((r, relatorIndex) => {
        if (r.data.length === 0) return;

        const card = document.createElement('div');
        card.className = 'relator-card glass';
        
        // Destaque se for o dono do card
        if (isRelator && state.currentUser.name === r.name) {
            card.style.borderLeft = '4px solid var(--primary)';
        }

        let tableRows = '';
        r.data.forEach((entry, i) => {
            if (!entry.votes) entry.votes = {};
            if (!entry.obs) entry.obs = {};
            if (!entry.discutir) entry.discutir = {};

            const userKey = state.currentUser.name;
            const personalVote = entry.votes[userKey] || "";
            const relatorVote = entry.votes[r.name] || "---";
            const discutirVal = entry.discutir[userKey] || false;
            const obsVal = entry.obs[userKey] || "";
            const dispositivoVal = entry.dispositivo || "";
            
            // Differentiated Protocol Display
            const protocolToDisplay = (state.currentUser.role === 'SECRETARIA') ? (entry.protocolFull || entry.protocol) : entry.protocol;

            let actionsHtml = '';
            let voteColumnsHtml = '';

            if (isRelator) {
                // Colunas específicas para Relador
                voteColumnsHtml = `
                    <td>
                        <select class="vote-select" onchange="updateEntryField(${relatorIndex}, ${i}, 'votes', this.value)">
                            <option value="">Selecione...</option>
                            ${VOTE_OPTIONS.map(opt => `<option value="${opt}" ${personalVote === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td style="font-weight: 700; color: var(--primary)">${relatorVote}</td>
                    <td style="text-align: center;">
                        <input type="checkbox" class="custom-checkbox" ${discutirVal ? 'checked' : ''} onchange="updateEntryField(${relatorIndex}, ${i}, 'discutir', this.checked)">
                    </td>
                    <td>
                        <div class="obs-wrapper">
                            <input type="text" class="obs-input" value="${obsVal}" placeholder="Notas..." 
                                onblur="updateEntryField(${relatorIndex}, ${i}, 'obs', this.value)"
                                oninput="this.nextElementSibling.innerText = this.value || 'Sem observações'">
                            <div class="obs-tooltip">${obsVal || 'Sem observações'}</div>
                        </div>
                    </td>
                `;
            } else if (state.currentUser.role === 'JEDI') {
                // ... rest remains same for JEDI
                // (Already correctly implemented in original file, but I'll re-include for completeness in this chunk if needed)
                const discussoes = Object.entries(entry.discutir)
                    .filter(([name, val]) => val === true)
                    .map(([name]) => name);
                const discLabel = discussoes.length > 0 ? `<span style="color: var(--danger); font-size: 0.7rem; display: block;">Sim (${discussoes.join(', ')})</span>` : '<span style="color: var(--text-muted); font-size: 0.7rem;">Não</span>';
                voteColumnsHtml = `
                    <td><select class="vote-select" onchange="updateEntryField(${relatorIndex}, ${i}, 'votes', this.value)"><option value="">Selecione...</option>${VOTE_OPTIONS.map(opt => `<option value="${opt}" ${personalVote === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select></td>
                    <td style="font-weight: 700; color: var(--primary)">${relatorVote}</td>
                    <td style="text-align: center;">${discLabel}</td>
                    <td><div class="obs-wrapper"><input type="text" class="obs-input" value="${obsVal}" placeholder="Notas..." onblur="updateEntryField(${relatorIndex}, ${i}, 'obs', this.value)" oninput="this.nextElementSibling.innerText = this.value || 'Sem observações'"><div class="obs-tooltip">${obsVal || 'Sem observações'}</div></div></td>
                    <td><div style="display: flex; gap: 5px;"><button class="btn btn-edit" onclick="toggleEdit(${relatorIndex}, ${i})">Editar</button><button class="btn" style="padding: 4px 8px; font-size: 12px; background: var(--danger)" onclick="deleteEntry(${relatorIndex}, ${i})">Excluir</button></div></td>
                `;
            } else {
                // SECRETARIA
                voteColumnsHtml = `
                    <td class="cell-assunto">
                        <div class="obs-wrapper" style="max-width: 250px;">
                            <span style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8rem; color: var(--text-muted); cursor: help;">
                                ${entry.assunto || 'Sem assunto definido'}
                            </span>
                            ${entry.assunto ? `<div class="obs-tooltip" style="text-align: left;">${entry.assunto}</div>` : ''}
                        </div>
                    </td>
                    <td>
                        <input type="text" class="edit-input" style="width: 100%; border: none; background: transparent;"
                               value="${dispositivoVal}" 
                               placeholder="Digite o dispositivo..."
                               onblur="updateEntryField(${relatorIndex}, ${i}, 'dispositivo', this.value)">
                    </td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-edit" onclick="toggleEdit(${relatorIndex}, ${i})">Editar</button>
                            <button class="btn" style="padding: 4px 8px; font-size: 12px; background: var(--danger)" onclick="deleteEntry(${relatorIndex}, ${i})">Excluir</button>
                        </div>
                    </td>
                `;
            }

            tableRows += `
                <tr id="row-${relatorIndex}-${i}">
                    <td>${i + 1}</td>
                    <td class="cell-protocol" style="font-size: 0.85rem;">${protocolToDisplay}</td>
                    <td class="cell-solicitor" style="font-size: 0.85rem;">${entry.solicitor}</td>
                    ${voteColumnsHtml}
                </tr>
            `;
        });

        const headerHtml = isRelator 
            ? `<tr>
                <th style="width: 40px;">#</th>
                <th style="font-size: 0.8rem;">Protocolo</th>
                <th style="font-size: 0.8rem;">Interessado</th>
                <th style="width: 180px; font-size: 0.8rem;">Seu Voto</th>
                <th style="width: 150px; font-size: 0.8rem;">Voto do Relator</th>
                <th style="width: 70px; text-align: center; font-size: 0.8rem;">Disc.</th>
                <th style="font-size: 0.8rem;">Obs.</th>
              </tr>`
            : state.currentUser.role === 'JEDI' 
            ? `<tr>
                <th style="width: 40px;">#</th>
                <th>Protocolo</th>
                <th>Interessado</th>
                <th style="width: 160px;">Seu Voto</th>
                <th style="width: 130px;">Voto do Relator</th>
                <th style="width: 100px; text-align: center;">Discutir?</th>
                <th>Observações</th>
                <th style="width: 130px;">Ações</th>
              </tr>`
            : `<tr>
                <th style="width: 40px;">#</th>
                <th style="font-size: 0.8rem;">Protocolo</th>
                <th style="font-size: 0.8rem;">Interessado</th>
                <th style="width: 250px; font-size: 0.8rem;">Assunto</th>
                <th style="width: 250px; font-size: 0.8rem;">Dispositivo da Decisão</th>
                <th style="width: 150px; font-size: 0.8rem;">Ações</th>
              </tr>`;

        card.innerHTML = `
            <div class="relator-card-header">
                <strong>Relator: ${r.name}</strong>
                <span class="role-badge">${r.data.length} Processos</span>
            </div>
            <div style="overflow: visible; padding: 10px;">
                <table class="sheet-table">
                    <thead>${headerHtml}</thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="7" style="text-align:center; color: var(--text-muted)">Nenhum processo vinculado.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        relatorsContainer.appendChild(card);
    });
}

function updateEntryField(relIndex, entryIndex, field, value) {
    const entry = state.relatores[relIndex].data[entryIndex];
    if (field === 'votes' || field === 'obs' || field === 'discutir') {
        const userKey = state.currentUser.name;
        entry[field][userKey] = value;
    } else if (field === 'dispositivo') {
        entry[field] = value;
    }
    state.save();
    // Não renderizamos tudo de novo para não perder o foco se for input, 
    // a menos que seja o Voto Pessoal que afeta o Voto do Relator (se for o dono)
    if (field === 'votes' && state.currentUser.name === state.relatores[relIndex].name) {
        renderSpreadsheet(state.currentUser.role === 'RELATOR' ? state.currentUser.name : null);
    }
}

function toggleEdit(relIndex, entryIndex) {
    const row = document.getElementById(`row-${relIndex}-${entryIndex}`);
    const protocolCell = row.querySelector('.cell-protocol');
    const solicitorCell = row.querySelector('.cell-solicitor');
    const actionCell = row.lastElementChild;

    const entry = state.relatores[relIndex].data[entryIndex];
    const protocolVal = state.currentUser.role === 'SECRETARIA' ? (entry.protocolFull || entry.protocol) : entry.protocol;
    const solicitorVal = entry.solicitor;

    protocolCell.innerHTML = `<input type="text" class="edit-input" value="${protocolVal}">`;
    solicitorCell.innerHTML = `<input type="text" class="edit-input" value="${solicitorVal}">`;

    if (state.currentUser.role === 'SECRETARIA') {
        const assuntoCell = row.querySelector('.cell-assunto');
        assuntoCell.innerHTML = `<input type="text" class="edit-input" value="${entry.assunto || ''}">`;
    }

    actionCell.innerHTML = `
        <div style="display: flex; gap: 5px;">
            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="saveEntry(${relIndex}, ${entryIndex})">Salvar</button>
            <button class="btn btn-edit" onclick="renderSpreadsheet(${state.currentUser.role === 'RELATOR' ? "'" + state.currentUser.name + "'" : 'null'})">Cancelar</button>
        </div>
    `;
}

function saveEntry(relIndex, entryIndex) {
    const row = document.getElementById(`row-${relIndex}-${entryIndex}`);
    const newProtocol = row.querySelector('.cell-protocol input').value;
    const newSolicitor = row.querySelector('.cell-solicitor input').value;

    if (state.currentUser.role === 'SECRETARIA') {
        state.relatores[relIndex].data[entryIndex].protocolFull = newProtocol;
        const baseMatch = newProtocol.match(/[\d.]{2,}[/\d-]+/);
        state.relatores[relIndex].data[entryIndex].protocol = baseMatch ? baseMatch[0] : newProtocol;
        
        const newAssunto = row.querySelector('.cell-assunto input').value;
        state.relatores[relIndex].data[entryIndex].assunto = newAssunto;
    } else {
        state.relatores[relIndex].data[entryIndex].protocol = newProtocol;
    }
    state.relatores[relIndex].data[entryIndex].solicitor = newSolicitor;
    
    state.save();
    renderSpreadsheet(state.currentUser.role === 'RELATOR' ? state.currentUser.name : null);
}

function deleteEntry(relIndex, entryIndex) {
    if(!confirm("Deseja realmente excluir este processo?")) return;
    state.relatores[relIndex].data.splice(entryIndex, 1);
    state.save();
    renderSpreadsheet(state.currentUser.role === 'RELATOR' ? state.currentUser.name : null);
}

// Secretary Actions
document.getElementById('parse-content-btn').onclick = () => {
    const text = document.getElementById('raw-content').value.trim();
    if (!text) return alert('Erro: O campo de conteúdo está vazio. Por favor, cole a pauta para processar.');
    
    try {
        const parsed = Parser.parseContent(text);
        
        if (parsed.length === 0) {
            return alert('Erro na Identificação: Não foi possível encontrar nenhum Protocolo válido no texto colado.\n\nVerifique se o texto segue o padrão: \n"Protocolo: 00.000... / Relator(a) ou Relatora: NOME"');
        }

        let totalProtocols = 0;
        parsed.forEach(p => {
            const normalizedName = p.relator.toUpperCase().trim();
            let relator = state.relatores.find(r => r.name.toUpperCase().trim() === normalizedName);
            
            if (!relator) {
                relator = { name: normalizedName, data: [] };
                state.relatores.push(relator);
            }
            
            relator.data.push(...p.data);
            totalProtocols += p.data.length;
        });

        if (totalProtocols === 0) {
            return alert('Erro: Nenhum processo foi extraído. Certifique-se de que os protocolos estão formatados corretamente (Ex: 31.00674702/2025-77).');
        }

        state.save();
        updateSelectors(); 
        renderDashboard();
        document.getElementById('raw-content').value = '';
        alert(`Sucesso! Foram processados ${totalProtocols} processos para ${parsed.length} relatador(es).`);
        
    } catch (err) {
        console.error(err);
        alert('Erro Crítico no Processamento: Ocorreu um erro inesperado ao ler o texto. Por favor, verifique se há caracteres especiais inválidos ou se o formato está muito fora do padrão.\n\nDetalhe técnico: ' + err.message);
    }
};

document.getElementById('clear-all-btn').onclick = () => {
    if (!confirm("ATENÇÃO: Isso excluirá TODOS os relatores e processos permanentemente. Deseja continuar?")) return;
    
    // Reset para o estado inicial ou vazio
    state.relatores = [];
    state.save();
    
    updateSelectors();
    renderDashboard();
    alert('Sistema resetado com sucesso.');
};

document.getElementById('export-txt-btn').onclick = () => {
    let relatorio = `RELATÓRIO DA SESSÃO DE JULGAMENTO - JUNTA: ${state.currentJunta}\n`;
    relatorio += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;

    let hasData = false;

    state.relatores.forEach(r => {
        if (r.data.length === 0) return;
        hasData = true;

        relatorio += `RELATOR(A): ${r.name.toUpperCase()}\n\n`;

        r.data.forEach((entry, i) => {
            if (!entry.votes) entry.votes = {};
            if (!entry.obs) entry.obs = {};
            if (!entry.discutir) entry.discutir = {};

            const relatorVote = entry.votes[r.name] || "Não Votado";
            const dispositivoTexto = entry.dispositivo || relatorVote;
            
            const discussoes = Object.entries(entry.discutir)
                .filter(([name, val]) => val === true)
                .map(([name]) => name);
            const discStr = discussoes.length > 0 ? `Sim (${discussoes.join(', ')})` : "Não";

            let obsGerais = [];
            Object.entries(entry.obs).forEach(([name, texto]) => {
                if (texto && texto.trim() !== '') {
                    obsGerais.push(`- ${name}: ${texto}`);
                }
            });

            relatorio += `Protocolo: ${entry.protocolFull || entry.protocol}\n`;
            relatorio += `Interessado: ${entry.solicitor}\n`;
            if (entry.assunto) {
                relatorio += `Assunto: ${entry.assunto}\n`;
            }
            relatorio += `Dispositivo da Decisão: ${dispositivoTexto.toUpperCase()}\n`;
            
            if (obsGerais.length > 0) {
                relatorio += `Observações:\n`;
                obsGerais.forEach(obs => {
                    relatorio += `${obs}\n`;
                });
            }
            relatorio += `\n`;
        });
        relatorio += `\n`;
    });

    if (!hasData) {
        return alert('Não há dados para exportar. A pauta está vazia.');
    }

    const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `Relatorio_Sessao_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Limpeza
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Initial Load
updateSelectors();