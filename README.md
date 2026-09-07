# Nordic RentAway — visningsversion för Johan

Visningsversion med omarbetad boutiquedesign, tydliga vägar för gäster och bostadsägare, företagets godkända fotografier och originallogotyp. 13 förgenererade HTML-sidor, vanlig CSS och små JavaScript-moduler. Ingen ny bokningsplattform, databas, spårning eller formulärtjänst.

## Publicering

GitHub Actions bygger, testar och försöker publicera en separat GitHub Pages-visning vid ändringar på `main`. Företagets befintliga hemsida, domän och Holidayfuture lämnas orörda. Endast `dist/` publiceras, inte källor eller projektdokument.

**Första aktivering:** öppna repo Settings → Pages → Build and deployment → Source → GitHub Actions. Ett privat personligt repo kräver GitHub Pro för Pages. Ändra inte repots synlighet och köp inte abonnemang utan uttryckligt beslut. Därefter kan det misslyckade deploy-jobbet köras om eller hela arbetsflödet startas via Run workflow.

Den konfigurerade adressen är `https://joakimmoleni.github.io/nordicrentaway/`. Det är en målkonfiguration, inte bevis på en fungerande publicering. Kontrollera senaste Actions-körning och öppna adressen innan länken skickas till Johan. Resultatet ska vara märkt som förhandsvisning och ha noindex. Noindex är inte ett åtkomstskydd; publicera bara godkänt offentligt innehåll.

Arbetsflödet sparar också artefakten `johan-preview` med exakt källversion och färdig webbplats, även om Pages ännu inte är aktiverat.

## Arbeta med innehållet

Läs `AGENTS.md` och `docs/content-model.md`. Johan beskriver sin ändring i en ChatGPT-session med verifierad åtkomst till detta repo. Agenten ändrar källfiler, kontrollerar resultatet och sparar ändringen. Personlig åtkomst för Johan måste ordnas separat; detta repo ger inte automatiskt hans chattar behörighet.

## Bygg lokalt

Node.js 22 och ImageMagick (`convert`) används i byggmiljön. Inga npm-paket behövs.

```sh
node scripts/prepare-media.mjs
node scripts/validate.mjs
node --test tests/core.test.mjs
node scripts/build.mjs
node scripts/serve.mjs
```

Öppna därefter `http://127.0.0.1:4173`. För ett redan byggt paket kan `site/index.html` eller `dist/index.html` också öppnas direkt; fulla JavaScript-förbättringar testas via HTTP.

Bilder hämtas vid bygge från en kort lista uttryckligen godkända original, låses till SHA-256 och optimeras till lokala JPEG/WebP-varianter. Ingen webbläsarhotlinkning och ingen löpande skrapning av boendekatalogen. Om en källbild ändras stoppas bygget tills den nya bilden granskats. Ett misslyckat bygge ersätter inte föregående fungerande `dist` eller publicerad sida.

## Dokument

- `docs/johan-guide.md` — användning och granskning.
- `docs/change-prompts.md` — fyra ändringsuppdrag.
- `docs/content-model.md` — var varje innehållstyp finns.
- `docs/architecture.md` — teknisk struktur och publicering.
- `docs/sources.md` — fakta, mediekällor och godkännande.
- `docs/production-checklist.md` — vad som återstår före byte av företagets riktiga sida.

Originalets korta README finns bevarad som `README.original.md`.
