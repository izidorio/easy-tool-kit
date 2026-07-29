#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
UNPACKED_DIR="$ROOT_DIR/dist/win-unpacked"
LOCALES_DIR="$UNPACKED_DIR/locales"
ZIP_PATH="$ROOT_DIR/dist/easy-tool-kit.zip"

if [[ ! -d "$UNPACKED_DIR" ]]; then
  echo "Erro: diretório não encontrado: $UNPACKED_DIR" >&2
  exit 1
fi

if [[ ! -f "$ROOT_DIR/_down.bash" ]]; then
  echo "Erro: arquivo não encontrado: $ROOT_DIR/_down.bash" >&2
  exit 1
fi

# 1) Copiar _down.bash para dist/win-unpacked
cp "$ROOT_DIR/_down.bash" "$UNPACKED_DIR/_down.bash"
echo "Copiado: _down.bash -> dist/win-unpacked/"

# 2) Limpar locales, mantendo apenas pt-BR.pak
if [[ ! -d "$LOCALES_DIR" ]]; then
  echo "Erro: diretório não encontrado: $LOCALES_DIR" >&2
  exit 1
fi

if [[ ! -f "$LOCALES_DIR/pt-BR.pak" ]]; then
  echo "Erro: arquivo não encontrado: $LOCALES_DIR/pt-BR.pak" >&2
  exit 1
fi

find "$LOCALES_DIR" -type f ! -name 'pt-BR.pak' -delete
echo "Locales limpos: mantido apenas pt-BR.pak"

# 3) Compactar o conteúdo de win-unpacked em dist/easy-tool-kit.zip
rm -f "$ZIP_PATH"
(
  cd "$UNPACKED_DIR"
  zip -r "$ZIP_PATH" .
)
echo "Arquivo gerado: dist/easy-tool-kit.zip"
