# Controle de Votação — Sistema de Gerenciamento de Relatores

Sistema web para controle de sessões de julgamento, permitindo que relatores registrem seus votos em processos administrativos de forma colaborativa e em tempo real.

---

## Visão Geral

A aplicação organiza uma pauta de julgamento em cards por relator. Cada perfil de usuário tem uma visão e permissões diferentes, garantindo que cada participante interaja apenas com o que lhe é pertinente.

---

## Tecnologias

- **HTML5 / CSS3** — Interface com design Glassmorphism e tema escuro
- **JavaScript (Vanilla)** — Lógica de aplicação sem frameworks
- **Firebase Realtime Database** — Persistência e sincronização em tempo real entre todos os usuários conectados
- **Google Fonts (Inter)** — Tipografia

---

## Perfis de Acesso

| Perfil | Acesso | Senha |
|---|---|---|
| **Mestre Jedi (Admin)** | Acesso total: vota, vê todos os votos, edita e exclui qualquer processo | `Mestre@Yoda` |
| **Secretária** | Gerencia a pauta: importa processos, cria/remove relatores, edita dispositivos da decisão, exporta relatório | `Tarja@Preta` |
| **Relator** | Visualiza toda a pauta, registra seu próprio voto, marca processos para discussão e adiciona observações pessoais | Sem senha |

---

## Funcionalidades

### Secretária
- **Parser de pauta** — Cola o texto de uma pauta administrativa e o sistema extrai automaticamente os relatores, protocolos, interessados e assuntos
- **Criação de relatores** — Adiciona novos relatores manualmente ao sistema
- **Edição de processos** — Altera protocolo, interessado e dispositivo da decisão
- **Exclusão** — Remove processos individuais ou reseta toda a pauta
- **Exportar relatório (.txt)** — Gera um arquivo de texto com todos os processos, dispositivos de decisão e observações registradas

### Relator
- Registra seu **voto pessoal** em cada processo (deferido, indeferido, diligência, etc.)
- Visualiza o **voto do relator** (titular) ao lado do próprio voto
- Marca processos que precisam de **discussão** em plenário
- Adiciona **observações pessoais** por processo

### Admin (Mestre Jedi)
- Tudo que a Secretária e os Relatores fazem
- Vê quais relatores marcaram processos para discussão
- Ações de editar e excluir disponíveis em todos os cards

---

## Estrutura do Projeto

```
controle-de-votacao/
├── index.html          # Estrutura principal da aplicação
├── css/
│   └── styles.css      # Estilos (Glassmorphism, tema escuro, responsividade)
└── js/
    ├── app.js          # Lógica principal: autenticação, renderização, Firebase, exportação
    └── parser.js       # Extrator de dados: interpreta texto de pauta e retorna estrutura de dados
```

---

## Como Usar

1. Abra o `index.html` em qualquer navegador moderno (requer conexão com a internet para Firebase)
2. Selecione seu perfil no seletor e, se necessário, insira a senha
3. **Secretária**: cole o conteúdo da pauta no campo de texto e clique em **Processar e Preencher**
4. **Relatores**: acesse com seu nome, registre seus votos e observações
5. **Admin**: acompanhe tudo e exporte o relatório ao final da sessão

---

## Opções de Voto

- Deferido
- Deferido em parte
- Indeferido
- Intempestivo
- Diligência
- Não conhecido
- Retirado de pauta
- Impedido
- Confirmada a decisão
- Reformada a decisão
- Cassada a decisão
