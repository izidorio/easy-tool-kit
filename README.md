# Easy Tool Kit

Kit de ferramentas para gerenciar o download a descriptografia e processo de indexação de evidências.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Git actions

alterar a repositório em: Settings > Actions > General > Workflow permissions

de `Read repository ...` para `Read and write permissions` e Salvar

incluir arquivo `.github/workflows/release.yml`

incluir o script

```json
"scripts": {
    // ...
    "release": "electron-builder --publish always"
```

atualize a versão do atual do projeto em `package.json`

```json
"version": "0.0.1"
```

rodar o script

```cmd
git tag v0.0.1
git push
git push --tags
```
