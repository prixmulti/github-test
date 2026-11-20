(function () {
  const grid = document.getElementById("hilsenGrid");
  const empty = document.getElementById("hilsenEmpty");
  const error = document.getElementById("hilsenError");

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

  const render = (items) => {
    grid.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "hilsen-card";

      const imgWrap = document.createElement("div");
      imgWrap.className = "hilsen-img-wrap";

      const img = document.createElement("img");
      img.className = "hilsen-img";
      img.src = item.image || "";
      img.alt = "Billede til hilsen";
      img.loading = "lazy";
      img.decoding = "async";

      imgWrap.appendChild(img);

      const body = document.createElement("div");
      body.className = "hilsen-card-body";
      body.innerHTML =
        '<p class="hilsen-meta">' +
        escapeHtml(item.name || "Anonym") +
        " &middot; " +
        escapeHtml(formatDate(item.created)) +
        "</p>" +
        '<p class="hilsen-msg">' +
        escapeHtml(item.message || "") +
        "</p>";

      card.appendChild(imgWrap);
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