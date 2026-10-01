// Baixa as imagens e o vídeo do site publicado no Lovable e salva em public/.
// Uso (dentro da pasta do projeto):  node baixar-midias.mjs
// Precisa do Node 18 ou superior.
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://indigo-ivory-tale.lovable.app";

const arquivos = [
  ["0cab1168-4c88-4565-b148-d62f9402942d", "foto-inicial-sala-piano.jpg", "imagens"],
  ["6098cc3a-b68a-4da9-a1bf-c29916f07230", "logo-navarro-leite.jpg", "imagens"],
  ["a85ad8d0-d638-434c-bd93-3cbdeb5d18aa", "projeto-banheiro.jpg", "imagens"],
  ["68a2d838-80df-4d13-8315-5f1bb5bc70f8", "projeto-cozinha.jpg", "imagens"],
  ["6bb6a957-0824-4497-9b3f-964fec5aeb85", "projeto-obra.jpg", "imagens"],
  ["281bc8df-2092-45f4-ab51-893ac80580ff", "projeto-sala.jpg", "imagens"],
  ["c9b1b54e-7e9a-49f0-aa67-721b291d09ed", "quarto-lua-01.jpg", "imagens"],
  ["f766384b-4156-4e5f-a3d6-73c346c3f27a", "quarto-lua-02.jpg", "imagens"],
  ["71cfd2da-c1b9-4e36-8cde-288bcfea3a0c", "quarto-lua-03.jpg", "imagens"],
  ["0c10a48f-d0b0-48ee-8401-4e8d31198859", "suite-01.jpg", "imagens"],
  ["20e1f305-96a0-46ad-9f62-7e2a49340271", "suite-02.jpg", "imagens"],
  ["3d43a993-38ba-4c12-bca6-cabe61373cc4", "suite-03.jpg", "imagens"],
  ["b18ac4d7-b218-4df9-948c-789fc2f84f5e", "suite-04.jpg", "imagens"],
  ["eec6a506-a868-44ef-9d69-acaef4959236", "sobre-navarro-capa.jpg", "imagens"],
  ["48a72bdf-3a95-44cc-90f7-a956e25e0bf7", "sobre-navarro-compativel.mp4", "video"],
];

let falhas = 0;
for (const [id, nome, pasta] of arquivos) {
  const url = `${BASE}/__l5e/assets-v1/${id}/${nome}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dados = Buffer.from(await res.arrayBuffer());
    await mkdir(`public/${pasta}`, { recursive: true });
    await writeFile(`public/${pasta}/${nome}`, dados);
    console.log(`OK     public/${pasta}/${nome} (${Math.round(dados.length / 1024)} KB)`);
  } catch (e) {
    falhas++;
    console.log(`FALHOU ${nome}: ${e.message}\n       tente abrir no navegador: ${url}`);
  }
}
console.log(falhas ? `\n${falhas} arquivo(s) falharam.` : "\nTudo baixado! Agora faça o commit e o push.");
