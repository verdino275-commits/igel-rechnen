// Igel-Rechnen 2 (2. Klasse), Teil 1: Zahlen bis 100, Plus und Minus bis 100.
//
// Art 'bloecke': die Bühne besteht aus mehreren Blöcken untereinander:
//   { bild: {...} }            – Bild (Zehnerstangen, Zahlenstrahl, Punkte, ...), siehe bildHTML in app.js
//   { zeilen: [[...], ...] }   – Gleichungen wie bei 'zeilen'
//   { gitter: [[...], ...] }   – Tabelle (Hundertertafel, Maltabelle); null = leeres Feld, { kopf: x } = Kopfzelle
//   { text: '...' }            – kurzer Satz
// In Gleichungen und Gittern: L(k) = Lücke k, K(k) = zeigt die Lösung von Lücke k, sobald sie gefunden ist.
// Lücken mit optionen: [...] werden mit Knöpfen beantwortet (z. B. Überschlagen, gerade/ungerade).
// Nutzt die Hilfsfunktionen aus aufgaben.js und aufgaben-20.js.

function K(k) { return { kopie: k }; }
function zehnerVon(n) { return Math.floor(n / 10) * 10; }
function zehnerBild(n) { return { typ: 'zehner', z: Math.floor(n / 10), e: n % 10 }; }

// Auswahl aus Zehnerzahlen (für Ergebnisse wie 60).
function zehnerAuswahl(richtig) {
  var werte = [richtig];
  mischen([-10, 10, -20, 20]).forEach(function (d) {
    var w = richtig + d;
    if (werte.length < 3 && w >= 0 && w <= 100) werte.push(w);
  });
  return werte.sort(function (a, b) { return a - b; });
}

// ---------- Zahlen bis 100 ----------

function zehnerUndEiner(i, benutzt) {
  return einmalig(benutzt, function () {
    var z = zufall(1, 9), e = zufall(i < 4 ? 1 : 0, 9), n = 10 * z + e;
    if (i < 4) {
      return {
        art: 'bloecke', schluessel: 'b' + n, blase: 'Zähle die Zehner und die Einer.',
        bloecke: [
          { bild: zehnerBild(n) },
          { gitter: [[{ kopf: 'Z' }, { kopf: 'E' }, { kopf: 'Zahl' }], [L(0), L(1), L(2)]], stil: 'ze' }
        ],
        luecken: [
          { loesung: z, sprich: 'Wie viele Zehnerstangen siehst du?', tipp: 'Eine Stange sind 10 Punkte. Zähle die Stangen.' },
          { loesung: e, sprich: 'Und wie viele einzelne Punkte, also Einer?', blase: 'Jetzt die Einer.', tipp: 'Zähle die einzelnen Punkte.' },
          {
            loesung: n, sprich: z + ' Zehner und ' + e + ' Einer. Welche Zahl ist das?', blase: 'Welche Zahl ist das?',
            tipp: 'Erst die Zehner, dann die Einer.', auswahl: auswahl(n, 10, 99)
          }
        ]
      };
    }
    if (i < 7) {
      return {
        art: 'bloecke', schluessel: 'z' + n, blase: 'Zerlege die Zahl in Zehner und Einer.',
        hilfe: { bild: zehnerBild(n), sichtbar: false },
        bloecke: [{ zeilen: [[n, '=', L(0), '+', L(1)]] }],
        luecken: [
          { loesung: 10 * z, auswahl: zehnerAuswahl(10 * z), sprich: n + ' ist gleich wie viel plus wie viel? Zuerst die Zehnerzahl.', tipp: n + ' hat ' + z + ' Zehner.' },
          { loesung: e, sprich: 'Und die Einer?', blase: 'Jetzt die Einer.', tipp: 'Wie viel fehlt von ' + 10 * z + ' bis ' + n + '?' }
        ]
      };
    }
    var mitWorten = Math.random() < 0.5;
    return {
      art: 'bloecke', schluessel: 'w' + n + mitWorten, blase: 'Welche Zahl ist das?',
      hilfe: { bild: zehnerBild(n), sichtbar: false },
      bloecke: [{ zeilen: [mitWorten ? [z + ' Z', '+', e + ' E', '=', L(0)] : [10 * z, '+', e, '=', L(0)]] }],
      luecken: [{ loesung: n, sprich: z + ' Zehner und ' + e + ' Einer. Welche Zahl ist das?', tipp: 'Die Zehner kommen nach vorn, die Einer nach hinten.' }]
    };
  });
}

