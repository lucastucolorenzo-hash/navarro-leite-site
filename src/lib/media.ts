// Caminhos das mídias do site. Os arquivos ficam na pasta /public
// (public/imagens e public/video) e são servidos direto pela Vercel.
const img = (name: string) => ({ url: `/imagens/${name}` });

export const logoAsset = img("logo-navarro-leite.jpg");
export const heroRoom = img("foto-inicial-sala-piano.jpg");
export const roomMoon01 = img("quarto-lua-01.jpg");
export const roomMoon02 = img("quarto-lua-02.jpg");
export const roomMoon03 = img("quarto-lua-03.jpg");
export const suite01 = img("suite-01.jpg");
export const suite02 = img("suite-02.jpg");
export const suite03 = img("suite-03.jpg");
export const suite04 = img("suite-04.jpg");
export const projectBathroom = img("projeto-banheiro.jpg");
export const projectKitchen = img("projeto-cozinha.jpg");
export const projectLivingRoom = img("projeto-sala.jpg");
export const projectInProgress = img("projeto-obra.jpg");
export const aboutPoster = img("sobre-navarro-capa.jpg");
export const aboutVideo = { url: "/video/sobre-navarro-compativel.mp4" };
