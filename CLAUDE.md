# Lilla Byn

Ett bygg- och odlingsspel inspirerat av klassiska odlings- och byggspel, gjort för barn (ungefär 6–13 år). All text i spelet är på svenska.

## Grundprinciper (får inte brytas)
- Inga köp, ingen premiumvaluta, inga reklamer och inga väntetider man kan betala sig förbi. Allt tjänas genom att spela.
- Inga "dagens gåva"-mekaniker eller andra belöningar som lockar till att öppna spelet. De har tagits bort med flit.
- Korta väntetider (sekunder till ett par minuter) och tydlig, vänlig återkoppling. Inget som straffar barnet.
- Texter ska vara enkla att läsa för ett barn. Använd typografiska citattecken ” ” och apostrof ’ i synlig text.

## Teknik
- Hela spelet är en enda fil: `index.html` (HTML, CSS och JavaScript). Ingen byggprocess, inga beroenden. Bredvid ligger bara `sw.js` och `manifest.webmanifest` för offlineläget.
- Typsnitt: Baloo 2 ligger i `fonts/` (SIL OFL, licenstexten bredvid) och laddas via `@font-face`, med reservtypsnitt. Länka inte till Google Fonts, det skickar besökarens IP-adress till Google. Grafiken är emoji.
- Ikoner: `apple-touch-icon.png` (180×180), `icon-192.png` och `icon-512.png` renderas från `icon.svg`, utan genomskinlighet. Ändra SVG:n och rendera om PNG:erna, t.ex. med headless Edge eller Chrome (`--screenshot --window-size=180,180`), och höj sedan `VERSION` i `sw.js`.
- Ljust och mörkt läge styrs av CSS-variabler på `:root` ("kvällsby" i mörkt läge). `data-theme` sätts av klockan (se Väder och klocka), inte av telefonens inställning.
- Mobilen är huvudplattformen: tänk på safe-area-insets, stora tryckytor och att spelplanen är 6 kolumner bred.

## Spara-data (viktigt)
- Spelet sparas i `localStorage` under nyckeln `lilla-byn-v1`. Byt ALDRIG nyckeln, då försvinner barnens byar.
- Flera byar: den första byn (id `a`) ligger kvar under `lilla-byn-v1`, nya byar under `lilla-byn-v1-<id>` (`keyFor(id)`). Listan och vilken by som är vald sparas under `lilla-byn-byar` (`BY`). Saknas listan räknas den som `{cur:'a',list:['a']}`, så gamla sparfiler fungerar utan migrering.
- Byte av by sparar, sätter `switching` (stoppar `save()`) och laddar om sidan. Allt annat läser alltså bara den valda byn i `S`.
- Föräldraläge, ljud och offlinecache gäller hela enheten, inte en by.
- Nya fält i state måste få standardvärden vid inläsning (se migreringen direkt efter `JSON.parse`), så att gamla sparfiler fungerar.
- `S.news` styr "Nytt i byn"-arket. Höj värdet och skriv om `newsHTML()` när en större uppdatering släpps (nu 4). Värdet finns på tre ställen: `fresh()`, `start`/`saveName` och sista raden i skriptet.
- Föräldraläget (`P`) sparas under `lilla-byn-foralder` och ljudinställningen (`A`) under `lilla-byn-ljud`. De ligger utanför `S` med flit, så att ”Börja om” inte nollställer dem.

## Föräldraläge
- Öppnas från byns namnskylt → 👪 Föräldraläge. När läget är på krävs koden för att ändra inställningarna.
- `tickParent()` räknar bara tid när sidan är synlig (max 2 s per tick). När `P.left` når 0 sätts `P.locked`, och `#lock` täcker hela spelet. Klick och tangenter blockeras då utanför `#lock`.
- Rätt kod ger `P.mins` minuter till. Efter 3 felaktiga försök måste man vänta, och väntetiden växer.
- Det finns ingen återställning av glömd kod i spelet.

