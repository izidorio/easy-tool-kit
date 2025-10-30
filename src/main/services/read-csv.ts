import { createReadStream } from 'node:fs';
import csv from 'csv-parser';

export function readCSV<T>(filePath: string, separator?: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    createReadStream(filePath)
      .pipe(csv({ separator: separator || ',' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
