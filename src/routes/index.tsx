import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ImagePlus, Instagram, MapPin, Maximize2, Menu, MessageCircle, Send, X } from "lucide-react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { logoAsset, roomMoon01, roomMoon02, roomMoon03, heroRoom, aboutVideo, aboutPoster, suite01, suite02, suite03, suite04, projectBathroom, projectKitchen, projectLivingRoom, projectInProgress } from "@/lib/media";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Navarro Leite Studio | Interiores, Reformas e Gestão de Obras" },
    { name: "description", content: "Projeto, reforma, gerenciamento e acompanhamento de obras em São Paulo. Uma história familiar construída desde 2001." },
    { property: "og:title", content: "Navarro Leite Studio | Projeto e Reforma" },
    { property: "og:description", content: "Da primeira ideia aos últimos detalhes da obra." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const navItems = [["Início", "#inicio"], ["Projetos", "#projetos"], ["Serviços", "#servicos"], ["Sobre", "#sobre"], ["Contato", "#contato"]];
const serviceGroups = [
  ["01", "Instalações", ["Elétrica", "Hidráulica", "Iluminação", "Ar-condicionado"]],
  ["02", "Obras e acabamentos", ["Alvenaria", "Pintura", "Gesso", "Drywall", "Pisos e revestimentos"]],
  ["03", "Marcenaria e pedras", ["Marcenaria", "Mármore", "Granito", "Quartzo"]],
  ["04", "Vidros e esquadrias", ["Vidros", "Box", "Espelhos", "Janelas", "Esquadrias", "Portas", "Envidraçamento"]],
  ["05", "Decoração e ambientes", ["Sofás", "Cortinas", "Persianas", "Tapetes", "Mobiliário", "Decoração"]],
];

const galleryImages = [
  { src: heroRoom.url, alt: "Sala reformada com piano e marcenaria planejada" },
  { src: projectBathroom.url, alt: "Banheiro reformado com espelho amplo, iluminação e box de vidro" },
  { src: projectKitchen.url, alt: "Cozinha planejada com marcenaria em madeira e bancada escura" },
  { src: projectLivingRoom.url, alt: "Sala de estar reformada com mobiliário planejado" },
  { src: projectInProgress.url, alt: "Reforma em andamento com nova abertura entre os ambientes" },
  { src: suite04.url, alt: "Marcenaria planejada da suíte" },
  { src: roomMoon01.url, alt: "Quarto infantil com painel de lua" },
  { src: roomMoon03.url, alt: "Armário e acabamentos do Quarto Lua" },
  { src: suite01.url, alt: "Iluminação e cabeceira da suíte" },
  { src: suite02.url, alt: "Suíte reformada com marcenaria e iluminação" },
  { src: suite03.url, alt: "Acabamentos e mobiliário da suíte" },
];

const quoteSchema = z.object({
  reformType: z.string().trim().min(1, "Selecione o tipo de reforma.").max(80),
  region: z.string().trim().min(1, "Selecione a região.").max(80),
  area: z.string().trim().regex(/^\d{1,5}([.,]\d{1,2})?$/, "Informe os metros quadrados usando apenas números."),
  photoCount: z.number().int().min(0).max(5),
});

const prepareQuoteMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => quoteSchema.parse(data))
  .handler(async ({ data }) => {
    const photoNote = data.photoCount
      ? `\nTenho ${data.photoCount} foto${data.photoCount > 1 ? "s" : ""} do ambiente para anexar nesta conversa.`
      : "\nAinda não selecionei fotos do ambiente.";
    const message = `Olá! Gostaria de solicitar um orçamento.\n\nTipo de reforma: ${data.reformType}\nRegião: ${data.region}\nMetros quadrados: ${data.area} m²${photoNote}`;
    return `https://wa.me/5511978577773?text=${encodeURIComponent(message)}`;
  });

