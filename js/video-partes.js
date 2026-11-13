// [VIDEOS-POR-PARTE] menu dos vídeos curtos da página do NexGrade:
// clicar numa parte troca o vídeo do player; "Próxima parte" passa para a seguinte.
document.addEventListener("DOMContentLoaded", () => {
  const raiz = document.getElementById("video-partes");
  if (!raiz) return;
  const video = document.getElementById("vp-video");
  const legenda = document.getElementById("vp-legenda");
  const proxima = document.getElementById("vp-proxima");
  const botoes = Array.from(raiz.querySelectorAll(".vp-menu button"));
  let atual = 0;

  function abrir(i, tocar) {
    atual = i;
    const b = botoes[i];
    botoes.forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "true");
    video.poster = b.dataset.poster;
    video.src = b.dataset.src;
    video.load();
    const titulo = b.querySelector("strong").textContent;
    legenda.textContent = `Parte ${i + 1} de ${botoes.length}: ${titulo}`;
    proxima.hidden = i === botoes.length - 1;
    if (tocar) {
      // no celular o menu fica embaixo do vídeo: traz o vídeo para a tela
      const r = video.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) video.scrollIntoView({ behavior: "smooth", block: "center" });
      video.play().catch(() => {});
    }
  }

  botoes.forEach((b, i) => b.addEventListener("click", () => abrir(i, true)));
  proxima.addEventListener("click", () => { if (atual < botoes.length - 1) abrir(atual + 1, true); });
  // não passa sozinho para a próxima: quem está seguindo no sistema precisa de tempo; só destaca o botão
  video.addEventListener("ended", () => proxima.classList.add("btn-primary"));
  video.addEventListener("play", () => proxima.classList.remove("btn-primary"));
});
