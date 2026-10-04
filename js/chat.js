// Nexus Core — widget do assistente de IA
// Conversa com o serviço chat-api no Render. Não guarda nada no navegador.
(() => {
  const API_URL = "https://nexus-core-chat.onrender.com/chat";
  const SUGESTOES = [
    "O que o NexGrade faz?",
    "Como funciona o Yardflow?",
    "Como peço uma demonstração?",
  ];

  const css = `
  .nc-chat-btn{position:fixed;right:20px;bottom:20px;z-index:9998;display:flex;align-items:center;gap:10px;
    padding:12px 18px 12px 14px;border:1px solid var(--azul-claro,#42a5f5);border-radius:999px;
    background:var(--azul,#1565c0);color:#fff;font:600 15px/1 var(--f-body,Inter,sans-serif);cursor:pointer;
    box-shadow:0 8px 24px rgba(0,0,0,.35);transition:background .15s}
  .nc-chat-btn:hover{background:var(--azul-escuro,#0d47a1)}
  .nc-chat-btn:focus-visible,.nc-chat button:focus-visible,.nc-chat textarea:focus-visible{outline:2px solid var(--ambar-yard,#ffb300);outline-offset:2px}
  .nc-chat-btn svg{width:20px;height:20px;flex:none}
  .nc-chat-btn[hidden]{display:none}
  .nc-chat{position:fixed;right:20px;bottom:20px;z-index:9999;width:380px;max-width:calc(100vw - 24px);
    height:560px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;
    background:var(--bg-elevated,#0f2540);border:1px solid var(--border,#1e3a5f);border-radius:var(--radius,14px);
    box-shadow:0 16px 48px rgba(0,0,0,.5);color:var(--texto,#eceff1);font:15px/1.55 var(--f-body,Inter,sans-serif);overflow:hidden}
  .nc-chat[hidden]{display:none}
  .nc-chat-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 12px;
    border-bottom:1px solid var(--border,#1e3a5f)}
  .nc-chat-head h2{font:700 16px/1.3 var(--f-display,Montserrat,sans-serif);margin:0}
  .nc-chat-head p{margin:2px 0 0;font-size:13px;color:var(--texto-muted,#90a4ae)}
  .nc-chat-close{background:none;border:0;color:var(--texto-muted,#90a4ae);cursor:pointer;padding:4px;border-radius:6px;line-height:0}
  .nc-chat-close:hover{color:var(--texto,#eceff1)}
  .nc-chat-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
  .nc-msg{max-width:88%;padding:10px 13px;border-radius:12px;word-wrap:break-word}
  .nc-msg p{margin:0;color:inherit;font-size:inherit;line-height:inherit}.nc-msg p+p{margin-top:8px}
  .nc-msg a{color:var(--azul-claro,#42a5f5)}
  .nc-msg.bot{align-self:flex-start;background:var(--surface,#132f4c);border-bottom-left-radius:4px}
  .nc-msg.user{align-self:flex-end;background:var(--azul,#1565c0);color:#fff;border-bottom-right-radius:4px}
  .nc-msg.wait{color:var(--texto-muted,#90a4ae);font-style:italic}
  .nc-sug{display:flex;flex-wrap:wrap;gap:8px}
  .nc-sug button{background:transparent;border:1px solid var(--border,#1e3a5f);color:var(--texto,#eceff1);
    padding:7px 12px;border-radius:999px;font:500 13px/1.2 var(--f-body,Inter,sans-serif);cursor:pointer}
  .nc-sug button:hover{border-color:var(--azul-claro,#42a5f5)}
  .nc-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--border,#1e3a5f)}
  .nc-chat-form textarea{flex:1;resize:none;height:44px;max-height:120px;padding:11px 12px;border-radius:var(--radius-sm,8px);
    border:1px solid var(--border,#1e3a5f);background:var(--bg,#0a1929);color:var(--texto,#eceff1);font:inherit}
  .nc-chat-form button{padding:0 16px;border:0;border-radius:var(--radius-sm,8px);background:var(--azul,#1565c0);
    color:#fff;font:600 14px var(--f-body,Inter,sans-serif);cursor:pointer}
  .nc-chat-form button:disabled{opacity:.5;cursor:default}
  .nc-chat-foot{padding:0 12px 10px;font-size:11.5px;color:var(--texto-tenue,#5f7a91)}
  @media (max-width:480px){
    .nc-chat{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}
    .nc-chat-btn{right:14px;bottom:14px}
  }`;

  const ICONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  const FECHAR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function esc(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // Texto do modelo -> HTML seguro (parágrafos, negrito, links do site e e-mail)
  function formatar(texto) {
    return esc(texto).split(/\n{2,}/).map((p) => {
      let h = p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      h = h.replace(/([\w.+-]+@nexuscoretecnologia\.com\.br)/g, '<a href="mailto:$1">$1</a>');
      h = h.replace(/(^|[\s(])(\/[a-z-]+\.html)/g, '$1<a href="$2">$2</a>');
      return `<p>${h}</p>`;
    }).join("");
  }

  function montar() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nc-chat-btn";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.innerHTML = `${ICONE}<span>Tire suas dúvidas</span>`;

    const box = document.createElement("section");
    box.className = "nc-chat";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Assistente da Nexus Core");
    box.innerHTML = `
      <div class="nc-chat-head">
        <div><h2>Assistente Nexus Core</h2><p>Responde sobre nossos sistemas, com base neste site.</p></div>
        <button type="button" class="nc-chat-close" aria-label="Fechar o chat">${FECHAR}</button>
      </div>
      <div class="nc-chat-log" aria-live="polite">
        <div class="nc-msg bot"><p>Olá! Pergunte sobre o NexGrade, as Soluções Educacionais ou o Yardflow.</p></div>
        <div class="nc-sug">${SUGESTOES.map((s) => `<button type="button">${esc(s)}</button>`).join("")}</div>
      </div>
      <form class="nc-chat-form">
        <textarea rows="1" maxlength="800" placeholder="Escreva sua pergunta" aria-label="Sua pergunta"></textarea>
        <button type="submit">Enviar</button>
      </form>
      <div class="nc-chat-foot">Respostas geradas por IA podem conter erros. Para propostas, use a página de contato.</div>`;

    document.body.append(btn, box);

    const log = box.querySelector(".nc-chat-log");
    const form = box.querySelector("form");
    const input = form.querySelector("textarea");
    const enviar = form.querySelector("button");
    const historico = [];
    let ocupado = false;

    const abrir = () => { box.hidden = false; btn.hidden = true; input.focus(); };
    const fechar = () => { box.hidden = true; btn.hidden = false; btn.focus(); };
    btn.addEventListener("click", abrir);
    box.querySelector(".nc-chat-close").addEventListener("click", fechar);
    box.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });

    function addMsg(tipo, html) {
      const d = document.createElement("div");
      d.className = `nc-msg ${tipo}`;
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }

    async function perguntar(texto) {
      texto = texto.trim();
      if (!texto || ocupado) return;
      ocupado = true; enviar.disabled = true;
      box.querySelector(".nc-sug")?.remove();
      addMsg("user", `<p>${esc(texto)}</p>`);
      historico.push({ role: "user", content: texto });
      input.value = "";

      const espera = addMsg("bot wait", "<p>Pensando…</p>");
      // Serviço gratuito pode estar "dormindo": avisa se demorar
      const aviso = setTimeout(() => {
        espera.innerHTML = "<p>Iniciando o assistente, isso pode levar alguns segundos…</p>";
      }, 6000);

      let resposta;
      try {
        const r = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historico }),
        });
        const data = await r.json().catch(() => ({}));
        resposta = data.reply || "Não consegui responder agora. Tente de novo ou use a página /contato.html.";
        if (r.ok) historico.push({ role: "assistant", content: resposta });
        else historico.pop();
      } catch {
        resposta = "Sem conexão com o assistente. Verifique sua internet ou fale com a equipe em /contato.html.";
        historico.pop();
      }
      clearTimeout(aviso);
      espera.className = "nc-msg bot";
      espera.innerHTML = formatar(resposta);
      log.scrollTop = log.scrollHeight;
      ocupado = false; enviar.disabled = false;
      input.focus();
    }

    form.addEventListener("submit", (e) => { e.preventDefault(); perguntar(input.value); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); perguntar(input.value); }
    });
    log.addEventListener("click", (e) => {
      const b = e.target.closest(".nc-sug button");
      if (b) perguntar(b.textContent);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();
