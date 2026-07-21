#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { loadAppEnv } = require("./load-app-env");

const root = path.join(__dirname, "..");
loadAppEnv(root);

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) {
  console.error("❌ EXPO_PUBLIC_API_URL não definida em financeiro-app/.env");
  process.exit(1);
}

const output = path.join(root, "src/config/api-url.generated.ts");
const contents = `// Gerado automaticamente — não editar manualmente
export const API_URL = ${JSON.stringify(apiUrl)};
`;

fs.writeFileSync(output, contents);
console.log(`[api] URL embutida no app: ${apiUrl}`);