// Hundertertafel: Nachbarn einer Zahl (links/rechts ±1, oben/unten ±10).
function hundertertafel(i, benutzt) {
  return einmalig(benutzt, function () {
    var c = zufall(1, 8) * 10 + zufall(2, 9); // nicht am Rand der Tafel
    return {
      art: 'bloecke', schluessel: 't' + c, blase: 'Ein Ausschnitt aus der Hundertertafel.',
      bloecke: [{ gitter: [[null, L(2), null], [L(0), c, L(1)], [null, L(3), null]], stil: 'tafel' }],
      luecken: [
        { loesung: c - 1, sprich: 'Welche Zahl steht links neben ' + c + '?', tipp: 'Links steht eine Zahl weniger.' },
        { loesung: c + 1, sprich: 'Welche Zahl steht rechts neben ' + c + '?', tipp: 'Rechts steht eine Zahl mehr.', blase: 'Jetzt rechts daneben.' },
        { loesung: c - 10, sprich: 'Welche Zahl steht über ' + c + '?', tipp: 'Oben steht 10 weniger.', blase: 'Jetzt oben.' },
        { loesung: c + 10, sprich: 'Und welche Zahl steht unter ' + c + '?', tipp: 'Unten steht 10 mehr.', blase: 'Und unten?' }
      ]
    };
  });
}

function zahlenstrahl(i, benutzt) {
  return einmalig(benutzt, function () {
    var von = zufall(0, 8) * 10, wert;
    if (i < 3) wert = von + (Math.random() < 0.5 ? 5 : 15);
    else do { wert = zufall(von + 1, von + 19); } while (wert % 5 === 0);
    return {
      art: 'bloecke', schluessel: 's' + wert, blase: 'Welche Zahl zeigt der Pfeil?',
      bloecke: [{ bild: { typ: 'strahl', von: von, bis: von + 20, wert: wert } }, { zeilen: [[L(0)]] }],
      luecken: [{
        loesung: wert, auswahl: auswahl(wert, von, von + 20),
        sprich: 'Welche Zahl zeigt der Pfeil auf dem Zahlenstrahl?',
        tipp: 'Zähle von ' + zehnerVon(wert) + ' aus weiter. Jeder Strich ist eins.'
      }]
    };
  });
}

function nachbarzehner(i, benutzt) {
  return einmalig(benutzt, function () {
    var n;
    do { n = zufall(11, 99); } while (n % 10 === 0);
    var vor = zehnerVon(n), nach = vor + 10;
    var strahl = { typ: 'strahl', von: Math.max(0, vor - 5), bis: Math.max(0, vor - 5) + 20, wert: n };
    if (i % 2 === 0) {
      return {
        art: 'bloecke', schluessel: 'n' + n, blase: 'Welche Zehner sind die Nachbarn?',
        hilfe: { bild: strahl, sichtbar: false },
        bloecke: [{ zeilen: [[L(0), '<', n, '<', L(1)]] }],
        luecken: [
          { loesung: vor, auswahl: zehnerAuswahl(vor), sprich: 'Welcher Zehner kommt vor ' + n + '?', tipp: 'Der Zehner davor ist kleiner als ' + n + '.' },
          { loesung: nach, auswahl: zehnerAuswahl(nach), sprich: 'Und welcher Zehner kommt nach ' + n + '?', blase: 'Und der Zehner danach?', tipp: 'Der nächste Zehner ist 10 mehr als ' + vor + '.' }
        ]
      };
    }
    var hoch = Math.random() < 0.5;
    return {
      art: 'bloecke', schluessel: (hoch ? 'h' : 'r') + n,
      blase: hoch ? 'Wie viel fehlt bis zum nächsten Zehner?' : 'Wie viel bis zum Zehner davor?',
      hilfe: { bild: strahl, sichtbar: false },
      bloecke: [{ zeilen: [hoch ? [n, '+', L(0), '=', nach] : [n, '−', L(0), '=', vor]] }],
      luecken: [{
        loesung: hoch ? nach - n : n - vor,
        sprich: hoch ? n + ' plus wie viel ergibt ' + nach + '?' : n + ' minus wie viel ergibt ' + vor + '?',
        tipp: hoch ? 'Zähle von ' + n + ' weiter bis ' + nach + '.' : 'Nimm die Einer weg.'
      }]
    };
  });
}

