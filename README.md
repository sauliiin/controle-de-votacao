<div align="center">

# ⚖️ Controle de Votação

### Sistema de Gerenciamento de Sessões de Julgamento

> Cole a pauta, vote, discuta e exporte — tudo em tempo real! 🚀

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

---

## 🌟 O que é isso?

Uma aplicação web colaborativa para **controle de sessões de julgamento administrativo**. Relatores, secretaria e administradores se conectam ao mesmo painel e interagem com a pauta **em tempo real**, cada um com sua visão e permissões.

Sem instalação. Sem backend próprio. Só abrir e votar. ✅

---

## 🛠️ Tecnologias

| Tecnologia | Papel |
|---|---|
| 🎨 **HTML5 + CSS3** | Interface com **Glassmorphism** e tema escuro |
| ⚡ **JavaScript Vanilla** | Lógica 100% no frontend, sem frameworks |
| 🔥 **Firebase Realtime Database** | Sincronização ao vivo entre todos os usuários |
| ✍️ **Google Fonts (Inter)** | Tipografia moderna e legível |

---

## 👥 Perfis de Acesso

O sistema tem **3 tipos de usuário**, cada um com sua visão:

### 🗡️ Mestre Jedi — *Admin*
> Poder absoluto. Com grande poder vem grande responsabilidade.
- Vê **todos os votos** de todos os relatores
- Edita e exclui qualquer processo
- Visualiza quem pediu discussão em plenário
- Acesso protegido por senha

### 📋 Secretária
> A engrenagem que faz tudo funcionar.
- Importa a pauta colando o texto — o parser faz o resto 🤖
- Cria e remove relatores
- Edita processos e preenche o dispositivo da decisão
- Exporta o relatório final em `.txt`
- Acesso protegido por senha

### 🧑‍⚖️ Relator
> Acesso simples, direto ao ponto.
- Vê **toda a pauta** organizada por relator
- Registra seu **voto pessoal** em cada processo
- Marca processos que precisam de **discussão** 🚩
- Adiciona **observações** privadas
- Sem senha — só selecionar o nome e entrar

---

## ✨ Funcionalidades em Destaque

### 🤖 Parser Inteligente de Pauta
Cole o texto bruto da página de pauta — o sistema identifica automaticamente **relatores, protocolos, interessados e assuntos** sem precisar digitar nada manualmente.

### 🔴 Sincronização em Tempo Real
Powered by Firebase. Um relator vota e **todo mundo vê na hora**, sem precisar atualizar a página.

### 📤 Exportação de Relatório
Gera um arquivo `.txt` formatado com toda a sessão: processos, dispositivos de decisão e observações de cada relator.

---

## 🗳️ Opções de Voto

```
✅ Deferido              ⚡ Deferido em parte
❌ Indeferido            ⏱️ Intempestivo
🔍 Diligência            🚫 Não conhecido
📤 Retirado de pauta     🚧 Impedido
✔️ Confirmada a decisão  🔄 Reformada a decisão
🔨 Cassada a decisão
```

---

## 📁 Estrutura do Projeto

```
controle-de-votacao/
├── 📄 index.html        # Estrutura principal da aplicação
├── 🎨 css/
│   └── styles.css       # Glassmorphism, tema escuro, responsividade
└── ⚡ js/
    ├── app.js           # Lógica principal: auth, renderização, Firebase, exportação
    └── parser.js        # Parser: transforma texto de pauta em estrutura de dados
```

---

## 🚀 Como Usar

```
1. Abra o index.html no navegador  (requer internet para o Firebase)
2. Selecione seu perfil no seletor
3. Se for Secretária ou Admin → insira sua senha
4. Secretária: cole a pauta → clique em "Processar e Preencher" 🤖
5. Relatores: vote, marque discussões, adicione observações
6. Admin: acompanhe tudo e exporte o relatório ao final 📤
```

---

> 💡 **Dica:** As senhas de acesso são definidas no arquivo `js/app.js` e devem ser mantidas em segredo — nunca as exponha publicamente!