## Ljud
- Allt syntetiseras med Web Audio (`voice`, `noise`), inga ljudfiler. Effekterna finns i `FX` och spelas med `sfx('namn')`. Musiken schemaläggs i `musicTick()`.
- Ljud startar först efter ett tryck (krav i webbläsarna). Musiken pausas när sidan är dold eller spelet är låst (`syncMusic()`).
- Knappar med `data-act` får ett klickljud automatiskt, utom de i `LOUD` som har egna ljud.
- Naturljud följer vädret: fåglar på dagen, syrsor på kvällen (inte på vintern), regnljud (`syncRain()`) när det regnar.

## Väder och klocka
- `applyClock()` körs varje sekund. Kväll 20–06 ger `data-theme="dark"`, månaden ger `data-season` (vinter/var/sommar/host) och `weather()` ger `data-wx` (sol/moln/regn/sno).
- `weather()` räknas fram ur tiden i block om 6 minuter och årstiden. Det är samma efter omladdning och på alla enheter, och sparas inte.
- Regn vattnar alla åkrar som växer (i `process()`). Snö är bara utseende. Partiklarna ligger i `#wxfx` och döljs vid `prefers-reduced-motion`.

## Offline
- `sw.js` hämtar sidan från nätet först (med cachen som reserv efter 4 s) så att nya versioner kommer fram, och övriga filer från cachen.
- Lägger du till, tar bort eller byter en fil som spelet behöver: uppdatera `FILES` och höj `VERSION` i `sw.js`.
- Rör bara cachar som börjar på `lilla-byn-`, ifall spelet någon gång delar adress med något annat.

## Domän
- Spelet ligger på `https://farm.chandler.se` (filen `CNAME`). Gamla adressen `dlundin-private.github.io/farm/` skickas vidare dit.
- Sparningen hör ihop med domänen. Byt inte domän igen, då börjar alla om från noll.
- Byar som sparades på den gamla adressen följer inte med. Det valdes med flit att inte bygga en flytt, eftersom spelet bara hade legat där en dag.

## Spelets uppbyggnad (i `<script>`)
- `I` – alla varor (namn, emoji, värde). `CROPS` – grödor (nivå, växttid). `R` – recept i fabriker.
- `B` – allt som kan byggas: field, sprinkler, animal, factory, house, deco. `cat` styr flik i byggmenyn.
- `UP` – verktyg/automatik (räfsor för större yta, traktor, såmaskin, skördetröska, djurskötare, fabriksarbetare, hyresvärd, mer mark).
- `process()` körs varje sekund och sköter automatik, även ikapp efter att spelet varit stängt (max 60 cykler per ruta).
- `tap(i)` hanterar tryck på spelplanen. Ark (bottom sheets) ritas av funktioner som `shopHTML`, `factoryHTML`, `ordersHTML`.
- Åkrar: plöjd → sådd → (vattnad = halva tiden) → skördad → behöver plöjas igen (om inte traktor finns).
- En åker som växer visar själva grödan, som växer från liten till nästan full storlek (`--g`). Vattnad åker har mörk jord (`.wet`). Lägg inte tillbaka märken på åkrarna, det blev för plottrigt.
- Stjärnor (XP): `need(l)=12·l^1.6`. Order är huvudkällan. Ett tryck som skördar ger 1 oavsett hur många åkrar, att hämta från djur ger 1 och från fabrik `max(1, värde/8)`. Pynt ger stjärnor bara första gången av varje sort. Automatik (skördetröska, djurskötare, fabriksarbetare) ger aldrig stjärnor, annars rusar nivåerna.
- Med såmaskin blir en åker aldrig tom. Ett tryck på en vattnad åker som växer öppnar därför `seedsHTML` med `swap:true` (”Byt gröda?”). Det sår om åkrar som växer, men inte de som är klara att skörda (`sowable()`).

## Publicering
- GitHub Pages publicerar `main` automatiskt. Pusha till `main` = live efter någon minut.
- Testa större ändringar på en egen gren först om det är osäkert.

## Innan du pushar
- Kontrollera att skriptet har giltig syntax (t.ex. extrahera `<script>`-innehållet och kör `node --check`).
- Spela igenom det du ändrat i huvudet: fungerar en gammal sparfil? Kan något ge oändligt med mynt (som den borttagna gåvan gjorde)?