function vergleichen100(i, benutzt) {
  return einmalig(benutzt, function () {
    var links, rechts;
    if (i < 5) {
      var x = zufall(12, 98), y, art = zufall(0, 3);
      var dreher = (x % 10) * 10 + Math.floor(x / 10);
      if (art === 0 && x % 10 !== 0 && dreher !== x) y = dreher;
      else if (art === 1) y = x + (Math.random() < 0.5 ? 1 : -1);
      else if (art === 2 && Math.random() < 0.5) y = x;
      else y = zufall(10, 99);
      links = { text: String(x), wert: x };
      rechts = { text: String(y), wert: y };
    } else {
      var a, b, s, plus = Math.random() < 0.5;
      if (Math.random() < 0.5) { // Zehnerzahlen
        a = zufall(2, 8) * 10;
        b = plus ? zufall(1, 9 - a / 10) * 10 : zufall(1, a / 10 - 1) * 10;
      } else {
        a = zufall(21, 89);
        b = plus ? zufall(1, Math.min(9, 99 - a)) : zufall(1, 9);
      }
      s = plus ? a + b : a - b;
      var z = Math.random() < 0.3 ? s : s + (Math.random() < 0.5 ? -1 : 1) * (s % 10 === 0 ? 10 : zufall(1, 2));
      z = Math.max(0, Math.min(100, z));
      links = { text: a + (plus ? ' + ' : ' − ') + b, wert: s, sprich: a + (plus ? ' plus ' : ' minus ') + b };
      rechts = { text: String(z), wert: z };
      if (Math.random() < 0.5) { var t = links; links = rechts; rechts = t; }
    }
    var zeichen = links.wert < rechts.wert ? '<' : links.wert > rechts.wert ? '>' : '=';
    return {
      art: 'vergleich', links: links, rechts: rechts, zeichen: true,
      schluessel: links.text + '|' + rechts.text,
      blase: 'Kleiner, größer oder gleich?',
      luecken: [{
        loesung: zeichen,
        tipp: i < 5 ? 'Vergleiche zuerst die Zehner.' : 'Rechne zuerst die Aufgabe aus.',
        sprich: 'Was passt zwischen ' + (links.sprich || links.text) + ' und ' + (rechts.sprich || rechts.text) +
          '? Kleiner, größer oder gleich?'
      }]
    };
  });
}

