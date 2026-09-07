# Nordic RentAway — projektregler

## Aktuellt uppdrag

Beställaren har den 7 september 2026 godkänt att den tidigare lokala webbgrunden läggs i `joakimmoleni/nordicrentaway` och publiceras som en separat visningssida för Johan. Allt material på företagets befintliga hemsida är godkänt att återanvända i denna visning. Tidigare lokal-only-begränsning gäller alltså inte visningssidan.

Ändra inte företagets nuvarande hemsida, DNS, bokningssystem, betalplan eller repots privata synlighet. Inför inte Cloudflare eller annan tjänst utan nytt beslut. Skicka inga testmejl och gör inga bokningar.

## Ändringar

Läs aktuell fil och `docs/content-model.md`. Ändra källor, aldrig genererad `dist`. Bevara designen vid vanliga innehållsändringar. Vanilla HTML/CSS/JavaScript och Node-standardbibliotek; inga nya runtime-dependencies eller ramverk. Behåll stabila ID:n och sanningskällan för kontakter. Webbtexter är engelska; förklaringar till Johan är svenska.

Gissa inte priser, resultat, roller, omdömen, garantier eller objektuppgifter. Använd null/draft för saknade fakta. Generera aldrig påhittade fotografier av riktiga bostäder. Företagets publicerade material är godkänt, men bildtexter måste ändå beskriva rätt motiv: poolbilden visar SeaCoasts gemensamma område och Altea-bilden är inte SeaCoast. Använd inte bilden av staplade händer som ett dokumentärt teamporträtt.

## Kontroll och publicering

På ren checkout: `node scripts/prepare-media.mjs`. Därefter `node scripts/validate.mjs`, `node --test tests/core.test.mjs`, `node scripts/build.mjs`. Kontrollera berörda sidor vid 360, 390, 768 och 1440 px med riktiga bilder. Kontrollera meny, kontaktlänkar, galleri och felstatus. Behåll föregående fungerande bygge om något misslyckas.

`main` utlöser GitHub Actions för en separat Pages-preview. Kontrollera verkligt resultat; en commit, byggartefakt eller konfigurerad URL är inte samma sak som en publicerad sida. Pages måste aktiveras i repo Settings. Påstå inte att Johan kan redigera i sin egen ChatGPT förrän hans åtkomst har verifierats. Preview ska ha noindex och ingen riktig företagsdomän. `--production` kräver separat verifiering och godkännande.

## Återställning

Gör en avgränsad revert eller återställ identifierade källfiler i en ny commit. Aldrig force-push, reset --hard eller radering av andras ändringar. Bygg och verifiera återställningen. Redovisa tydligt ändrat, testat, publicerat och det som återstår.
