import xlsx from "xlsx";

/**
 * Lê um arquivo Excel e retorna o valor de uma célula específica.
 * @param filePath - O caminho do arquivo Excel.
 * @param cell - O nome da célula a ser lida Ex: A1, B2, C3, etc.
 * @returns Um objeto com o valor da célula.
 * @throws Se o arquivo não for encontrado ou se a célula não for encontrada.
 * @example
 * const filePath = 'caminho/para/arquivo.xlsx';
 * const cell = 'A1';
 * const result = readExcelCell(filePath, cell);
 * // Saída:  'Valor da célula A1' } **/
export function readExcelCell(filePath: string, cell: string) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const cellValue = sheet[cell] ? sheet[cell].v : null;

  return cellValue;
}
