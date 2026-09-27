// Stufe 2: Zahlen bis 20.
//
// Art 'zeilen': Gleichungen aus Zahlen, Zeichen und Lücken, z. B. [10, '+', L(0), '=', 16].
// Nutzt die Hilfsfunktionen aus aufgaben.js.

function L(k) { return { luecke: k }; }

// Punkte für den 20er-Streifen, wenn genau ein Zehner weggenommen wird (Zehner ganz durchstreichen).
function zehnerWegPunkte(a) { return wiederhole('weg', 10).concat(wiederhole('rot', a - 10)); }

function mitZehn(i, benutzt) {
  return einmalig(benutzt, function () {
    var e = zufall(1, 9), z = 10 + e;
    switch (i % 4) {
      case 0:
        var zehnVorn = Math.random() < 0.6, a = zehnVorn ? 10 : e, b = zehnVorn ? e : 10;
        return {
          art: 'zeilen', schluessel: a + '+' + b, hilfe: { punkte: plusPunkte(a, b), sichtbar: i < 4 },
          zeilen: [[a, '+', b, '=', L(0)]],
          luecken: [{ loesung: z, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?' }]
        };
      case 1:
        return {
          art: 'zeilen', schluessel: z + '-10', hilfe: { punkte: zehnerWegPunkte(z), sichtbar: i < 4 },
          zeilen: [[z, '−', 10, '=', L(0)]],
          luecken: [{ loesung: e, sprich: 'Wie viel ist ' + z + ' minus 10?', tipp: 'Nimm den ganzen Zehner weg.' }]
        };
      case 2:
        return {
          art: 'zeilen', schluessel: z + '-' + e, hilfe: { punkte: minusPunkte(z, e), sichtbar: i < 4 },
          zeilen: [[z, '−', e, '=', L(0)]],
          luecken: [{ loesung: 10, sprich: 'Wie viel ist ' + z + ' minus ' + e + '?', tipp: 'Nimm die Einer weg, der Zehner bleibt.' }]
        };
      default:
        return {
          art: 'zeilen', schluessel: '10+?=' + z, hilfe: { punkte: plusPunkte(10, e), sichtbar: false },
          zeilen: [[10, '+', L(0), '=', z]],
          luecken: [{ loesung: e, sprich: '10 plus wie viel ergibt ' + z + '?', loesungText: 'Es fehlt die ' + e + '.' }]
        };
    }
  });
}

// Ähnliche Aufgaben: 3 + 4 hilft bei 13 + 4.
function aehnlicheAufgaben(i, benutzt) {
  return einmalig(benutzt, function () {
    var plus = i % 2 === 0, a, b;
    if (plus) { a = zufall(1, 8); b = zufall(1, 9 - a); }
    else { a = zufall(3, 9); b = zufall(1, a - 1); }
    var op = plus ? '+' : '−', wort = plus ? ' plus ' : ' minus ', klein = plus ? a + b : a - b;
    return {
      art: 'zeilen', schluessel: a + op + b,
      hilfe: { punkte: plus ? plusPunkte(10 + a, b) : minusPunkte(10 + a, b), sichtbar: false },
      zeilen: [[a, op, b, '=', L(0)], [10 + a, op, b, '=', L(1)]],
      luecken: [
        { loesung: klein, sprich: 'Wie viel ist ' + a + wort + b + '?' },
        {
          loesung: klein + 10, sprich: 'Und ' + (10 + a) + wort + b + '?', blase: 'Siehst du die ähnliche Aufgabe?',
          tipp: 'Wie ' + a + ' ' + op + ' ' + b + ', nur mit einem Zehner mehr.'
        }
      ]
    };
  });
}

// Verdoppeln und Halbieren.
function verdoppeln(i, benutzt) {
  return einmalig(benutzt, function () {
    var n = zufall(1, i < 2 ? 5 : 10);
    if (i < 5) {
      return {
        art: 'zeilen', schluessel: 'd' + n, blase: 'Verdopple die Zahl!',
        hilfe: { punkte: plusPunkte(n, n), sichtbar: i < 3 },
        zeilen: [[n, '+', n, '=', L(0)]],
        luecken: [{ loesung: 2 * n, sprich: 'Das Doppelte von ' + n + '. Wie viel ist ' + n + ' plus ' + n + '?' }]
      };
    }
    return {
      art: 'zeilen', schluessel: 'h' + n, blase: 'Halbiere die Zahl!',
      hilfe: { punkte: plusPunkte(n, n), sichtbar: false },
      zeilen: [[2 * n, '=', L(0), '+', L(1)]],
      luecken: [
        { loesung: n, sprich: 'Teile ' + (2 * n) + ' in zwei gleiche Zahlen. Wie viel ist die Hälfte von ' + (2 * n) + '?' },
        { loesung: n, sprich: 'Und die zweite Zahl?', tipp: 'Beide Zahlen sind gleich groß.', blase: 'Und die zweite Hälfte?' }
      ]
    };
  });
}

// Zehnerübergang in zwei Schritten: erst bis zur 10, dann weiter.
function erstBisZehn(i, benutzt) {
  return einmalig(benutzt, function () {
    var plus = i < 5, leicht = i % 5 < 2, a, b, bis10, rest, ergebnis;
    if (plus) {
      a = zufall(5, 9); b = zufall(11 - a, 9);
      bis10 = 10 - a; rest = b - bis10; ergebnis = a + b;
    } else {
      a = zufall(11, 18); b = zufall(a - 9, 9);
      bis10 = a - 10; rest = b - bis10; ergebnis = a - b;
    }
    var op = plus ? '+' : '−', wort = plus ? ' plus ' : ' minus ';
    var aufgabe = {
      art: 'zeilen', schluessel: a + op + b, blase: 'Erst bis zur 10!',
      hilfe: { punkte: plus ? plusPunkte(a, b) : minusPunkte(a, b), sichtbar: i % 5 < 3 }
    };
    var ergebnisLuecke = {
      loesung: ergebnis, sprich: (leicht ? 'Rechne erst bis zur 10. ' : 'Also: ') + 'Wie viel ist ' + a + wort + b + '?',
      tipp: 'Rechne ' + a + ' ' + op + ' ' + bis10 + ' ' + op + ' ' + rest + '.'
    };
    if (leicht) { // Zerlegung ist vorgegeben
      aufgabe.zeilen = [[a, op, b, '=', L(0)], ['=', a, op, bis10, op, rest]];
      aufgabe.luecken = [ergebnisLuecke];
      return aufgabe;
    }
    ergebnisLuecke.blase = 'Und das Ergebnis?';
    aufgabe.zeilen = [[a, op, b, '=', L(2)], ['=', a, op, L(0), op, L(1)]];
    aufgabe.luecken = [
      {
        loesung: bis10, auswahl: auswahl(bis10, 1, 9),
        sprich: plus ? 'Wie viel fehlt von ' + a + ' bis 10?' : 'Wie viel musst du von ' + a + ' wegnehmen, damit du bei 10 bist?',
        tipp: plus ? a + ' plus wie viel ergibt 10?' : a + ' minus wie viel ergibt 10?'
      },
      {
        loesung: rest, auswahl: auswahl(rest, 1, 9), blase: 'Wie viel bleibt noch übrig?',
        sprich: 'Von ' + b + ' hast du schon ' + bis10 + '. Wie viel bleibt noch übrig?',
        tipp: bis10 + ' plus wie viel ergibt ' + b + '?'
      },
      ergebnisLuecke
    ];
    return aufgabe;
  });
}

// Fast-Verdoppeln: 6 + 7 ist eins mehr als 6 + 6.
function erstVerdoppeln(i, benutzt) {
  return einmalig(benutzt, function () {
    var n = zufall(i < 3 ? 2 : 4, 9), tauschen = Math.random() < 0.5;
    var a = tauschen ? n + 1 : n, b = tauschen ? n : n + 1;
    return {
      art: 'zeilen', schluessel: a + '+' + b, blase: 'Erst verdoppeln!',
      hilfe: { punkte: plusPunkte(a, b), sichtbar: false },
      zeilen: [[n, '+', n, '=', L(0)], [a, '+', b, '=', L(1)]],
      luecken: [
        { loesung: 2 * n, sprich: 'Wie viel ist ' + n + ' plus ' + n + '?' },
        {
          loesung: 2 * n + 1, sprich: 'Und ' + a + ' plus ' + b + '?', blase: 'Eins mehr als das Doppelte!',
          tipp: 'Das ist eins mehr als ' + n + ' + ' + n + '.'
        }
      ]
    };
  });
}

// Plus statt Minus: 12 − 9 über 9 + ? = 12 lösen.
function plusStattMinus(i, benutzt) {
  return einmalig(benutzt, function () {
    var b = i < 3 ? zufall(3, 9) : zufall(6, 16), d = zufall(1, 4);
    if (b + d > 20) d = 20 - b;
    var a = b + d;
    return {
      art: 'zeilen', schluessel: a + '-' + b, blase: 'Minus mit Plus lösen!',
      hilfe: { punkte: plusPunkte(b, d), sichtbar: false },
      zeilen: [[b, '+', L(0), '=', a], [a, '−', b, '=', L(1)]],
      luecken: [
        { loesung: d, auswahl: auswahl(d, 0, 6), sprich: b + ' plus wie viel ergibt ' + a + '?', tipp: 'Zähle von ' + b + ' bis ' + a + '.' },
        {
          loesung: d, sprich: 'Also: Wie viel ist ' + a + ' minus ' + b + '?', blase: 'Und jetzt die Minusaufgabe.',
          tipp: 'Das ist dieselbe Zahl wie oben.'
        }
      ]
    };
  });
}

// Mit 9 und 11: erst mit 10 rechnen, dann eins dazu oder weg.
function mitNeunUndElf(i, benutzt) {
  return einmalig(benutzt, function () {
    var variante = i % 4, a, zahl, op, tipp;
    if (variante === 0) { a = zufall(2, 9); zahl = 9; op = '+'; tipp = '9 ist eins weniger als 10.'; }
    else if (variante === 1) { a = zufall(11, 20); zahl = 9; op = '−'; tipp = 'Du nimmst eins weniger weg als 10. Also bleibt eins mehr.'; }
    else if (variante === 2) { a = zufall(1, 9); zahl = 11; op = '+'; tipp = '11 ist eins mehr als 10.'; }
    else { a = zufall(12, 20); zahl = 11; op = '−'; tipp = 'Du nimmst eins mehr weg als 10.'; }
    var plus = op === '+', wort = plus ? ' plus ' : ' minus ';
    return {
      art: 'zeilen', schluessel: a + op + zahl, blase: 'Rechne erst mit 10!',
      hilfe: { punkte: plus ? plusPunkte(a, zahl) : minusPunkte(a, zahl), sichtbar: false },
      zeilen: [[a, op, 10, '=', L(0)], [a, op, zahl, '=', L(1)]],
      luecken: [
        { loesung: plus ? a + 10 : a - 10, sprich: 'Wie viel ist ' + a + wort + '10?' },
        { loesung: plus ? a + zahl : a - zahl, sprich: 'Und ' + a + wort + zahl + '?', blase: 'Jetzt mit ' + zahl + '!', tipp: tipp }
      ]
    };
  });
}

// Gemischte Aufgaben bis 20.
function gemischt(i, benutzt) {
  return einmalig(benutzt, function () {
    var plus = Math.random() < 0.5, a, b;
    if (plus) { a = zufall(2, 15); b = zufall(1, Math.min(9, 20 - a)); }
    else { a = zufall(5, 20); b = zufall(1, Math.min(9, a)); }
    return {
      art: 'zeilen', schluessel: a + (plus ? '+' : '-') + b,
      hilfe: { punkte: plus ? plusPunkte(a, b) : minusPunkte(a, b), sichtbar: false },
      zeilen: [[a, plus ? '+' : '−', b, '=', L(0)]],
      luecken: [{ loesung: plus ? a + b : a - b, sprich: 'Wie viel ist ' + a + (plus ? ' plus ' : ' minus ') + b + '?' }]
    };
  });
}

THEMEN = THEMEN.concat([
  { id: 'mit10', stufe: 2, titel: 'Aufgaben mit 10', symbol: '10+3', farbe: '#2a9d8f', erzeuge: mitZehn },
  { id: 'aehnlich', stufe: 2, titel: 'Ähnliche Aufgaben', symbol: '3→13', farbe: '#00a3c4', erzeuge: aehnlicheAufgaben, anzahl: 8 },
  { id: 'doppel', stufe: 2, titel: 'Verdoppeln', symbol: '6+6', farbe: '#e9a23b', erzeuge: verdoppeln },
  { id: 'zehner', stufe: 2, titel: 'Erst bis 10', symbol: '8+5', farbe: '#e76f51', erzeuge: erstBisZehn },
  { id: 'fastdoppel', stufe: 2, titel: 'Erst verdoppeln', symbol: '6+7', farbe: '#c2703d', erzeuge: erstVerdoppeln, anzahl: 8 },
  { id: 'ergaenzen', stufe: 2, titel: 'Plus statt Minus', symbol: '9+?', farbe: '#6a7fdb', erzeuge: plusStattMinus, anzahl: 8 },
  { id: 'neun', stufe: 2, titel: 'Mit 9 und 11', symbol: '9+4', farbe: '#8e6bbf', erzeuge: mitNeunUndElf, anzahl: 8 },
  { id: 'mix', stufe: 2, titel: 'Gemischt', symbol: '?', farbe: '#d6609a', erzeuge: gemischt }
]);
