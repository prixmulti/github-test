(function () {
  const openBtn = document.getElementById("openHilsenBtn");
  const dialog = document.getElementById("hilsenDialog");
  const form = document.getElementById("hilsenForm");
  const statusEl = document.getElementById("hilsenFormStatus");
  const closeTargets = dialog?.querySelectorAll("[data-close-dialog]");

  if (!openBtn || !dialog || !form) {
    return;
  }

  const setStatus = (text, isError) => {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", Boolean(isError));
    statusEl.classList.toggle("is-success", Boolean(text) && !isError);
  };

  const openDialog = () => {
    setStatus("", false);
    dialog.showModal();
  };

  const closeDialog = () => {
    dialog.close();
  };

  openBtn.addEventListener("click", openDialog);

  closeTargets?.forEach((el) => {
    el.addEventListener("click", closeDialog);
  });

  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inDialog) {
      closeDialog();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Sender...", false);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch("upload.php", {
        method: "POST",
        body: new FormData(form),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = { ok: false, error: "Uventet svar fra serveren." };
      }

      if (!response.ok || !data.ok) {
        setStatus(data.error || "Noget gik galt.", true);
        return;
      }

      form.reset();
      setStatus("Tak! Hilsenen er gemt til Henning.", false);
      setTimeout(closeDialog, 1400);
    } catch {
      setStatus("Kunne ikke oprette forbindelse. Tjek nettet.", true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  });
})();