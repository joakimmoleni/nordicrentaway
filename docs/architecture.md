# Arkitektur

Innehållsfiler → validering → gemensamma mallar → statisk dist → GitHub Pages-preview.

Sajten återanvänder den tidigare lokala implementationen: förgenererad HTML, fyra vanliga CSS-filer och små ES-moduler för mobilmeny, bildfel och galleri. Ingen SPA, databas, CMS, spårning, extern font eller bokningsintegration. Alla texter och kontaktlänkar finns utan JavaScript. Bokningar länkas till befintliga Holidayfuture.

Node.js 22 kör byggskripten utan npm-paket. ImageMagick förbereder uttryckligen godkända bilder till JPEG/WebP. Källornas SHA-256 kontrolleras före användning. Webbläsaren laddar enbart lokala tillgångar från visningssidan. Ingen katalogskrapning eller automatisk import av boendeinnehåll körs.

`build.mjs` skriver i en temporär katalog, validerar interna länkar och sidmetadata och byter sedan ut dist. Fel lämnar föregående fungerande version intakt. GitHub Actions bygger och testar före deploy. Bara dist publiceras; källor och dokument finns kvar i privat repo.

Preview använder repo-URL från site.json eller PREVIEW_URL, noindex och robots Disallow. Relativa sidlänkar fungerar under /nordicrentaway/; 404-sidan får korrekt base-path. Production är medvetet blockerad tills domän, innehåll, media, policyer och publiceringsväg verifierats. Byt inte dessa flaggor bara för att få en grön build.

Kontakt är mailto/tel, inte ett formulär som låtsas leverera. Förberedd formulärmodell är inaktiv. Ingen e-post skickas av sajten. En offentlig preview är inte hemlig: noindex är en sökmotorinstruktion, inte autentisering.

Återställning sker genom en ny commit som återför en avgränsad ändring. Ingen force-push behövs. GitHub Pages-aktivering och Johans personliga repoåtkomst är administrativa engångssteg, inte sådant som ett lyckat lokalt bygge bevisar.
