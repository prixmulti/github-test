# GitHub → cPanel FTP deploy (test)

Simpel one-page hjemmeside der deployes automatisk til din server, når du pusher til `main` på GitHub.

## Sådan virker det

1. Du ændrer filer lokalt og pusher til GitHub.
2. GitHub Actions kører workflowet i [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
3. Actionen forbinder med FTP og uploader `index.html`, `styles.css` og øvrige filer (ikke `.github`).

## Del 1: Opret FTP i cPanel

1. Log ind på **cPanel** hos dit webhotel.
2. Åbn **FTP Accounts** / **FTP-konti**.
3. Opret en ny konto (anbefalet) eller brug en eksisterende.
4. Sæt **Document Root** til den mappe sitet skal ligge i, fx:
   - `public_html/github-test` (godt til første test)
   - eller `public_html` hvis det skal være forsiden
5. Gem disse oplysninger et sikkert sted (de skal ind i GitHub Secrets):

| Fra cPanel | Betydning |
|------------|-----------|
| Server / Host | Fx `ftp.ditdomæne.dk` eller en IP |
| Brugernavn | Ofte `navn@ditdomæne.dk` |
| Adgangskode | Den du valgte ved oprettelse |
| Mappe | Den rod FTP-brugeren skriver i (ofte samme som Document Root) |

**FTP vs FTPS:** De fleste shared hosts på port 21. Hvis deploy fejler på login, kan hosten kræve FTPS – se fejlsøgning nederst.

## Del 2: GitHub-repo

Hvis repo ikke findes endnu:

```bash
git init -b main
git add .
git commit -m "Initial commit: one-page FTP deploy test"
gh repo create github-test --public --source=. --remote=origin --push
```

Eller opret repo manuelt på [github.com/new](https://github.com/new), tilføj remote og push:

```bash
git remote add origin git@github.com:DIT-BRUGERNAVN/github-test.git
git push -u origin main
```

## Del 3: GitHub Secrets (FTP oplysninger)

1. Gå til dit repo på GitHub.
2. **Settings** → **Secrets and variables** → **Actions**.
3. Klik **New repository secret** og opret:

| Secret-navn | Værdi |
|-------------|--------|
| `FTP_SERVER` | Kun værtsnavn/IP, uden `ftp://` |
| `FTP_USERNAME` | FTP-brugernavn fra cPanel |
| `FTP_PASSWORD` | FTP-adgangskode |
| `FTP_SERVER_DIR` | Sti på serveren med slash til sidst. Brug `./` hvis FTP-kontoens rod allerede er den rigtige mappe. Fx `/public_html/github-test/` hvis du upload til den fulde sti fra serverroden |

**Vigtigt:** Commit aldrig adgangskoder i koden. Kun Secrets.

## Del 4: Første deploy

1. Efter secrets er sat: push til `main`, eller gå til **Actions** → **Deploy to FTP** → **Run workflow**.
2. Åbn workflow-kørslen og tjek at alle steps er grønne.
3. Besøg din URL (fx `https://ditdomæne.dk/github-test/`).

For at se at en ny deploy er landet, ændr teksten i `#version` i [`index.html`](index.html) og push igen.

## Fejlsøgning

| Problem | Hvad du kan prøve |
|---------|-------------------|
| Login failed | Brugernavn med `@domæne`, korrekt adgangskode, evt. FTPS |
| Connection timeout | Forkert `FTP_SERVER`, firewall, eller prøv SFTP hvis host kun tillader port 22 |
| Actions grøn, siden uændret | Forkert `FTP_SERVER_DIR`, forkert mappe, eller hard refresh i browser |
| 404 på URL | Siden ligger i undermappe – brug den sti cPanel viser for Document Root |

Log fra FTP-handshake står i Actions-loggen under step **FTP Deploy**.

## Filer i projektet

- `index.html` – testside
- `styles.css` – styling
- `.github/workflows/deploy.yml` – deploy ved push til `main`

## Lokal forhåndsvisning

Åbn `index.html` direkte i browseren, eller brug en simpel server:

```bash
python3 -m http.server 8080
```

Gå til `http://localhost:8080`.