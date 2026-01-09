# Design do Aplicativo - Consulta Reforma Tributária

## Visão Geral

Este documento define o design de interface do aplicativo móvel para consultas sobre a Reforma Tributária brasileira. O design segue as **Apple Human Interface Guidelines (HIG)** para garantir uma experiência nativa e intuitiva, otimizada para **orientação retrato (9:16)** e **uso com uma mão**.

---

## 1. Lista de Telas

| Tela | Descrição |
|------|-----------|
| **Splash Screen** | Tela de carregamento com logo do app |
| **Home** | Dashboard principal com acesso rápido às funcionalidades |
| **Chat IA** | Interface de conversação com o assistente de IA |
| **Calculadoras** | Lista de calculadoras tributárias disponíveis |
| **Calculadora IBS/CBS** | Calculadora específica para os novos tributos |
| **Simulador de Impacto** | Simulação do impacto da reforma por setor |
| **FAQ** | Perguntas frequentes organizadas por categoria/setor |
| **FAQ Detalhe** | Resposta completa de uma pergunta específica |
| **Perfil/Conta** | Configurações do usuário e plano de assinatura |
| **Notificações** | Lista de atualizações e novidades da legislação |

---

## 2. Conteúdo e Funcionalidades por Tela

### 2.1 Home (Tela Principal)

**Conteúdo:**
- Saudação personalizada (Bom dia/tarde/noite + nome do usuário se logado)
- Contador de consultas restantes (plano gratuito)
- Cards de acesso rápido: Chat IA, Calculadoras, FAQ, Simulador
- Seção "Últimas Atualizações" com notícias recentes da reforma
- Banner informativo sobre o período de transição (2026-2033)

**Funcionalidades:**
- Navegação para todas as seções do app
- Indicador visual do plano do usuário (Gratuito/Premium)

### 2.2 Chat IA

**Conteúdo:**
- Histórico de mensagens da conversa atual
- Campo de entrada de texto para perguntas
- Sugestões de perguntas frequentes (chips clicáveis)
- Indicador de "digitando" quando a IA está processando

**Funcionalidades:**
- Envio de perguntas em linguagem natural
- Respostas da IA com citações das fontes legais
- Opção de copiar resposta
- Opção de avaliar resposta (útil/não útil)
- Limite de consultas para usuários gratuitos

### 2.3 Calculadoras

**Conteúdo:**
- Lista de calculadoras disponíveis:
  - Calculadora IBS/CBS (novo sistema)
  - Comparativo Atual vs Reforma
  - Simulador de Alíquota Efetiva
- Descrição breve de cada calculadora
- Ícones representativos

**Funcionalidades:**
- Navegação para calculadora específica
- Indicador de calculadoras premium (cadeado)

### 2.4 Calculadora IBS/CBS

**Conteúdo:**
- Campos de entrada:
  - Valor da operação (R$)
  - Tipo de operação (Venda de produto, Prestação de serviço)
  - Setor de atuação (dropdown)
  - Regime tributário (Simples, Lucro Presumido, Lucro Real)
- Resultado calculado com breakdown:
  - CBS (federal)
  - IBS (estadual/municipal)
  - Total de tributos
  - Alíquota efetiva

**Funcionalidades:**
- Cálculo em tempo real
- Comparativo com sistema atual (ICMS/ISS/PIS/COFINS)
- Opção de salvar/compartilhar resultado

### 2.5 FAQ

**Conteúdo:**
- Barra de busca
- Filtros por categoria:
  - Geral
  - Indústria
  - Comércio
  - Serviços
  - Importação/Exportação
  - Simples Nacional
- Lista de perguntas mais acessadas
- Perguntas organizadas por tema

**Funcionalidades:**
- Busca por palavra-chave
- Filtro por setor empresarial
- Expansão/colapso de respostas
- Marcação de favoritos

### 2.6 Perfil/Conta

**Conteúdo:**
- Avatar e nome do usuário
- Plano atual (Gratuito/Premium)
- Estatísticas de uso (consultas realizadas)
- Opções de conta:
  - Editar perfil
  - Gerenciar assinatura
  - Notificações
  - Tema (Claro/Escuro/Sistema)
  - Sobre o app
  - Termos de uso
  - Política de privacidade
  - Sair

