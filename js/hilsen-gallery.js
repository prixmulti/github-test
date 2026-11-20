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

  const render = (items) => {
    grid.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "hilsen-card";

      const figure = document.createElement("figure");
      figure.className = "hilsen-figure";

      const img = document.createElement("img");
      img.className = "hilsen-img";
      img.src = item.image || "";
      img.alt = "Billede fra " + (item.name || "gæst");
      img.loading = "lazy";
      img.decoding = "async";

      figure.appendChild(img);

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

      card.appendChild(figure);
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