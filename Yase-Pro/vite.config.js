// import { defineConfig } from "vite";
// import { resolve } from "path";

// export default defineConfig({
//   root: "minhaApp-win32-x64/resources/app",
//   base: "./",
//   build: {
//     outDir: "../../../dist/app",
//     emptyOutDir: true,
//   },
//   server: {
//     port: 5173,
//   },
// });

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './Dashboard.html',
        cadastro: './CadastroUsuario.html',
        gestao: './GestaoOS.html',
        // Adicione as outras páginas aqui seguindo o mesmo padrão
      }
    }
  }
})