// Aufgaben-Generatoren.
//
// Jede Aufgabe hat eine oder mehrere Lücken, die nacheinander ausgefüllt werden:
//   luecken: [{ loesung, sprich, tipp?, loesungText?, auswahl?, blase? }]
// Optional: hilfe: { punkte: [...], sichtbar } – Punktestreifen als Hilfe,
//           blase – erster Satz des Igels, zeichen: true – Antwort ist <, > oder =.
// i ist die Nummer der Aufgabe in der Runde; die ersten Aufgaben sind leichter.

function zufall(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

function mischen(liste) {
  for (var i = liste.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = liste[i]; liste[i] = liste[j]; liste[j] = t;
  }
  return liste;
}

function bereich(von, bis) {
  var r = [];
  for (var z = von; z <= bis; z++) r.push(z);
  return r;
}

// Richtige Antwort plus zwei nahe, falsche Antworten.
function auswahl(richtig, min, max) {
  var werte = [richtig];
  var kandidaten = mischen([richtig - 1, richtig + 1, richtig - 2, richtig + 2, richtig + 3, richtig - 3]);
  for (var k = 0; k < kandidaten.length && werte.length < 3; k++) {
    var w = kandidaten[k];
    if (w >= min && w <= max && werte.indexOf(w) < 0) werte.push(w);
  }
  return werte.sort(function (a, b) { return a - b; });
}

// Wiederholt einen Generator, bis eine Aufgabe entsteht, die es in dieser Runde noch nicht gab.
function einmalig(benutzt, erzeuge) {
  var a;
  for (var versuch = 0; versuch < 40; versuch++) {
    a = erzeuge();
    if (!benutzt[a.schluessel]) break;
  }
  benutzt[a.schluessel] = true;
  return a;
}

function wiederhole(art, n) { return Array.from({ length: n }, function () { return art; }); }
function plusPunkte(a, b) { return wiederhole('blau', a).concat(wiederhole('orange', b)); }
function minusPunkte(a, b) { return wiederhole('rot', a - b).concat(wiederhole('weg', b)); }

function grenze(i) { return i < 3 ? 5 : i < 6 ? 8 : 10; }

// Zwei Summanden mit Summe ≤ max, Null nur selten.
function summanden(max, min) {
  var a, b;
  do {
    a = zufall(0, max);
    b = zufall(0, max - a);
  } while (a + b < (min || 2) || ((a === 0 || b === 0) && Math.random() < 0.8));
  return [a, b];
}

// ---------- Stufe 1: Zahlen bis 10 ----------

function plusBis10(i, benutzt) {
  return einmalig(benutzt, function () {
    var s = summanden(grenze(i)), a = s[0], b = s[1];
    return {
      art: 'rechnung', a: a, op: '+', b: b, schluessel: a + '+' + b,
      hilfe: { punkte: plusPunkte(a, b), sichtbar: i < 5 }, // erst zählen, später im Kopf rechnen
      luecken: [{ loesung: a + b, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?' }]
    };
  });
}

function minusBis10(i, benutzt) {
  return einmalig(benutzt, function () {
    var max = grenze(i), a, b;
    do {
      a = zufall(2, max);
      b = zufall(0, a);
    } while ((b === 0 || b === a) && Math.random() < 0.8);
    return {
      art: 'rechnung', a: a, op: '−', b: b, schluessel: a + '-' + b,
      hilfe: { punkte: minusPunkte(a, b), sichtbar: i < 5 },
      luecken: [{ loesung: a - b, sprich: 'Wie viel ist ' + a + ' minus ' + b + '?' }]
    };
  });
}

function zahlenhaus(i, benutzt) {
  return einmalig(benutzt, function () {
    var dach = i < 3 ? zufall(3, 5) : i < 6 ? zufall(5, 8) : zufall(6, 10);
    var links = mischen(bereich(0, dach)).slice(0, 3).sort(function (x, y) { return x - y; });
    var aktiv = zufall(0, 2), a = links[aktiv];
    return {
      art: 'haus', dach: dach, zeilen: links.map(function (l) { return [l, dach - l]; }), aktiv: aktiv,
      schluessel: dach + ':' + a,
      blase: 'Welche Zahl fehlt im Haus?',
      hilfe: { punkte: plusPunkte(a, dach - a), sichtbar: false },
      luecken: [{
        loesung: dach - a, auswahl: auswahl(dach - a, 0, dach),
        sprich: 'Die Zahl auf dem Dach ist ' + dach + '. ' + a + ' plus wie viel ergibt ' + dach + '?',
        loesungText: 'Es fehlt die ' + (dach - a) + '.'
      }]
    };
  });
}

function vergleichen(i, benutzt) {
  return einmalig(benutzt, function () {
    var links, rechts;
    if (i < 5) {
      var x = zufall(0, 10);
      var y = Math.random() < 0.2 ? x : zufall(0, 10);
      links = { text: String(x), wert: x, punkte: true };
      rechts = { text: String(y), wert: y, punkte: true };
    } else {
      var a = zufall(1, 7), b = zufall(1, 10 - a), s = a + b;
      var z = Math.max(0, Math.min(10, s + zufall(-2, 2)));
      links = { text: a + ' + ' + b, wert: s, sprich: a + ' plus ' + b };
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
        sprich: 'Was passt zwischen ' + (links.sprich || links.text) + ' und ' + (rechts.sprich || rechts.text) +
          '? Kleiner, größer oder gleich?'
      }]
    };
  });
}

// Zahlenraupe: fehlende Zahl in einer Zahlenfolge (vorwärts, rückwärts, in Zweierschritten).
function zahlenraupe(i, benutzt) {
  return einmalig(benutzt, function () {
    var schritt = i < 4 ? 1 : i < 7 ? -1 : (Math.random() < 0.5 ? 2 : -2);
    var laenge = 6, spanne = Math.abs(schritt) * (laenge - 1);
    var start = schritt > 0 ? zufall(0, 10 - spanne) : zufall(spanne, 10);
    var zahlen = bereich(0, laenge - 1).map(function (k) { return start + k * schritt; });
    // Anfangs fehlt eine Zahl in der Mitte, später auch am Rand (Vorgänger/Nachfolger).
    var pos = i < 2 ? zufall(1, laenge - 2) : zufall(0, laenge - 1);
    var tipp = schritt === 1 ? 'Zähle weiter: eins mehr.' : schritt === -1 ? 'Rückwärts zählen: eins weniger.'
      : schritt === 2 ? 'Die Raupe macht Zweierschritte.' : 'Die Raupe zählt in Zweierschritten rückwärts.';
    return {
      art: 'raupe', zahlen: zahlen, pos: pos, schluessel: zahlen.join(',') + ':' + pos,
      blase: 'Welche Zahl fehlt?',
      luecken: [{
        loesung: zahlen[pos], tipp: tipp,
        sprich: 'Welche Zahl fehlt in der Raupe? ' + zahlen.map(function (z, k) { return k === pos ? 'Lücke' : z; }).join(', ') + '.',
        loesungText: 'Es fehlt die ' + zahlen[pos] + '.'
      }]
    };
  });
}

// Tauschaufgaben: a + b und b + a haben dasselbe Ergebnis.
function tauschaufgaben(i, benutzt) {
  return einmalig(benutzt, function () {
    var s;
    do { s = summanden(grenze(i), 3); } while (s[0] === s[1] || s[0] === 0 || s[1] === 0);
    var a = s[0], b = s[1];
    return {
      art: 'tausch', a: a, b: b, schluessel: Math.min(a, b) + '+' + Math.max(a, b),
      hilfe: { punkte: plusPunkte(a, b), sichtbar: i < 4 },
      luecken: [
        { loesung: a + b, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?' },
        { loesung: a + b, sprich: 'Und ' + b + ' plus ' + a + '?', tipp: 'Tauschaufgabe! Das Ergebnis bleibt gleich.', blase: 'Und jetzt getauscht?' }
      ]
    };
  });
}

// Zahlenmauer: zwei Steine nebeneinander ergeben zusammen den Stein darüber.
function zahlenmauer(i, benutzt) {
  var REGEL = 'Die zwei Steine unten ergeben zusammen den Stein darüber.';
  return einmalig(benutzt, function () {
    if (i < 2) { // oben fehlt
      var s = summanden(i === 0 ? 6 : 10, 2), a = s[0], b = s[1];
      return {
        art: 'mauer', schluessel: 'o' + a + '+' + b, blase: 'Welcher Stein fehlt oben?',
        reihen: [[{ luecke: 0 }], [{ wert: a }, { wert: b }]],
        luecken: [{ loesung: a + b, sprich: REGEL + ' Wie viel ist ' + a + ' plus ' + b + '?' }]
      };
    }
    if (i < 4) { // unten fehlt ein Stein
      var oben = zufall(4, 10), links = zufall(1, oben - 1), linksFehlt = Math.random() < 0.5;
      var reihe = linksFehlt ? [{ luecke: 0 }, { wert: oben - links }] : [{ wert: links }, { luecke: 0 }];
      var bekannt = linksFehlt ? oben - links : links;
      return {
        art: 'mauer', schluessel: 'u' + oben + ':' + links + linksFehlt, blase: 'Welcher Stein fehlt unten?',
        reihen: [[{ wert: oben }], reihe],
        luecken: [{
          loesung: oben - bekannt, auswahl: auswahl(oben - bekannt, 0, oben),
          sprich: bekannt + ' plus wie viel ergibt ' + oben + '?', loesungText: 'Es fehlt die ' + (oben - bekannt) + '.'
        }]
      };
    }
    // Drei Reihen: unten drei Steine, Spitze höchstens 10.
    var x, y, z;
    do { x = zufall(0, 4); y = zufall(0, 3); z = zufall(0, 4); } while (x + 2 * y + z > 10 || x + 2 * y + z < 4);
    return {
      art: 'mauer', schluessel: 'd' + x + y + z, blase: 'Fülle die Mauer von unten nach oben.',
      reihen: [[{ luecke: 2 }], [{ luecke: 0 }, { luecke: 1 }], [{ wert: x }, { wert: y }, { wert: z }]],
      luecken: [
        { loesung: x + y, sprich: 'Wie viel ist ' + x + ' plus ' + y + '?', tipp: 'Rechne ' + x + ' plus ' + y + '.' },
        { loesung: y + z, sprich: 'Wie viel ist ' + y + ' plus ' + z + '?', tipp: 'Rechne ' + y + ' plus ' + z + '.', blase: 'Jetzt der Stein daneben.' },
        { loesung: x + 2 * y + z, sprich: 'Und ganz oben? ' + (x + y) + ' plus ' + (y + z) + '?', tipp: 'Rechne ' + (x + y) + ' plus ' + (y + z) + '.', blase: 'Und ganz oben?' }
      ]
    };
  });
}

// Rechenblume: innen und außen ergeben zusammen die Zahl in der Mitte.
function rechenblume(i, benutzt) {
  return einmalig(benutzt, function () {
    var mitte = i < 2 ? zufall(5, 7) : zufall(7, 10);
    var innen = mischen(bereich(0, mitte)).slice(0, 6);
    var offen = mischen(bereich(0, 5)).slice(0, 3).sort();
    var luecken = offen.map(function (k) {
      return {
        loesung: mitte - innen[k], auswahl: auswahl(mitte - innen[k], 0, mitte),
        sprich: innen[k] + ' plus wie viel ergibt ' + mitte + '?',
        tipp: 'Wie viel fehlt von ' + innen[k] + ' bis ' + mitte + '?',
        loesungText: 'Es fehlt die ' + (mitte - innen[k]) + '.',
        blase: 'Nächstes Blatt!'
      };
    });
    luecken[0].sprich = 'Innen und außen ergeben zusammen ' + mitte + '. ' + luecken[0].sprich;
    return {
      art: 'blume', mitte: mitte, innen: innen, offen: offen, schluessel: mitte + ':' + innen.join(','),
      blase: 'Innen + außen = Mitte',
      luecken: luecken
    };
  });
}

// Umkehraufgaben: drei Zahlen, zwei Plus- und zwei Minusaufgaben.
function umkehraufgaben(i, benutzt) {
  return einmalig(benutzt, function () {
    var a, b;
    var max = i < 2 ? 6 : 10;
    do { a = zufall(1, max - 1); b = zufall(1, max - a); } while (a === b);
    var s = a + b;
    return {
      art: 'umkehr', a: a, b: b, s: s, schluessel: Math.min(a, b) + '+' + Math.max(a, b),
      blase: 'Drei Zahlen, vier Aufgaben!',
      hilfe: { punkte: plusPunkte(a, b), sichtbar: i < 2 },
      luecken: [
        { loesung: s, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?' },
        { loesung: s, sprich: 'Und ' + b + ' plus ' + a + '?', tipp: 'Tauschaufgabe! Das Ergebnis bleibt gleich.', blase: 'Jetzt die Tauschaufgabe.' },
        { loesung: b, sprich: 'Wie viel ist ' + s + ' minus ' + a + '?', tipp: 'Schau auf die drei Kugeln.', blase: 'Jetzt minus!' },
        { loesung: a, sprich: 'Und ' + s + ' minus ' + b + '?', tipp: 'Schau auf die drei Kugeln.', blase: 'Die letzte!' }
      ]
    };
  });
}

// Lernpfad – angelehnt an den Aufbau eines Erstklass-Übungshefts.
// anzahl: Aufgaben pro Runde (Standard 10).
var THEMEN = [
  { id: 'raupe', stufe: 1, titel: 'Zahlenraupe', symbol: '1 2 3', farbe: '#7cb342', erzeuge: zahlenraupe },
  { id: 'plus10', stufe: 1, titel: 'Plus', symbol: '3+4', farbe: '#2a9d8f', erzeuge: plusBis10 },
  { id: 'minus10', stufe: 1, titel: 'Minus', symbol: '7−2', farbe: '#e76f51', erzeuge: minusBis10 },
  { id: 'vergleich', stufe: 1, titel: 'Vergleichen', symbol: '< >', farbe: '#6a7fdb', erzeuge: vergleichen },
  { id: 'tausch', stufe: 1, titel: 'Tauschaufgaben', symbol: '⇄', farbe: '#00a3c4', erzeuge: tauschaufgaben, anzahl: 8 },
  { id: 'haus', stufe: 1, titel: 'Zahlenhaus', symbol: '⌂', farbe: '#e9a23b', erzeuge: zahlenhaus },
  { id: 'mauer', stufe: 1, titel: 'Zahlenmauer', symbol: '▦', farbe: '#c2703d', erzeuge: zahlenmauer, anzahl: 8 },
  { id: 'blume', stufe: 1, titel: 'Rechenblume', symbol: '✿', farbe: '#d6609a', erzeuge: rechenblume, anzahl: 5 },
  { id: 'umkehr', stufe: 1, titel: 'Umkehraufgaben', symbol: '↺', farbe: '#8e6bbf', erzeuge: umkehraufgaben, anzahl: 5 }
];
