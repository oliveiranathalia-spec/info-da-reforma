# Project TODO

## Estrutura e Navegação
- [x] Configurar Tab Bar com 4 abas (Home, Chat, Calculadoras, Perfil)
- [x] Criar estrutura de pastas para as telas
- [x] Configurar tema de cores personalizado

## Tela Home
- [x] Criar layout da tela Home com cards de acesso rápido
- [x] Implementar saudação personalizada
- [x] Adicionar seção de últimas atualizações
- [ ] Exibir contador de consultas restantes

## Chat IA
- [x] Criar interface de chat com bolhas de mensagem
- [x] Implementar campo de entrada de texto
- [x] Adicionar sugestões de perguntas (chips)
- [x] Integrar com backend de IA (mock inicial)
- [x] Implementar indicador de loading

## Calculadoras
- [x] Criar tela de lista de calculadoras
- [x] Implementar Calculadora IBS/CBS
- [x] Adicionar campos de entrada com máscaras
- [x] Exibir resultado com breakdown de tributos
- [x] Implementar comparativo com sistema atual

## FAQ
- [x] Criar tela de FAQ com categorias
- [x] Implementar busca por palavra-chave
- [x] Adicionar filtros por setor
- [x] Criar componente de acordeão expansível
- [x] Popular com perguntas iniciais

## Perfil e Autenticação
- [x] Criar tela de perfil do usuário
- [x] Implementar login/logout (mock)
- [x] Adicionar configurações de tema
- [x] Exibir informações do plano

## Branding
- [x] Gerar logo personalizado do app
- [x] Configurar ícones do app
- [x] Atualizar splash screen
- [x] Configurar nome do app

## Testes e Qualidade
- [x] Testar navegação entre telas
- [x] Verificar responsividade
- [x] Testar modo escuro
- [x] Criar testes unitários (24 testes passando)
- [x] Criar checkpoint final

## Versão Web (Desktop)
- [x] Verificar funcionamento no navegador
- [x] Ajustar layout responsivo para telas maiores
- [x] Otimizar navegação para mouse/teclado
- [x] Testar todas as funcionalidades no browser

## Rebranding - Info da Reforma
- [x] Atualizar nome do app para "Info da Reforma"
- [x] Atualizar app.config.ts com novo nome
- [x] Gerar novo logo com identidade visual
- [x] Atualizar textos e títulos nas telas
- [ ] Configurar domínio infodareforma.com.br (aguardando hospedagem)

## Integração com IA (Google Gemini)
- [x] Configurar chave API do Gemini (validada)
- [x] Criar endpoint de backend para Gemini
- [x] Adicionar contexto de legislação tributária ao prompt
- [x] Integrar chat do app com IA real
- [x] Testar respostas sobre IBS, CBS e reforma
- [x] Validar citações de legislação nas respostas

## Correção - API IA no Vercel
- [ ] Criar API serverless para chat com Gemini
- [ ] Atualizar frontend para usar nova API
- [ ] Testar no Vercel


## Banco de Dados Legal - Fontes (38 sites)
- [ ] Sites Oficiais: gov.br/fazenda, planalto.gov.br, cgibs.gov.br, receita federal
- [ ] Portais Técnicos: comsefaz, cfc, fenacon, cni, fiesp
- [ ] Portais de Notícias: jota, contabeis, portaltributario, guiatributario
- [ ] Ferramentas: calculadora CBS, legisweb, totvs
- [ ] Estruturar base de dados em formato JSON
- [ ] Integrar base de dados ao prompt da IA


## Personalização da IA
- [x] Atualizar prompt com instruções do usuário (tom técnico-acadêmico)
- [ ] Testar novas respostas


## Novas Funcionalidades - Chat
- [x] Implementar microfone (Web Speech API) para voz para texto
- [x] Implementar upload de arquivos XML (NF-e)
- [x] Implementar upload de arquivos PDF
- [ ] Testar funcionalidades no navegador


## Integração API Receita Federal
- [x] Estudar ferramenta oficial de cálculo da Receita Federal
- [x] Identificar e documentar endpoints da API
- [x] Integrar API ao aplicativo
- [ ] Criar relatório final
