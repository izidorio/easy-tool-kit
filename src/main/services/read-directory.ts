import { readdir } from "node:fs";
import { join } from "node:path";

export function readDirectory(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let results: string[] = [];

    readdir(dirPath, { withFileTypes: true }, (err, files) => {
      if (err) return reject(err);

      let pending = files.length;
      if (!pending) return resolve(results);

      files.forEach((file) => {
        const filePath = join(dirPath, file.name);

        if (file.isDirectory()) {
          readDirectory(filePath)
            .then((res) => {
              results = results.concat(res);
              if (!--pending) resolve(results);
            })
            .catch(reject);
        } else {
          results.push(filePath);
          if (!--pending) resolve(results);
        }
      });
    });
  });
}
