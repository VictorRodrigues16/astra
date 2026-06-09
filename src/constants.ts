/**
 * Metadados do app, integrantes do grupo, ODS atendidas e fontes de dados.
 * Centralizados para aparecerem nas Configuracoes e no README.
 *
 * >>> EDITE o array TEAM com os nomes e RMs reais do seu grupo. <<<
 */
export const APP = {
  name: 'Astra',
  tagline: 'Monitoramento da Terra e do espaço próximo',
  description:
    'Astra é um centro de comando que combina dados de satélites e telescópios da NASA com sensoriamento climático para monitorar, em tempo real, a Terra e o espaço próximo.',
  version: '1.0.0',
};

export interface Member {
  name: string;
  rm: string;
}

export const TEAM: Member[] = [
  { name: 'Integrante 1', rm: 'RM000000' },
  { name: 'Integrante 2', rm: 'RM000000' },
  { name: 'Integrante 3', rm: 'RM000000' },
];

export const ODS: { code: string; label: string }[] = [
  { code: 'ODS 9', label: 'Indústria, inovação e infraestrutura' },
  { code: 'ODS 11', label: 'Cidades e comunidades sustentáveis' },
  { code: 'ODS 13', label: 'Ação contra a mudança global do clima' },
];

export const DATA_SOURCES: { label: string; description: string; url: string }[] = [
  { label: 'NASA APOD', description: 'Imagem astronômica do dia', url: 'https://api.nasa.gov/' },
  { label: 'NASA NeoWs', description: 'Asteroides próximos à Terra', url: 'https://api.nasa.gov/' },
  { label: 'Open-Meteo', description: 'Dados climáticos (sem chave)', url: 'https://open-meteo.com/' },
  { label: 'wheretheiss.at', description: 'Posição da ISS em tempo real', url: 'https://wheretheiss.at/' },
];

/**
 * Chave da API da NASA usada pelo app (APOD + NeoWs).
 * Gerada em https://api.nasa.gov/.
 *
 * NOTA (exercicio de ciberseguranca): esta chave esta hardcoded de proposito,
 * representando a vulnerabilidade "vazamento de segredos" do modulo DevSecOps.
 * Ver API/VULNERABILITIES.md. Chave gratuita e descartavel (regenerar apos a entrega).
 */
export const NASA_API_KEY = 'lAqSdO6KizcNUTtWDjuVlhhS6YbcQhzdgMXA2HuR';
