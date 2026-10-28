// Generuje pliki dla dane.gov.pl (art. 19b ustawy deweloperskiej) na podstawie dane.js:
//   ceny-ofertowe-jagodowa-invest.csv  – wzór Ministerstwa Cyfryzacji (60 kolumn, separator ;, UTF-8 BOM, brak danych = X)
//   dane-gov-pl.xml                    – manifest harvestera (urn:otwarte-dane:harvester:1.13)
// Uruchamiany codziennie przez GitHub Actions (.github/workflows/dane-gov-pl.yml) oraz po każdej zmianie dane.js.
const fs = require("fs");
const vm = require("vm");

const { STAN_NA, PROSPEKT_PDF, LOKALE, HISTORIA } = vm.runInNewContext(
  fs.readFileSync("dane.js", "utf8") + "\n;({ STAN_NA, PROSPEKT_PDF, LOKALE, HISTORIA });", {});

const SITE = "https://oferta.jagodowa.com";
const today = new Date().toISOString().slice(0, 10);
const pln = n => n.toFixed(2).replace(".", ",");
const stamp = d => `${d} 00:00:00`;

// data obowiązywania aktualnej ceny lokalu = ostatni wpis w historii dla tego lokalu
const since = nr => { const h = HISTORIA.filter(x => x.nr === nr); return h.length ? h[h.length - 1].data : STAN_NA; };

