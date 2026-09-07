# Verifiering av visningsversionen — 7 september 2026

Den tidigare lokala webbgrunden har återanvänts och fått godkända företagsbilder och originallogotyp. Faktiska original har hämtats från företagets server, kontrollerats och låsts till SHA-256 i content/media.json. Inga påhittade bostads- eller teamfoton används.

Lokalt: 20 Node-tester passerade. 13 genererade sidor kontrollerades vid 360, 390, 768 och 1440 px (52 renderingar): inget horisontellt överflöde, alla kontrollerade bilder laddade, inga synliga utvecklingsplatshållare och exakt en H1 per sida. Mobilmenyn öppnades och stängdes med Escape med återställd fokus. Alla tre boendegallerier öppnades med riktig bild och stängdes med Escape till ursprunglig länk. Simulerat bildfel visade en begriplig feltext.

Testbegränsning: denna arbetsmiljös Chromium blockerar vanliga lokala navigeringar. För renderingsprovet lästes den genererade HTML:en och den exakta CSS:en därför in direkt; lokala bilder bäddades in bara för provet. Meny- och gallerifunktionerna kördes utan modulimporterna. Detta är inte ett fullständigt HTTP-, Safari- eller verkligt iPhone-test. Bildernas placering och de första skärmvyerna på dator och mobil granskades visuellt.

Första GitHub-bygget identifierade att ImageMagick finns via PHP Imagick men inte som convert-program på GitHubs runner. Ett litet byggtidsadaptersteg använder den befintliga motorn; inga paket installeras och ingen PHP publiceras. Efterföljande körningsresultat finns i repo Actions och är sanningskällan för bygg- och deploystatus.

En konfigurerad Pages-URL är inte bevis för publicering. Settings → Pages måste aktiveras. Visningslänken får beskrivas som klar först efter lyckad deploy och kontroll av den offentliga sidan. Företagets befintliga webbplats och bokningssystem har inte ändrats.

## Design revision · 7 September 2026

Reworked the complete shared visual system and all 13 generated pages: warm rust and deep blue-green, a broad photographic opening, quieter typography, a varied property collection, and separate owner and guest contact paths. Preserved the original logo, real photographs, property facts, stable routes, and booking provider. Property detail availability links now point to the specific property's booking page.

Verification in this revision:
- Content validation, all 20 existing tests and the deterministic 13-page build pass.
- Real browser layout checks at 360, 390, 768 and 1440 pixel iframe widths; no horizontal overflow on the 12 content pages. Browser scrollbars consume 15 pixels in the test frames.
- Visually inspected home at phone, tablet and desktop sizes; service overview and a property detail; verified mobile navigation opens and navigates, gallery opens, single-image navigation is disabled, and Escape closes the dialog.
- Original company media was retrieved from the existing successful GitHub Pages output for local QA because the source server returned HTML to this environment. The existing pinned-original preparation in GitHub Actions is retained.
- No emails or bookings sent. The production company website is unchanged.

The dependency-free `package.json` supplies command aliases. The existing development server now accepts host/port arguments for supervised review; its default stays local-only. The temporary layout-review page is excluded from delivery.
