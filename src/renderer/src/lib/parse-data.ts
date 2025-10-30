//TODO: fazer a descrição da função
/**
 * Converte uma string de data no formato "yyyy-mm-dd" para "dd/mm/yyyy".
 * @param dateString A string de data no formato "yyyy-mm-dd".
 * @returns A string de data no formato "dd/mm/yyyy".
 **/
export function parseDate(dateString: string | undefined = ""): string {
  const [month, day, year] = dateString.split("-");
  return `${day}/${month}/${year}`;
}