const HDR = [
"Nazwa dewelopera","Forma prawna dewelopera","Nr KRS","Nr wpisu do CEiDG","Nr NIP","Nr REGON","Nr telefonu","Adres poczty elektronicznej","Nr faxu","Adres strony internetowej dewelopera",
"Województwo adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Powiat adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Gmina adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Miejscowość adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Ulica adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Nr nieruchomości adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Nr lokalu adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera","Kod pocztowy adresu siedziby/głównego miejsca wykonywania działalności gospodarczej dewelopera",
"Województwo adresu lokalu, w którym prowadzona jest sprzedaż","Powiat adresu lokalu, w którym prowadzona jest sprzedaż","Gmina adresu lokalu, w którym prowadzona jest sprzedaż","Miejscowość adresu lokalu, w którym prowadzona jest sprzedaż","Ulica adresu lokalu, w którym prowadzona jest sprzedaż","Nr nieruchomości adresu lokalu, w którym prowadzona jest sprzedaż","Nr lokalu adresu lokalu, w którym prowadzona jest sprzedaż","Kod pocztowy adresu lokalu, w którym prowadzona jest sprzedaż",
"Dodatkowe lokalizacje, w których prowadzona jest sprzedaż","Sposób kontaktu nabywcy z deweloperem",
"Województwo lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego","Powiat lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego","Gmina lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego","Miejscowość lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego","Ulica lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego","Nr nieruchomości lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego","Kod pocztowy lokalizacji przedsięwzięcia deweloperskiego lub zadania inwestycyjnego",
"Rodzaj nieruchomości: lokal mieszkalny, dom jednorodzinny","Nr lokalu lub domu jednorodzinnego nadany przez dewelopera ",
"Cena m 2 powierzchni użytkowej lokalu mieszkalnego / domu jednorodzinnego [zł]","Data od której cena obowiązuje cena m 2 powierzchni użytkowej lokalu mieszkalnego / domu jednorodzinnego",
"Cena lokalu mieszkalnego lub domu jednorodzinnego będących przedmiotem umowy stanowiąca iloczyn ceny m2 oraz powierzchni [zł]","Data od której cena obowiązuje cena lokalu mieszkalnego lub domu jednorodzinnego będących przedmiotem umowy stanowiąca iloczyn ceny m2 oraz powierzchni",
"Cena m2 powierzchni użytkowej lokalu mieszkalnego / domu jednorodzinnego [zł] uwzględniająca cenę lokalu i innych składowych ceny, o których mowa w art. 19a ust. 1 pkt 1), 2) lub 3)","Data od której obowiązuje cena m2 powierzchni użytkowej lokalu mieszkalnego lub domu jednorodzinnego uwzględniająca cenę lokalu i innych składowych ceny, o których mowa w art. 19a ust. 1 pkt 1), 2) lub 3)",
"Cena lokalu mieszkalnego lub domu jednorodzinnego uwzględniająca cenę lokalu stanowiącą iloczyn powierzchni oraz metrażu i innych składowych ceny, o których mowa w art. 19a ust. 1 pkt 1), 2) lub 3) [zł]","Data od której obowiązuje cena lokalu mieszkalnego lub domu jednorodzinnego uwzględniająca cenę lokalu stanowiącą iloczyn powierzchni oraz metrażu i innych składowych ceny, o których mowa w art. 19a ust. 1 pkt 1), 2) lub 3) ",
"Rodzaj części nieruchomości będących przedmiotem umowy","Oznaczenie części nieruchomości nadane przez dewelopera","Cena części nieruchomości, będących przedmiotem umowy [zł] ","Data od której obowiązuje cena części nieruchomości, będących przedmiotem umowy",
"Rodzaj pomieszczeń przynależnych, o których mowa w art. 2 ust. 4 ustawy z dnia 24 czerwca 1994 r. o własności lokali","Oznaczenie pomieszczeń przynależnych, o których mowa w art. 2 ust. 4 ustawy z dnia 24 czerwca 1994 r. o własności lokali","Wyszczególnienie cen pomieszczeń przynależnych, o których mowa w art. 2 ust. 4 ustawy z dnia 24 czerwca 1994 r. o własności lokali [zł]","Data od której obowiązuje cena wyszczególnionych pomieszczeń przynależnych, o których mowa w art. 2 ust. 4 ustawy z dnia 24 czerwca 1994 r. o własności lokali",
"Wyszczególnienie praw niezbędnych do korzystania z lokalu mieszkalnego lub domu jednorodzinnego","Wartość praw niezbędnych do korzystania z lokalu mieszkalnego lub domu jednorodzinnego [zł]","Data od której obowiązuje cena wartości praw niezbędnych do korzystania z lokalu mieszkalnego lub domu jednorodzinnego",
"Wyszczególnienie rodzajów innych świadczeń pieniężnych, które nabywca zobowiązany jest spełnić na rzecz dewelopera w wykonaniu umowy przenoszącej własność","Wartość innych świadczeń pieniężnych, które nabywca zobowiązany jest spełnić na rzecz dewelopera w wykonaniu umowy przenoszącej własność [zł]","Data od której obowiązuje cena wartości innych świadczeń pieniężnych, które nabywca zobowiązany jest spełnić na rzecz dewelopera w wykonaniu umowy przenoszącej własność",
"Adres strony internetowej, pod którym dostępny jest prospekt informacyjny"
];

const FIRMA = ["JAGODOWA INVEST sp. z o.o.","spółka z ograniczoną odpowiedzialnością","0000919433","X","6692563431","389653670","694947352","biuro@jagodowa.com","X",SITE];
const SIEDZIBA = ["zachodniopomorskie","m. Koszalin","m. Koszalin","Koszalin","Stanisława Moniuszki","20A","X","75-551"];
const INWEST = ["zachodniopomorskie","m. Koszalin","m. Koszalin","Koszalin","Lubiatowska","89","75-900"];
const PROSPEKT = PROSPEKT_PDF ? `${SITE}/${PROSPEKT_PDF}` : SITE;

const rows = LOKALE.filter(l => l.cena).map(l => {
  const d = stamp(since(l.nr)), m2 = pln(l.cena / l.pu), cena = pln(l.cena);
  return [
    ...FIRMA, ...SIEDZIBA, ...SIEDZIBA, "X", "telefon, e-mail, spotkanie w siedzibie dewelopera po umówieniu", ...INWEST,
    "Mieszkanie", l.nr,
    m2, d, cena, d, m2, d, cena, d,             // cena lokalu = cena z udziałem w gruncie i garażem (część lokalu); innych składowych brak
    "X","X","X","X",  "X","X","X","X",  "X","X","X",  "X","X","X",
    PROSPEKT
  ];
});

