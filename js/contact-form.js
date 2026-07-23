document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const btn = document.getElementById("form-submit-btn");
  if (!form || !status || !btn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const accessKey = form.querySelector('input[name="access_key"]').value;
    if (!accessKey || accessKey.startsWith("SUBSTITUA_")) {
      status.textContent = "Formulário ainda não configurado. Fale direto por e-mail: contato@nexuscoretecnologia.com.br";
      status.style.color = "#ffb300";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    status.textContent = "";

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json();

      if (data.success) {
        status.textContent = "Mensagem enviada! Retornamos em breve.";
        status.style.color = "#26a69a";
        form.reset();
      } else {
        throw new Error(data.message || "Falha no envio");
      }
    } catch (err) {
      status.textContent = "Não foi possível enviar agora. Tente novamente ou escreva para contato@nexuscoretecnologia.com.br";
      status.style.color = "#e53935";
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar mensagem";
    }
  });
});
