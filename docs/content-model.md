# Innehållskarta

`content/site.json`: namn, gemensamma UI-texter, navigation, gästkontakt, bokningslänk, preview-URL och produktionsgodkännanden. `ownerContactId` hänvisar till en person i `content/team.json`; telefon och e-post ska inte dupliceras i mallar.

`content/pages/home.json`: startsidans rubrik, intro, process och avsnitt. `heroMediaId` väljer huvudbild. `content/pages/about.json`: presentation och `photoMediaId`. `contact.json`: kontaktintro och förberedd men inaktiv formulärmodell. `services.json` och `properties.json`: respektive översikt och återkommande texter.

`content/services/*.json`: fyra verifierade tjänster. `content/properties/*.json`: redaktionellt urval om tre faktiska boenden. Varje objekt har stabilt id, unik slug, status draft/published, ort, lokaliserad bostadstyp, namn/beskrivning/SEO, mediereferenser och källänk. Sovrum, badrum och gästantal kan vara null när de inte är kända. Projektbidrag (`scope`) får bara anges med egen källa (`scopeSource`). Inga nattpriser eller ledighetsmarkeringar.

`content/media.json`: stabilt id, godkännandestatus, originalkälla, källsida, SHA-256, dimensioner, lokala bildvarianter, alt-text, bildtext och fokuspunkt. Byggsteget förbereder public/assets; dessa binärer hålls utanför Git. Byt aldrig SHA utan att granska originalet. Godkänt eget nytt foto behöver en beslutad tillgänglig originalkälla eller versionshanterade optimerade bildfiler; lägg inte upp det på en ny extern tjänst utan beslut.

`content/redirects.json`: karta inför eventuell framtida domänflytt, inte aktiva omdirigeringar i nuvarande preview. `content/video.json`: valfri, inaktiv videokonfiguration. Ingen film hämtas när sidan öppnas.

## Vanliga ändringar

Text: ändra relevant en-fält och bygg. Bild: granska motivet, lägg in metadata och godkänd källa, förbered varianter, ändra mediareferens. Boende: kopiera en befintlig JSON, ge nytt stabilt id/slug, verifiera alla uppgifter och bygg; ingen layoutkod ska behöva ändras. Slugbyte kräver att gamla länkar hanteras.

Mallarna finns i `src/templates/`, layout i `src/styles/`, progressive enhancement i `src/scripts/`. Gör inte innehållsändringar där. Testobjekt får endast förekomma i isolerade testkopior.