**Funcionalidades:**
- Login/Logout
- Upgrade para Premium
- Configurações de preferências

---

## 3. Fluxos de Usuário Principais

### Fluxo 1: Fazer uma Pergunta
1. Usuário abre o app → **Home**
2. Toca no card "Pergunte à IA" → **Chat IA**
3. Digita sua pergunta no campo de texto
4. Toca no botão enviar
5. Aguarda resposta da IA (indicador de loading)
6. Visualiza resposta com citações legais
7. (Opcional) Avalia a resposta ou faz pergunta de follow-up

### Fluxo 2: Calcular Tributos
1. Usuário abre o app → **Home**
2. Toca no card "Calculadoras" → **Calculadoras**
3. Seleciona "Calculadora IBS/CBS" → **Calculadora IBS/CBS**
4. Preenche os campos (valor, tipo, setor)
5. Visualiza resultado com breakdown de tributos
6. (Opcional) Toca em "Comparar com sistema atual"
7. Visualiza comparativo lado a lado

### Fluxo 3: Consultar FAQ
1. Usuário abre o app → **Home**
2. Toca no card "FAQ" → **FAQ**
3. Seleciona filtro de setor (ex: "Comércio")
4. Navega pelas perguntas ou usa busca
5. Toca em uma pergunta → **FAQ Detalhe**
6. Lê a resposta completa com fundamentação legal

### Fluxo 4: Upgrade para Premium
1. Usuário atinge limite de consultas gratuitas
2. Sistema exibe modal de upgrade
3. Usuário toca em "Ver planos" → **Tela de Planos**
4. Seleciona plano desejado (Mensal/Anual)
5. Confirma pagamento via App Store/Play Store
6. Recebe confirmação e acesso liberado

---

## 4. Paleta de Cores

A paleta foi escolhida para transmitir **confiança, profissionalismo e autoridade**, características essenciais para um app de consultoria tributária.

| Token | Modo Claro | Modo Escuro | Uso |
|-------|------------|-------------|-----|
| `primary` | `#1E3A5F` | `#4A90D9` | Cor principal (azul institucional) |
| `background` | `#FFFFFF` | `#0F1419` | Fundo das telas |
| `surface` | `#F5F7FA` | `#1A2332` | Cards e superfícies elevadas |
| `foreground` | `#1A1A2E` | `#E8ECF0` | Texto principal |
| `muted` | `#6B7280` | `#9CA3AF` | Texto secundário |
| `border` | `#E5E7EB` | `#2D3748` | Bordas e divisores |
| `success` | `#059669` | `#34D399` | Estados de sucesso |
| `warning` | `#D97706` | `#FBBF24` | Alertas e avisos |
| `error` | `#DC2626` | `#F87171` | Erros e estados críticos |
| `accent` | `#0EA5E9` | `#38BDF8` | Destaques e CTAs secundários |

---

## 5. Estrutura de Navegação

O app utilizará uma **Tab Bar** na parte inferior com 4 abas principais, seguindo o padrão iOS/Android:

```
┌─────────────────────────────────────┐
│                                     │
│           [Conteúdo da Tela]        │
│                                     │
├─────────────────────────────────────┤
│  🏠 Home  │  💬 Chat  │  🧮 Calc  │  👤 Perfil  │
└─────────────────────────────────────┘
```

**Navegação:**
- **Home**: Tela inicial com dashboard
- **Chat**: Acesso direto ao assistente de IA
- **Calc**: Calculadoras e simuladores
- **Perfil**: Conta e configurações

O **FAQ** será acessado a partir da Home ou do Chat, não terá aba dedicada para manter a barra limpa e focada.

---

## 6. Componentes de UI Principais

### Cards de Acesso Rápido (Home)
- Tamanho: 2 colunas, altura fixa
- Ícone + Título + Descrição curta
- Feedback visual ao toque (scale 0.97 + haptic)

### Mensagens do Chat
- Bolhas de mensagem diferenciadas (usuário à direita, IA à esquerda)
- Suporte a formatação (negrito, listas)
- Citações legais em destaque (blockquote)

### Campos de Entrada (Calculadoras)
- Labels claros acima do campo
- Máscaras de formatação (moeda, porcentagem)
- Validação em tempo real

### Lista de FAQ
- Acordeão expansível
- Ícone de seta indicando estado
- Animação suave de expansão
