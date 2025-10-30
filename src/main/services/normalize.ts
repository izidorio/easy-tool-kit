// Função para normalizar os caracteres especiais
function normalizeString(str: string): string {
  if (!str) return str;
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