async function sendQuoteToWhatsApp(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const photoInput = form.elements.namedItem("photos");
  const result = quoteSchema.safeParse({
    reformType: formData.get("reformType"),
    region: formData.get("region"),
    area: formData.get("area"),
    photoCount: photoInput instanceof HTMLInputElement ? photoInput.files?.length ?? 0 : 0,
  });
  const feedback = form.querySelector<HTMLElement>("[data-form-feedback]");

  if (!result.success) {
    if (feedback) feedback.textContent = result.error.issues[0]?.message ?? "Revise os campos informados.";
    return;
  }

  const photos = photoInput instanceof HTMLInputElement ? Array.from(photoInput.files ?? []) : [];
  const invalidPhoto = photos.find((photo) => !photo.type.startsWith("image/") || photo.size > 10 * 1024 * 1024);

  if (photos.length > 5 || invalidPhoto) {
    if (feedback) feedback.textContent = photos.length > 5 ? "Selecione no máximo 5 fotos." : "Use apenas imagens de até 10 MB cada.";
    return;
  }

  if (feedback) feedback.textContent = "Abrindo o WhatsApp para concluir a solicitação.";
  const whatsappUrl = await prepareQuoteMessage({ data: result.data });
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function showGalleryImage(index: number) {
  const dialog = document.querySelector<HTMLDialogElement>("#project-lightbox");
  const image = dialog?.querySelector<HTMLImageElement>("[data-lightbox-image]");
  const caption = dialog?.querySelector<HTMLElement>("[data-lightbox-caption]");
  const counter = dialog?.querySelector<HTMLElement>("[data-lightbox-counter]");
  const normalizedIndex = (index + galleryImages.length) % galleryImages.length;
  const selectedImage = galleryImages[normalizedIndex];
  if (!dialog || !image || !caption || !counter || !selectedImage) return;
  dialog.dataset["index"] = String(normalizedIndex);
  image.src = selectedImage.src;
  image.alt = selectedImage.alt;
  caption.textContent = selectedImage.alt;
  counter.textContent = `${normalizedIndex + 1} / ${galleryImages.length}`;
  if (!dialog.open) dialog.showModal();
}

function stepGallery(direction: number) {
  const dialog = document.querySelector<HTMLDialogElement>("#project-lightbox");
  if (!dialog) return;
  const currentIndex = Number(dialog.dataset["index"] ?? 0);
  showGalleryImage(currentIndex + direction);
}

function handleGalleryKeys(event: ReactKeyboardEvent<HTMLDialogElement>) {
  if (event.key === "ArrowLeft") stepGallery(-1);
  if (event.key === "ArrowRight") stepGallery(1);
}

function Index() {
  return <main id="inicio" className="overflow-hidden bg-background text-foreground">
    <header className="absolute inset-x-0 top-0 z-30 border-b border-surface/20 text-surface"><div className="mx-auto flex h-22 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><a href="#inicio" aria-label="Navarro Leite Studio — início" className="flex items-center gap-3"><span className="font-display text-4xl leading-none">NL</span><span className="hidden text-[10px] font-medium uppercase leading-tight tracking-[0.22em] sm:block">Navarro Leite<br />Studio</span></a><nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">{navItems.map(([label, href]) => <a key={href} href={href} className="text-xs uppercase tracking-[0.12em] transition-opacity hover:opacity-60">{label}</a>)}<Button asChild variant="light"><a href="#contato">Solicitar orçamento</a></Button></nav><details className="group relative lg:hidden"><summary className="grid size-11 cursor-pointer list-none place-items-center" aria-label="Abrir menu"><Menu className="group-open:hidden" /><span className="hidden font-display text-3xl leading-none group-open:block">×</span></summary><nav className="fixed inset-x-0 top-22 border-t border-surface/20 bg-primary px-5 py-6">{navItems.map(([label, href]) => <a key={href} href={href} className="block border-b border-surface/15 py-4 font-display text-2xl">{label}</a>)}</nav></details></div></header>
    <section className="relative min-h-[92svh] bg-primary text-primary-foreground"><img src={heroRoom.url} alt="Sala reformada com marcenaria planejada e piano, projeto Navarro Leite Studio" className="absolute inset-0 size-full object-cover object-[58%_center] opacity-55 sm:object-center" /><div className="absolute inset-0 bg-hero-overlay" /><div className="relative mx-auto flex min-h-[92svh] max-w-[1440px] items-end px-5 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-20"><div className="max-w-4xl animate-rise"><p className="mb-5 text-xs uppercase tracking-[0.24em] text-surface/80">Interiores · Reformas · Gestão de obras</p><h1 className="max-w-3xl font-display text-5xl leading-[0.98] sm:text-7xl lg:text-[5.8rem]">Projeto, reforma e acompanhamento em um só lugar.</h1><p className="mt-6 max-w-lg text-base leading-relaxed text-surface/85 sm:text-lg">Da primeira ideia aos últimos detalhes da obra.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button asChild variant="light" size="lg"><a href="#projetos">Conheça nossos projetos <ArrowRight size={16} /></a></Button><Button asChild variant="outline" size="lg"><a href="#contato">Fale conosco</a></Button></div></div><a href="#experiencia" aria-label="Continuar" className="absolute bottom-8 right-5 hidden size-12 place-items-center rounded-full border border-surface/50 sm:grid lg:right-12"><ArrowDown size={18} /></a></div></section>
    <section id="experiencia" className="bg-surface py-16 sm:py-20"><div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:grid-cols-3 sm:px-8 lg:px-12"><Stat value="+100" label="Obras e projetos realizados" /><Stat value="Desde 2001" label="Construindo experiência" border /><Stat value="Projeto + Obra + Gestão" label="Acompanhamento em todas as etapas" border compact /></div></section>
    <section id="projetos" className="py-20 sm:py-28"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><SectionHeading eyebrow="Projetos selecionados" title="Espaços pensados para serem vividos." /><div className="mt-12 grid gap-5 md:grid-cols-12 md:grid-rows-2"><Project image={suite02.url} title="Suíte contemporânea" category="Interiores · Marcenaria" className="md:col-span-7 md:row-span-2 md:min-h-[700px]" /><Project image={roomMoon02.url} title="Quarto Lua" category="Interiores · Decoração" className="md:col-span-5 md:min-h-[340px]" /><Project image={suite03.url} title="Detalhes que acolhem" category="Reforma · Iluminação" className="md:col-span-5 md:min-h-[340px]" /></div><div className="mt-7 flex justify-end"><Button asChild variant="outline"><a href="#galeria">Ver todos os projetos <ArrowRight size={15} /></a></Button></div></div></section>
    <section id="servicos" className="bg-primary py-20 text-primary-foreground sm:py-28"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><SectionHeading eyebrow="Nossa atuação" title="Rede de fornecedores e serviços" light /><p className="mt-8 max-w-3xl text-base leading-relaxed text-surface/70 sm:text-lg">Contamos com uma ampla rede de profissionais e fornecedores especializados, cuidadosamente selecionados para atender todas as etapas de uma reforma, garantindo qualidade, agilidade e excelência em cada detalhe.</p><div className="mt-14 grid border-t border-surface/25 md:grid-cols-2 xl:grid-cols-3">{serviceGroups.map(([n, title, items], index) => <article key={n as string} className={`border-b border-surface/25 py-8 md:px-8 ${index % 2 === 0 ? "md:border-r" : ""} ${index % 2 === 0 ? "md:pl-0" : ""} xl:border-r xl:pl-8 xl:pr-8 xl:first:pl-0 xl:nth-[3n]:border-r-0`}><span className="text-xs text-surface/50">{n as string}</span><h3 className="mt-4 font-display text-3xl sm:text-4xl">{title as string}</h3><ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-surface/70">{(items as string[]).map((item) => <li key={item} className="border-b border-surface/15 pb-3">{item}</li>)}</ul></article>)}</div></div></section>
    <section id="sobre" className="bg-surface py-20 sm:py-28"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12"><div className="order-2 lg:order-1"><p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Sobre nós</p><h2 className="font-display text-5xl leading-tight text-primary sm:text-6xl">Uma história construída obra após obra.</h2><div className="mt-7 space-y-4 text-base leading-relaxed text-muted-foreground"><p>A trajetória que deu origem à Navarro Leite Studio começou em 2001, com Marcos e sua primeira reforma.</p><p>Gabriel cresceu acompanhando o pai nos canteiros e também seguiu o caminho do Design de Interiores.</p><p>Hoje, pai e filho trabalham juntos, unindo experiência, uma nova geração e participação direta em cada transformação.</p></div></div><div className="relative order-1 overflow-hidden bg-primary lg:order-2"><video poster={aboutPoster.url} controls playsInline preload="metadata" className="aspect-video w-full object-cover" aria-label="Vídeo sobre a Navarro Leite Studio"><source src={aboutVideo.url} type="video/mp4" />Seu navegador não conseguiu reproduzir este vídeo.</video></div></div></section>
    <section id="galeria" className="py-20 sm:py-28"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><SectionHeading eyebrow="Projetos realizados" title="Galeria de reformas e acabamentos." /><p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground">Ambientes transformados com atenção à marcenaria, iluminação, revestimentos e aos detalhes de cada espaço.</p><div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{galleryImages.map((image, index) => <GalleryImage key={image.src} {...image} index={index} />)}</div></div><dialog id="project-lightbox" aria-label="Visualização ampliada dos projetos" onKeyDown={handleGalleryKeys} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} className="m-auto h-dvh max-h-none w-screen max-w-none bg-primary/95 p-0 text-primary-foreground backdrop:bg-primary/95"><div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] p-4 sm:p-6"><div className="flex items-center justify-between gap-4"><span data-lightbox-counter className="text-xs tracking-[0.14em] text-surface/70" /><Button type="button" variant="ghost" size="icon" aria-label="Fechar foto ampliada" onClick={(event) => event.currentTarget.closest("dialog")?.close()} className="shrink-0 text-surface"><X size={24} /></Button></div><div className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-5"><Button type="button" variant="ghost" size="icon" aria-label="Foto anterior" onClick={() => stepGallery(-1)} className="shrink-0 text-surface"><ChevronLeft size={30} /></Button><img data-lightbox-image src={galleryImages[0]?.src} alt={galleryImages[0]?.alt} className="max-h-full w-full object-contain" /><Button type="button" variant="ghost" size="icon" aria-label="Próxima foto" onClick={() => stepGallery(1)} className="shrink-0 text-surface"><ChevronRight size={30} /></Button></div><p data-lightbox-caption className="mx-auto max-w-2xl py-3 text-center text-sm text-surface/80 sm:py-4" /></div></dialog></section>
    <section id="contato" className="bg-accent py-20 sm:py-28"><div className="mx-auto max-w-[1180px] px-5 sm:px-8"><div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vamos conversar</p><h2 className="mt-5 max-w-xl font-display text-5xl leading-tight text-primary sm:text-7xl">Pensando em transformar seu imóvel?</h2><p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">Atuamos em São Paulo, com forte presença na região Norte, acompanhando cada projeto de perto.</p><div className="mt-6"><Button asChild variant="outline"><a href="https://www.instagram.com/studio.navarroleite/" target="_blank" rel="noreferrer"><Instagram size={17} /> Visite nosso Instagram</a></Button></div><div className="mt-10 border-t border-border pt-8"><MapPin className="text-primary" size={24} /><p className="mt-4 font-display text-2xl text-primary sm:text-3xl">Rua Filomena Bocchi Pilli, 152</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Jardim Monjolo · São Paulo — SP · CEP 02961-130</p><div className="mt-6"><Button asChild variant="outline"><a href="https://www.google.com/maps/place/R.+Filomena+Bocchi+Pilli,+152+-+Jardim+Monjolo,+S%C3%A3o+Paulo+-+SP,+02961-130/@-23.4937721,-46.7012309,17z/data=!3m1!4b1!4m6!3m5!1s0x94cef9b2b15e104d:0x1784c0d772cb000d!8m2!3d-23.4937721!4d-46.698656!16s%2Fg%2F11c4d05k7k?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer"><MapPin size={16} /> Como chegar</a></Button></div></div></div><form onSubmit={sendQuoteToWhatsApp} className="border-t border-primary/25 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"><div className="mb-8"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Solicite seu orçamento</p><h3 className="mt-3 font-display text-4xl text-primary sm:text-5xl">Conte um pouco sobre a reforma.</h3></div><div className="grid gap-6"><label className="grid gap-2 text-sm font-medium text-primary" htmlFor="reformType">Tipo de reforma<select id="reformType" name="reformType" required defaultValue="" className="min-h-13 w-full rounded-sm border border-border bg-background px-4 text-base font-normal text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring"><option value="" disabled>Selecione uma opção</option><option>Reforma completa</option><option>Reforma de ambiente</option><option>Projeto de interiores</option><option>Acompanhamento de obra</option><option>Outro</option></select></label><label className="grid gap-2 text-sm font-medium text-primary" htmlFor="region">Região<select id="region" name="region" required defaultValue="" className="min-h-13 w-full rounded-sm border border-border bg-background px-4 text-base font-normal text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring"><option value="" disabled>Selecione a região</option><option>Zona Norte</option><option>Zona Sul</option><option>Zona Leste</option><option>Zona Oeste</option><option>Centro</option><option>ABC Paulista</option><option>Grande São Paulo</option><option>Outra região</option></select></label><label className="grid gap-2 text-sm font-medium text-primary" htmlFor="area">Metros quadrados<input id="area" name="area" type="text" inputMode="decimal" required maxLength={8} placeholder="Ex.: 80" className="min-h-13 w-full rounded-sm border border-border bg-background px-4 text-base font-normal text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/70" /></label><label className="grid gap-2 text-sm font-medium text-primary" htmlFor="photos">Fotos do ambiente<span className="flex min-h-28 cursor-pointer items-center gap-4 rounded-sm border border-dashed border-primary/40 bg-background px-5 py-5 text-muted-foreground transition-colors hover:border-primary"><ImagePlus className="shrink-0 text-primary" size={26} /><span className="font-normal leading-relaxed">Selecione até 5 imagens, com no máximo 10 MB cada.</span></span><input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" /></label><p className="text-xs leading-relaxed text-muted-foreground">O WhatsApp não permite anexar arquivos automaticamente. Depois de abrir a conversa, envie as fotos selecionadas por lá.</p><p data-form-feedback aria-live="polite" className="min-h-5 text-sm font-medium text-primary" /><Button type="submit" size="lg" className="w-full sm:w-fit"><Send size={17} /> Enviar solicitação</Button></div></form></div></div></section>
    <footer className="bg-primary py-12 text-primary-foreground"><div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12"><div className="flex items-center gap-4"><img src={logoAsset.url} alt="Logo Navarro Leite Studio" className="size-20 rounded-full object-cover" /><div><p className="font-display text-2xl">Navarro Leite Studio</p><p className="mt-1 text-xs text-surface/55">São Paulo · SP</p></div></div><div className="flex flex-col gap-3 text-sm text-surface/75 sm:flex-row sm:items-center sm:gap-5"><a href="https://wa.me/5511978577773" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-surface"><MessageCircle size={17} /> (11) 97857-7773</a><a href="https://www.instagram.com/studio.navarroleite/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-surface"><Instagram size={17} /> Instagram</a><span>© 2026</span></div></div></footer>
    <a href="https://wa.me/5511978577773" target="_blank" rel="noreferrer" aria-label="Falar pelo WhatsApp" className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-contact text-contact-foreground shadow-elevated transition-transform hover:scale-105"><MessageCircle size={24} /></a>
  </main>;
}

function Stat({ value, label, border=false, compact=false }: { value: string; label: string; border?: boolean; compact?: boolean }) { return <div className={border ? "border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0" : ""}><strong className={`font-display text-primary ${compact ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl"}`}>{value}</strong><p className="mt-2 text-sm uppercase tracking-[0.12em] text-muted-foreground">{label}</p></div>; }
function SectionHeading({ eyebrow, title, light=false }: { eyebrow: string; title: string; light?: boolean }) { return <div className="grid gap-5 sm:grid-cols-[1fr_2fr]"><p className={light ? "text-xs uppercase tracking-[0.2em] text-surface/55" : "text-xs uppercase tracking-[0.2em] text-muted-foreground"}>{eyebrow}</p><h2 className={light ? "max-w-3xl font-display text-5xl leading-tight sm:text-6xl" : "max-w-3xl font-display text-5xl leading-tight text-primary sm:text-6xl"}>{title}</h2></div>; }
function Project({ image, title, category, className }: { image: string; title: string; category: string; className: string }) { return <article className={`group relative min-h-[420px] overflow-hidden bg-primary ${className}`}><img src={image} alt={title} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-project-overlay" /><div className="absolute inset-x-0 bottom-0 p-6 text-surface sm:p-8"><p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-surface/70">{category}</p><h3 className="font-display text-3xl sm:text-4xl">{title}</h3></div></article>; }
function GalleryImage({ src, alt, index }: { src: string; alt: string; index: number }) { return <figure className="group relative aspect-[4/3] overflow-hidden bg-surface"><Button type="button" variant="ghost" onClick={() => showGalleryImage(index)} aria-label={`Ampliar: ${alt}`} className="h-full w-full rounded-none p-0"><img src={src} alt={alt} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /><span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-primary/85 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><Maximize2 size={17} /></span></Button></figure>; }