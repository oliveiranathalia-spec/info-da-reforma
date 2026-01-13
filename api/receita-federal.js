// API Serverless para integração com a Calculadora da Receita Federal
// Base URL: https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api

const BASE_URL = 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, ...params } = req.method === 'GET' ? req.query : req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint não especificado' });
  }

  try {
    let url;
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    switch (endpoint) {
      case 'versao':
        url = `${BASE_URL}/calculadora/dados-abertos/versao`;
        break;

      case 'aliquota-uniao':
        if (!params.data) {
          return res.status(400).json({ error: 'Parâmetro "data" é obrigatório (formato: YYYY-MM-DD)' });
        }
        url = `${BASE_URL}/calculadora/dados-abertos/aliquota-uniao?data=${params.data}`;
        break;

      case 'aliquota-uf':
        if (!params.data || !params.codigoUf) {
          return res.status(400).json({ error: 'Parâmetros "data" e "codigoUf" são obrigatórios' });
        }
        url = `${BASE_URL}/calculadora/dados-abertos/aliquota-uf?data=${params.data}&codigoUf=${params.codigoUf}`;
        break;

      case 'aliquota-municipio':
        if (!params.data || !params.codigoMunicipio) {
          return res.status(400).json({ error: 'Parâmetros "data" e "codigoMunicipio" são obrigatórios' });
        }
        url = `${BASE_URL}/calculadora/dados-abertos/aliquota-municipio?data=${params.data}&codigoMunicipio=${params.codigoMunicipio}`;
        break;

      case 'ufs':
        url = `${BASE_URL}/calculadora/dados-abertos/ufs`;
        break;

      case 'municipios':
        if (!params.codigoUf) {
          return res.status(400).json({ error: 'Parâmetro "codigoUf" é obrigatório' });
        }
        url = `${BASE_URL}/calculadora/dados-abertos/ufs/municipios?codigoUf=${params.codigoUf}`;
        break;

      case 'ncm':
        if (!params.ncm || !params.data) {
          return res.status(400).json({ error: 'Parâmetros "ncm" e "data" são obrigatórios' });
        }
        url = `${BASE_URL}/calculadora/dados-abertos/ncm?ncm=${params.ncm}&data=${params.data}`;
        break;

      case 'nbs':
        if (!params.nbs || !params.data) {
          return res.status(400).json({ error: 'Parâmetros "nbs" e "data" são obrigatórios' });
        }
        url = `${BASE_URL}/calculadora/dados-abertos/nbs?nbs=${params.nbs}&data=${params.data}`;
        break;

      case 'situacoes-tributarias-cbs-ibs':
        url = `${BASE_URL}/calculadora/dados-abertos/situacoes-tributarias/cbs-ibs`;
        break;

      case 'situacoes-tributarias-is':
        url = `${BASE_URL}/calculadora/dados-abertos/situacoes-tributarias/imposto-seletivo`;
        break;

      case 'classificacoes-cbs-ibs':
        url = `${BASE_URL}/calculadora/dados-abertos/classificacoes-tributarias/cbs-ibs`;
        break;

      case 'classificacoes-is':
        url = `${BASE_URL}/calculadora/dados-abertos/classificacoes-tributarias/imposto-seletivo`;
        break;

      case 'fundamentacoes-legais':
        url = `${BASE_URL}/calculadora/dados-abertos/fundamentacoes-legais`;
        break;

      case 'calcular':
        // Endpoint principal de cálculo
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Método POST é obrigatório para cálculo' });
        }
        url = `${BASE_URL}/calculadora/regime-geral`;
        options.method = 'POST';
        options.body = JSON.stringify(params.operacao);
        break;

      default:
        return res.status(400).json({ error: `Endpoint "${endpoint}" não reconhecido` });
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || 'Erro na API da Receita Federal',
        status: response.status,
        ...data
      });
    }

    return res.status(200).json({
      success: true,
      endpoint,
      data,
      fonte: 'Receita Federal do Brasil - Calculadora de Tributos',
      url_documentacao: 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/calculadora/documentacao'
    });

  } catch (error) {
    console.error('Erro ao consultar API da Receita Federal:', error);
    return res.status(500).json({
      error: 'Erro ao consultar API da Receita Federal',
      message: error.message
    });
  }
}
