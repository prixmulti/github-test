(function () {
  const grid = document.getElementById("hilsenGrid");
  const empty = document.getElementById("hilsenEmpty");
  const error = document.getElementById("hilsenError");
  const lightbox = document.getElementById("hilsenLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxName = document.getElementById("lightboxName");
  const lightboxDate = document.getElementById("lightboxDate");
  const lightboxMsg = document.getElementById("lightboxMsg");

  if (!grid) {
    return;
  }

  const formatDate = (iso) => {
    if (!iso) {
      return "";
    }
    try {
      return new Intl.DateTimeFormat("da-DK", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  };

  const escapeHtml = (value) => {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  };

  const openLightbox = (item) => {
    if (!lightbox || !lightboxImg) {
      return;
    }

    lightboxImg.src = item.image || "";
    lightboxImg.alt = "Billede fra " + (item.name || "gæst");

    if (lightboxName) {
      lightboxName.textContent = item.name || "Anonym";
    }
    if (lightboxDate) {
      lightboxDate.textContent = formatDate(item.created);
    }
    if (lightboxMsg) {
      lightboxMsg.textContent = item.message || "";
    }

    lightbox.showModal();
  };

  const closeLightbox = () => {
    lightbox?.close();
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
    }
  };

  lightbox?.querySelectorAll("[data-close-lightbox]").forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });

  lightbox?.addEventListener("click", (event) => {
    const rect = lightbox.getBoundingClientRect();
    const inDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inDialog) {
      closeLightbox();
    }
  });

  lightbox?.addEventListener("close", () => {
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
    }
  });

  const render = (items) => {
    grid.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "hilsen-card";

      const imgBtn = document.createElement("button");
      imgBtn.type = "button";
      imgBtn.className = "hilsen-img-btn";
      imgBtn.setAttribute("aria-label", "Forstør billede fra " + (item.name || "gæst"));

      const imgWrap = document.createElement("div");
      imgWrap.className = "hilsen-img-wrap";

      const img = document.createElement("img");
      img.className = "hilsen-img";
      img.src = item.image || "";
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";

      imgWrap.appendChild(img);
      imgBtn.appendChild(imgWrap);

      imgBtn.addEventListener("click", () => openLightbox(item));

      const body = document.createElement("div");
      body.className = "hilsen-card-body";

      const nameEl = document.createElement("p");
      nameEl.className = "hilsen-name";
      nameEl.textContent = item.name || "Anonym";

      const dateEl = document.createElement("p");
      dateEl.className = "hilsen-date";
      dateEl.textContent = formatDate(item.created);

      const msgEl = document.createElement("blockquote");
      msgEl.className = "hilsen-msg";
      msgEl.textContent = item.message || "";

      body.appendChild(nameEl);
      body.appendChild(dateEl);
      body.appendChild(msgEl);

      card.appendChild(imgBtn);
      card.appendChild(body);
      grid.appendChild(card);
    });
  };

  const load = async () => {
    try {
      const response = await fetch("api/hilsner.php", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("bad status");
      }

      const items = await response.json();
      if (!Array.isArray(items) || items.length === 0) {
        empty.hidden = false;
        return;
      }

      empty.hidden = true;
      render(items);
    } catch {
      error.hidden = false;
    }
  };

  load();
})();