const esc = v => /[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
const csv = "﻿" + [HDR, ...rows].map(r => r.map(esc).join(";")).join("\r\n") + "\r\n";
fs.writeFileSync("ceny-ofertowe-jagodowa-invest.csv", csv);

const x = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ns2:datasets xmlns:ns2="urn:otwarte-dane:harvester:1.13" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dataset status="published">
    <extIdent>JAGODOWA_INVEST_DEWELOPER_0000000001</extIdent>
    <title>
      <polish>Ceny ofertowe mieszkań dewelopera JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</polish>
      <english>Offer prices of apartments of developer JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</english>
    </title>
    <description>
      <polish>Zbiór danych zawiera informacje o cenach ofertowych lokali mieszkalnych dewelopera JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ (przedsięwzięcie deweloperskie „Jagodowa Polana”, ul. Lubiatowska 89, Koszalin), udostępniane zgodnie z art. 19b ust. 1 ustawy z dnia 20 maja 2021 r. o ochronie praw nabywcy lokalu mieszkalnego lub domu jednorodzinnego oraz Deweloperskim Funduszu Gwarancyjnym.</polish>
      <english>The dataset contains information on offer prices of residential units of the developer JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ (development project "Jagodowa Polana", Lubiatowska 89, Koszalin), made available in accordance with art. 19b(1) of the Act of 20 May 2021 on the protection of the rights of the buyer of a residential unit or a single-family house and the Developer Guarantee Fund.</english>
    </description>
    <updateFrequency>daily</updateFrequency>
    <hasDynamicData>false</hasDynamicData>
    <hasHighValueData>true</hasHighValueData>
    <hasHighValueDataFromEuropeanCommissionList>false</hasHighValueDataFromEuropeanCommissionList>
    <hasResearchData>false</hasResearchData>
    <categories><category>ECON</category></categories>
    <resources>
      <resource status="published">
        <extIdent>JAGODOWA_INVEST_CENY_000000000000001</extIdent>
        <url>${SITE}/ceny-ofertowe-jagodowa-invest.csv</url>
        <title>
          <polish>Ceny ofertowe mieszkań dewelopera JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</polish>
          <english>Offer prices for developer's apartments JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</english>
        </title>
        <description>
          <polish>Dane dotyczące cen ofertowych lokali mieszkalnych dewelopera JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ według stanu na ${x(today)}, udostępnione zgodnie z art. 19b ust. 1 ustawy z dnia 20 maja 2021 r. o ochronie praw nabywcy lokalu mieszkalnego lub domu jednorodzinnego oraz Deweloperskim Funduszu Gwarancyjnym. Plik w formacie CSV (separator ;, UTF-8), zgodny ze wzorem Ministerstwa Cyfryzacji.</polish>
          <english>Data on offer prices of residential units of the developer JAGODOWA INVEST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ as of ${x(today)}, made available in accordance with art. 19b(1) of the Act of 20 May 2021 on the protection of the rights of the buyer of a residential unit or a single-family house and the Developer Guarantee Fund.</english>
        </description>
        <availability>local</availability>
        <dataDate>${today}</dataDate>
        <specialSigns><specialSign>X</specialSign></specialSigns>
        <hasDynamicData>false</hasDynamicData>
        <hasHighValueData>true</hasHighValueData>
        <hasHighValueDataFromEuropeanCommissionList>false</hasHighValueDataFromEuropeanCommissionList>
        <hasResearchData>false</hasResearchData>
        <containsProtectedData>false</containsProtectedData>
      </resource>
    </resources>
    <tags>
      <tag lang="pl">deweloper</tag>
      <tag lang="pl">mieszkania</tag>
      <tag lang="pl">ceny ofertowe</tag>
    </tags>
  </dataset>
</ns2:datasets>
`;
fs.writeFileSync("dane-gov-pl.xml", xml);
console.log(`OK: ${rows.length} lokale, dataDate ${today}`);
