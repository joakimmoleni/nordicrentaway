# Johan — titta och ändra

Öppna den visningslänk som bekräftats fungera. Det är en separat version för granskning: företagets nuvarande webbplats och bokningssystem är inte utbytta. Bilderna och logotypen kommer från företagets befintliga sida.

Börja med startsidan på telefon. Kontrollera att erbjudandet känns rätt, att bilderna visar rätt hem och att dina kontaktuppgifter stämmer. Klicka vidare till tjänster och ett boende. Gäster hänvisas till den befintliga bokningssidan. E-post- och telefonknappar öppnar besökarens vanliga appar; inget skickas automatiskt.

## Be ChatGPT om en ändring

Använd en session med verifierad åtkomst till `joakimmoleni/nordicrentaway`. Din personliga behörighet måste ordnas separat; en repo-länk i en chatt räcker inte. Beskriv ändringen med vanliga ord och hänvisa till sidan eller bifoga godkänt material. Skriv exempelvis: ”Korta introduktionen om fastighetsskötsel, behåll resten och visa resultatet.”

Agenten ska hitta källfilen, ändra, validera, bygga och kontrollera berörda sidor. Du ska inte behöva redigera JSON eller använda terminal. När en ändring sparas på main startar arbetsflödet för visningssidan. Länken är uppdaterad först när deploy lyckats och sidan har kontrollerats. Om test eller bygge misslyckas behålls föregående fungerande publicering.

## Ångra

Be att en identifierad senaste ändring återställs utan att senare eller andras ändringar försvinner. Återställningen ska vara en ny commit som byggs och verifieras. Beskriv inte hela ditt ChatGPT-flöde som färdigt förrän just din åtkomst, visning och publicering har provats.

## Före riktig lansering

Granska alla formuleringar, kontaktdetaljer och bildtexter. Bekräfta språk och policytexter. Byte av den riktiga företagsdomänen är ett separat beslut. Den här visningen gör inget sådant byte.