function zehnerzahlen(i, benutzt) {
  return einmalig(benutzt, function () {
    var a, b;
    if (i % 3 === 0) {
      a = zufall(1, 8); b = zufall(1, 10 - a);
      return {
        art: 'bloecke', schluessel: 'p' + a + b, blase: 'Siehst du die ähnliche Aufgabe?',
        bloecke: [{ zeilen: [[a, '+', b, '=', L(0)], [10 * a, '+', 10 * b, '=', L(1)]] }],
        luecken: [
          { loesung: a + b, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?' },
          { loesung: 10 * (a + b), auswahl: zehnerAuswahl(10 * (a + b)), sprich: 'Und ' + 10 * a + ' plus ' + 10 * b + '?', blase: 'Jetzt mit Zehnern!', tipp: a + ' Zehner plus ' + b + ' Zehner.' }
        ]
      };
    }
    if (i % 3 === 1) {
      a = zufall(2, 10); b = zufall(1, a - 1);
      return {
        art: 'bloecke', schluessel: 'm' + a + b, blase: 'Siehst du die ähnliche Aufgabe?',
        bloecke: [{ zeilen: [[a, '−', b, '=', L(0)], [10 * a, '−', 10 * b, '=', L(1)]] }],
        luecken: [
          { loesung: a - b, sprich: 'Wie viel ist ' + a + ' minus ' + b + '?' },
          { loesung: 10 * (a - b), auswahl: zehnerAuswahl(10 * (a - b)), sprich: 'Und ' + 10 * a + ' minus ' + 10 * b + '?', blase: 'Jetzt mit Zehnern!', tipp: a + ' Zehner minus ' + b + ' Zehner.' }
        ]
      };
    }
    a = zufall(1, 9) * 10;
    return {
      art: 'bloecke', schluessel: 'e' + a, blase: 'Wie viel fehlt bis 100?',
      hilfe: { bild: { typ: 'zehner', z: a / 10, e: 0 }, sichtbar: false },
      bloecke: [{ zeilen: [[a, '+', L(0), '=', 100]] }],
      luecken: [{ loesung: 100 - a, auswahl: zehnerAuswahl(100 - a), sprich: a + ' plus wie viel ergibt 100?', tipp: '100 sind 10 Zehner. Wie viele Zehner fehlen?' }]
    };
  });
}

// ---------- Plus und Minus bis 100 ----------

function aehnlich100(i, benutzt) {
  return einmalig(benutzt, function () {
    var t = zufall(1, 8), a, b, x;
    switch (i % 4) {
      case 0:
        a = zufall(1, 8); b = zufall(1, 9 - a);
        return {
          art: 'bloecke', schluessel: 'p' + t + a + b, blase: 'Siehst du die ähnliche Aufgabe?',
          bloecke: [{ zeilen: [[a, '+', b, '=', L(0)], [10 * t + a, '+', b, '=', L(1)]] }],
          luecken: [
            { loesung: a + b, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?' },
            { loesung: 10 * t + a + b, sprich: 'Und ' + (10 * t + a) + ' plus ' + b + '?', blase: 'Jetzt die große Aufgabe.', tipp: 'Wie ' + a + ' + ' + b + ', die Zehner bleiben gleich.' }
          ]
        };
      case 1:
        a = zufall(2, 9); b = zufall(1, a - 1);
        return {
          art: 'bloecke', schluessel: 'm' + t + a + b, blase: 'Siehst du die ähnliche Aufgabe?',
          bloecke: [{ zeilen: [[a, '−', b, '=', L(0)], [10 * t + a, '−', b, '=', L(1)]] }],
          luecken: [
            { loesung: a - b, sprich: 'Wie viel ist ' + a + ' minus ' + b + '?' },
            { loesung: 10 * t + a - b, sprich: 'Und ' + (10 * t + a) + ' minus ' + b + '?', blase: 'Jetzt die große Aufgabe.', tipp: 'Wie ' + a + ' − ' + b + ', die Zehner bleiben gleich.' }
          ]
        };
      case 2:
        x = zufall(11, 69);
        return {
          art: 'bloecke', schluessel: 'z' + x, blase: 'Nur die Zehner ändern sich.',
          bloecke: [{ zeilen: [[x, '+', 10, '=', L(0)], [x, '+', 20, '=', L(1)], [x, '+', 30, '=', L(2)]] }],
          luecken: [10, 20, 30].map(function (d, k) {
            return { loesung: x + d, sprich: 'Wie viel ist ' + x + ' plus ' + d + '?', tipp: (d / 10) + ' Zehner dazu, die Einer bleiben gleich.', blase: k ? 'Und jetzt?' : undefined };
          })
        };
      default:
        x = zufall(41, 99);
        return {
          art: 'bloecke', schluessel: 'y' + x, blase: 'Nur die Zehner ändern sich.',
          bloecke: [{ zeilen: [[x, '−', 10, '=', L(0)], [x, '−', 20, '=', L(1)], [x, '−', 30, '=', L(2)]] }],
          luecken: [10, 20, 30].map(function (d, k) {
            return { loesung: x - d, sprich: 'Wie viel ist ' + x + ' minus ' + d + '?', tipp: (d / 10) + ' Zehner weg, die Einer bleiben gleich.', blase: k ? 'Und jetzt?' : undefined };
          })
        };
    }
  });
}

// Einer dazu oder weg – über den Zehner (27 + 5, 43 − 5).
function ueberDenZehner(i, benutzt) {
  return einmalig(benutzt, function () {
    var e, b, t, n;
    if (i % 2 === 0) {
      do { e = zufall(2, 9); b = zufall(2, 9); } while (e + b <= 10);
      t = zufall(1, 8); n = 10 * t + e;
      return {
        art: 'bloecke', schluessel: 'p' + n + b, blase: 'Die kleine Aufgabe hilft!',
        hilfe: { bild: zehnerBild(n + b), sichtbar: false },
        bloecke: [{ zeilen: [[e, '+', b, '=', L(0)], [n, '+', b, '=', L(1)]] }],
        luecken: [
          { loesung: e + b, sprich: 'Wie viel ist ' + e + ' plus ' + b + '?', tipp: 'Erst bis 10: ' + e + ' + ' + (10 - e) + ', dann noch ' + (b - 10 + e) + '.' },
          { loesung: n + b, sprich: 'Und ' + n + ' plus ' + b + '?', blase: 'Jetzt über den Zehner!', tipp: 'Erst bis ' + (10 * t + 10) + ', dann noch ' + (b - 10 + e) + ' dazu.' }
        ]
      };
    }
    do { e = zufall(1, 8); b = zufall(2, 9); } while (b <= e);
    t = zufall(2, 9); n = 10 * t + e;
    return {
      art: 'bloecke', schluessel: 'm' + n + b, blase: 'Die kleine Aufgabe hilft!',
      hilfe: { bild: zehnerBild(n - b), sichtbar: false },
      bloecke: [{ zeilen: [[10 + e, '−', b, '=', L(0)], [n, '−', b, '=', L(1)]] }],
      luecken: [
        { loesung: 10 + e - b, sprich: 'Wie viel ist ' + (10 + e) + ' minus ' + b + '?', tipp: 'Erst bis 10: ' + (10 + e) + ' − ' + e + ', dann noch ' + (b - e) + ' weg.' },
        { loesung: n - b, sprich: 'Und ' + n + ' minus ' + b + '?', blase: 'Jetzt über den Zehner!', tipp: 'Erst bis ' + 10 * t + ', dann noch ' + (b - e) + ' weg.' }
      ]
    };
  });
}

// Erst Zehner dazu, dann Einer dazu (53 + 14: 53 + 10 = 63, 63 + 4 = 67).
function zehnerDannEinerPlus(i, benutzt) {
  return einmalig(benutzt, function () {
    var x, y;
    do {
      x = zufall(11, 78); y = zufall(11, 99 - x);
    } while (y % 10 === 0 || x % 10 === 0 || (i < 4 ? x % 10 + y % 10 > 9 : (x % 10 + y % 10 <= 9 && Math.random() < 0.5)));
    var z = zehnerVon(y), e = y % 10;
    return {
      art: 'bloecke', schluessel: x + '+' + y, blase: 'Erst die Zehner dazu, dann die Einer.',
      bloecke: [{ zeilen: [[x, '+', y, '=', L(2)], [x, '+', z, '=', L(0)], [K(0), '+', e, '=', L(1)]] }],
      luecken: [
        { loesung: x + z, sprich: 'Erst die Zehner dazu: ' + x + ' plus ' + z + '?', tipp: (z / 10) + ' Zehner dazu, die Einer bleiben gleich.' },
        { loesung: x + y, sprich: 'Dann die Einer dazu: ' + (x + z) + ' plus ' + e + '?', blase: 'Jetzt die Einer dazu!' },
        { loesung: x + y, sprich: 'Also: ' + x + ' plus ' + y + ' ist?', blase: 'Und das Ergebnis?', tipp: 'Das hast du gerade ausgerechnet!' }
      ]
    };
  });
}

// Erst Zehner weg, dann Einer weg (56 − 21: 56 − 20 = 36, 36 − 1 = 35).
function zehnerDannEinerMinus(i, benutzt) {
  return einmalig(benutzt, function () {
    var x, y;
    do {
      x = zufall(22, 99); y = zufall(11, x - 1);
    } while (y % 10 === 0 || (i < 4 ? x % 10 < y % 10 : (x % 10 >= y % 10 && Math.random() < 0.5)));
    var z = zehnerVon(y), e = y % 10;
    return {
      art: 'bloecke', schluessel: x + '-' + y, blase: 'Erst die Zehner weg, dann die Einer.',
      bloecke: [{ zeilen: [[x, '−', y, '=', L(2)], [x, '−', z, '=', L(0)], [K(0), '−', e, '=', L(1)]] }],
      luecken: [
        { loesung: x - z, sprich: 'Erst die Zehner weg: ' + x + ' minus ' + z + '?', tipp: (z / 10) + ' Zehner weg, die Einer bleiben gleich.' },
        { loesung: x - y, sprich: 'Dann die Einer weg: ' + (x - z) + ' minus ' + e + '?', blase: 'Jetzt die Einer weg!' },
        { loesung: x - y, sprich: 'Also: ' + x + ' minus ' + y + ' ist?', blase: 'Und das Ergebnis?', tipp: 'Das hast du gerade ausgerechnet!' }
      ]
    };
  });
}

function runden(n) { return Math.round(n / 10) * 10; }

function ueberschlagen(i, benutzt) {
  return einmalig(benutzt, function () {
    var plus = i % 2 === 0, x, y;
    if (plus) { x = zufall(12, 69); y = zufall(12, 99 - x); } else { x = zufall(40, 99); y = zufall(12, x - 10); }
    var r = plus ? x + y : x - y, d = 10 * zufall(i < 4 ? 2 : 1, 3), werte;
    if (r - d >= 0 && r + d <= 100) werte = [r - d, r, r + d];
    else if (r - d < 0) werte = [r, r + d, r + 2 * d];
    else werte = [r - 2 * d, r - d, r];
    return {
      art: 'bloecke', schluessel: x + (plus ? '+' : '-') + y, blase: 'Überschlage! Welches Ergebnis passt?',
      bloecke: [{ zeilen: [[x, plus ? '+' : '−', y, '=', L(0)]] }],
      luecken: [{
        loesung: r, optionen: werte,
        sprich: 'Überschlage: Welches Ergebnis passt zu ' + x + (plus ? ' plus ' : ' minus ') + y + '?',
        tipp: x + ' ist ungefähr ' + runden(x) + ', ' + y + ' ist ungefähr ' + runden(y) + '.'
      }]
    };
  });
}

// Einfache Paare: 13 + 19 + 7 → zuerst 13 + 7 = 20.
function einfachePaare(i, benutzt) {
  return einmalig(benutzt, function () {
    var e = zufall(1, 9), p = zufall(1, 5) * 10 + e, minus = i >= 4 && Math.random() < 0.4;
    var q = minus ? e : 10 - e, paar = minus ? p - q : p + q, b;
    do { b = zufall(11, Math.min(59, 99 - paar)); } while (b % 10 === 0);
    var gesamt = paar + b, opq = minus ? '−' : '+';
    var zeile = Math.random() < 0.5 ? [p, '+', b, opq, q, '=', L(1)] : [b, '+', p, opq, q, '=', L(1)];
    return {
      art: 'bloecke', schluessel: p + opq + q + '|' + b, blase: 'Finde zuerst das einfache Paar.',
      bloecke: [{ zeilen: [[p, opq, q, '=', L(0)], zeile] }],
      luecken: [
        { loesung: paar, auswahl: zehnerAuswahl(paar), sprich: 'Das einfache Paar zuerst: ' + p + (minus ? ' minus ' : ' plus ') + q + '?', tipp: 'Das gibt eine Zehnerzahl.' },
        { loesung: gesamt, sprich: 'Jetzt die ganze Aufgabe. ' + paar + ' plus ' + b + '?', blase: 'Jetzt noch die andere Zahl dazu!', tipp: 'Rechne ' + paar + ' + ' + b + '.' }
      ]
    };
  });
}

function plusStattMinus100(i, benutzt) {
  return einmalig(benutzt, function () {
    var a, d;
    do { a = zufall(21, 99); d = zufall(1, i < 4 ? 3 : 5); } while (a % 10 >= d && (i >= 3 || Math.random() < 0.5));
    var b = a - d;
    return {
      art: 'bloecke', schluessel: a + '-' + b, blase: 'Rechne plus statt minus!',
      bloecke: [{ zeilen: [[b, '+', L(0), '=', a], [a, '−', b, '=', L(1)]] }],
      luecken: [
        { loesung: d, sprich: b + ' plus wie viel ergibt ' + a + '?', tipp: 'Zähle von ' + b + ' weiter bis ' + a + '.' },
        { loesung: d, sprich: 'Also: ' + a + ' minus ' + b + '?', blase: 'Und die Minusaufgabe?', tipp: 'Das ist derselbe Unterschied!' }
      ]
    };
  });
}

// Aufgaben mit 8 und 9 Einern: 53 + 19 = 53 + 20 − 1.
function mitAchtUndNeun(i, benutzt) {
  return einmalig(benutzt, function () {
    var d = i < 4 ? 1 : zufall(1, 2), plus = i % 2 === 0, x, k;
    if (plus) { k = zufall(2, 7); x = zufall(11, 99 - 10 * k + d); } else { k = zufall(2, 7); x = zufall(10 * k + 1, 99); }
    var y = 10 * k - d, r = plus ? x + y : x - y;
    var gross = plus ? [x, '+', y, '=', L(1)] : [x, '−', y, '=', L(1)];
    var hilfe = plus ? [x, '+', 10 * k, '−', d, '=', L(0)] : [x, '−', 10 * k, '+', d, '=', L(0)];
    return {
      art: 'bloecke', schluessel: x + (plus ? '+' : '-') + y, blase: 'Rechne geschickt mit dem Zehner!',
      bloecke: [{ zeilen: [gross, hilfe] }],
      luecken: [
        {
          loesung: r, sprich: 'Rechne geschickt: ' + x + (plus ? ' plus ' : ' minus ') + 10 * k + (plus ? ' minus ' : ' plus ') + d + '.',
          tipp: plus ? 'Erst ' + 10 * k + ' dazu, dann ' + d + ' weg.' : 'Erst ' + 10 * k + ' weg, dann ' + d + ' dazu.'
        },
        { loesung: r, sprich: 'Also: ' + x + (plus ? ' plus ' : ' minus ') + y + '?', blase: 'Und die Aufgabe oben?', tipp: 'Das gleiche Ergebnis wie unten!' }
      ]
    };
  });
}

function gemischt100(i, benutzt) {
  return einmalig(benutzt, function () {
    var plus = Math.random() < 0.5, a, b;
    if (plus) { a = zufall(11, 89); b = zufall(2, Math.min(i < 4 ? 9 : 49, 100 - a)); }
    else { a = zufall(20, 99); b = zufall(2, Math.min(i < 4 ? 9 : 49, a)); }
    return {
      art: 'bloecke', schluessel: a + (plus ? '+' : '-') + b,
      hilfe: { bild: zehnerBild(a), sichtbar: false },
      bloecke: [{ zeilen: [[a, plus ? '+' : '−', b, '=', L(0)]] }],
      luecken: [{
        loesung: plus ? a + b : a - b, sprich: 'Wie viel ist ' + a + (plus ? ' plus ' : ' minus ') + b + '?',
        tipp: b > 9 ? (plus ? 'Erst die Zehner dazu, dann die Einer.' : 'Erst die Zehner weg, dann die Einer.') : 'Denk an die ähnliche Aufgabe mit kleinen Zahlen.'
      }]
    };
  });
}

THEMEN = THEMEN.concat([
  { id: 'k2-ze', klasse: 2, stufe: 3, titel: 'Zehner und Einer', symbol: '34', farbe: '#2a9d8f', erzeuge: zehnerUndEiner },
  { id: 'k2-tafel', klasse: 2, stufe: 3, titel: 'Hundertertafel', symbol: '▦', farbe: '#7cb342', erzeuge: hundertertafel, anzahl: 6 },
  { id: 'k2-strahl', klasse: 2, stufe: 3, titel: 'Zahlenstrahl', symbol: '├┼┤', farbe: '#00a3c4', erzeuge: zahlenstrahl, anzahl: 8 },
  { id: 'k2-nzehner', klasse: 2, stufe: 3, titel: 'Nachbarzehner', symbol: '30·40', farbe: '#e9a23b', erzeuge: nachbarzehner, anzahl: 8 },
  { id: 'k2-vergleich', klasse: 2, stufe: 3, titel: 'Vergleichen', symbol: '< >', farbe: '#6a7fdb', erzeuge: vergleichen100 },
  { id: 'k2-zehnerzahlen', klasse: 2, stufe: 3, titel: 'Zehnerzahlen', symbol: '40+20', farbe: '#c2703d', erzeuge: zehnerzahlen, anzahl: 9 },

  { id: 'k2-aehnlich', klasse: 2, stufe: 4, titel: 'Ähnliche Aufgaben', symbol: '3→23', farbe: '#00a3c4', erzeuge: aehnlich100, anzahl: 8 },
  { id: 'k2-ueber', klasse: 2, stufe: 4, titel: 'Über den Zehner', symbol: '27+5', farbe: '#e76f51', erzeuge: ueberDenZehner, anzahl: 8 },
  { id: 'k2-zep', klasse: 2, stufe: 4, titel: 'Zehner dazu, Einer dazu', symbol: '53+14', farbe: '#2a9d8f', erzeuge: zehnerDannEinerPlus, anzahl: 6 },
  { id: 'k2-zem', klasse: 2, stufe: 4, titel: 'Zehner weg, Einer weg', symbol: '56−21', farbe: '#d6609a', erzeuge: zehnerDannEinerMinus, anzahl: 6 },
  { id: 'k2-paare', klasse: 2, stufe: 4, titel: 'Einfache Paare', symbol: '13+7', farbe: '#8e6bbf', erzeuge: einfachePaare, anzahl: 6 },
  { id: 'k2-psm', klasse: 2, stufe: 4, titel: 'Plus statt Minus', symbol: '39+?', farbe: '#6a7fdb', erzeuge: plusStattMinus100, anzahl: 8 },
  { id: 'k2-neun', klasse: 2, stufe: 4, titel: 'Mit 8 und 9 Einern', symbol: '+19', farbe: '#c2703d', erzeuge: mitAchtUndNeun, anzahl: 8 },
  { id: 'k2-ueberschlag', klasse: 2, stufe: 4, titel: 'Überschlagen', symbol: '≈', farbe: '#e9a23b', erzeuge: ueberschlagen, anzahl: 8 },
  { id: 'k2-mix', klasse: 2, stufe: 4, titel: 'Gemischt', symbol: '?', farbe: '#7cb342', erzeuge: gemischt100 }
]);
