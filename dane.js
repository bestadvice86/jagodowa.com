/* ====================== DANE CENNIKA — JEDYNY PLIK DO EDYCJI ======================
   Ceny brutto w zł (z 8% VAT), powierzchnia użytkowa w m² wg projektu.
   Zmiana ceny: zmień "cena" w LOKALE i DOPISZ nowy wiersz w HISTORIA z datą zmiany
   (starych wierszy nie usuwaj — art. 19a ust. 2 wymaga zachowania historii).
   Zmień też STAN_NA na datę zmiany.
   ================================================================================= */
const DRAFT = false;
const STAN_NA = "2026-10-28";          // data publikacji / ostatniej zmiany (RRRR-MM-DD)
const PROSPEKT_PDF = "prospekt-lubiatowska-89-czesc-ogolna.pdf";
const LOKALE = [
  { nr: "89/1", pu: 134.84, cena: 810000, status: "dostępny" },   // pow. wg projektu, jak lokal 91/1 (w tym garaż 18,77 m²)
  { nr: "89/2", pu: 133.18, cena: 860000, status: "dostępny" },   // pow. wg projektu, jak lokal 91/2 (w tym garaż 18,77 m²)
];
const HISTORIA = [
  { data: "2026-10-28", nr: "89/1", cena: 810000, zdarzenie: "rozpoczęcie sprzedaży – cena wyjściowa" },
  { data: "2026-10-28", nr: "89/2", cena: 860000, zdarzenie: "rozpoczęcie sprzedaży – cena wyjściowa" },
];
