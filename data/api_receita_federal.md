# API da Calculadora de Tributos - Receita Federal

## Informações Gerais

**Base URL:** `https://piloto-cbs.tributos.gov.br:48426/servico/calculadora-consumo/api`
**Documentação:** `/api-docs` (OpenAPI 3.1)
**Versão:** BETA

## Endpoints Disponíveis

### 1. Base de Cálculo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/calculadora/base-calculo/is-mercadorias` | Cálculo base do Imposto Seletivo |
| POST | `/calculadora/base-calculo/cbs-ibs-mercadorias` | Cálculo base CBS/IBS (CIBS) |

### 2. Calculadora de Tributos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/calculadora/xml/validate` | Lista tipos de DFe para validação |
| GET | `/calculadora/xml/generate` | Lista tipos de DFe para geração |
| POST | `/calculadora/xml/validate` | Validação de XML de documento fiscal |
| POST | `/calculadora/xml/generate` | Geração de XML com tributos calculados |
| POST | `/calculadora/regime-geral` | **Cálculo principal do tributo** |

### 3. Dados Abertos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/calculadora/dados-abertos/versao` | Versão do aplicativo e banco de dados |
| GET | `/calculadora/dados-abertos/ufs` | Lista de Unidades Federativas |
| GET | `/calculadora/dados-abertos/ufs/municipios` | Lista de Municípios |
| GET | `/calculadora/dados-abertos/situacoes-tributarias/imposto-seletivo` | CST do Imposto Seletivo |
| GET | `/calculadora/dados-abertos/situacoes-tributarias/cbs-ibs` | CST da CBS/IBS |
| GET | `/calculadora/dados-abertos/ncm` | Nomenclatura Comum do Mercosul |
| GET | `/calculadora/dados-abertos/nbs` | Nomenclatura Brasileira de Serviços |
| GET | `/calculadora/dados-abertos/fundamentacoes-legais` | Fundamentações legais |
| GET | `/calculadora/dados-abertos/classificacoes-tributarias/{id}` | Classificação por ID |
| GET | `/calculadora/dados-abertos/classificacoes-tributarias/imposto-seletivo` | Classificações do IS |
| GET | `/calculadora/dados-abertos/classificacoes-tributarias/cbs-ibs` | Classificações CBS/IBS |
| GET | `/calculadora/dados-abertos/aliquota-uniao` | Alíquota padrão da União (CBS) |
| GET | `/calculadora/dados-abertos/aliquota-uf` | Alíquota IBS Estadual |
| GET | `/calculadora/dados-abertos/aliquota-municipio` | Alíquota IBS Municipal |

### 4. Pedágio

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/calculadora/pedagio` | Cálculo de tributos para pedágio |

## Schemas Principais

### Entrada (Input)

- **OperacaoInput**: Dados da operação comercial
- **ItemOperacaoInput**: Itens da operação
- **TributacaoRegularInput**: Dados para tributação regular
- **ImpostoSeletivoInput**: Dados para Imposto Seletivo
- **BaseCalculoCibsInput**: Base de cálculo CBS/IBS
- **PedagioInput**: Dados para cálculo de pedágio

### Saída (Output)

- **TributosDomain**: Tributos calculados
- **CBSDomain**: Detalhes da CBS
- **IBSUFDomain**: Detalhes do IBS Estadual
- **IBSMunDomain**: Detalhes do IBS Municipal
- **ImpostoSeletivoDomain**: Detalhes do IS
- **TributosTotaisDomain**: Totais consolidados

## Exemplos de Uso Testados

### 1. Consultar Versão da API

```bash
curl -s "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/versao"
```

**Resposta:**
```json
{
    "versaoApp": "101Publico-SNAPSHOT-b3f75196",
    "versaoDb": "V0018",
    "descricaoVersaoDb": "Alíquotas fixas ligadas a classificações tributárias",
    "dataVersaoDb": "2025-12-29",
    "ambiente": "apr"
}
```

### 2. Consultar Alíquota CBS (União) para 2027

```bash
curl -s "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/aliquota-uniao?data=2027-01-01"
```

**Resposta:**
```json
{
    "aliquotaReferencia": 8.4,
    "aliquotaPropria": 8.4
}
```

### 3. Consultar Alíquota IBS Estadual (SP) para 2027

```bash
curl -s "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/aliquota-uf?data=2027-01-01&codigoUf=35"
```

**Resposta:**
```json
{
    "aliquotaReferencia": 0.05,
    "aliquotaPropria": 0.05
}
```

### 4. Consultar NCM (Refrigerantes - 22021000)

```bash
curl -s "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/ncm?ncm=22021000&data=2027-01-01"
```

**Resposta:**
```json
{
    "tributadoPeloImpostoSeletivo": true,
    "aliquotaAdValorem": 10.0,
    "capitulo": "Bebidas, líquidos alcoólicos e vinagres.",
    "posicao": "Águas, incluindo as águas minerais...",
    "subitem": "Águas, incluindo as águas minerais..."
}
```

### 5. Listar UFs

```bash
curl -s "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/ufs"
```

## Parâmetros Obrigatórios

| Endpoint | Parâmetros |
|----------|------------|
| aliquota-uniao | `data` (YYYY-MM-DD) |
| aliquota-uf | `data`, `codigoUf` |
| aliquota-municipio | `data`, `codigoMunicipio` |
| ncm | `ncm`, `data` |
| nbs | `nbs`, `data` |

## Observações

1. A API é **pública e gratuita**
2. Não requer autenticação para consultas básicas
3. Funciona em modo BETA - pode haver alterações
4. Base URL: `https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api`
5. Ideal para integração com sistemas contábeis e ERPs
