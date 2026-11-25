// Igel-Rechnen 2 (2. Klasse), Teil 2: Einmaleins und Teilen.
// Nutzt die Hilfsfunktionen aus aufgaben.js, aufgaben-20.js und aufgaben-100.js.

// Richtige Antwort plus Nachbarn aus der Malreihe (z. B. 21, 28, 35 für die 7er-Reihe).
function reiheAuswahl(richtig, r) {
  var werte = [richtig];
  [-r, r, 2 * r, -2 * r, 1, -1].forEach(function (d) {
    var w = richtig + d;
    if (werte.length < 3 && w >= 0 && w <= 100 && werte.indexOf(w) < 0) werte.push(w);
  });
  return werte.sort(function (a, b) { return a - b; });
}

// Punktefeld als Hilfe: a Reihen mit je b Punkten.
function feldHilfe(a, b, sichtbar) { return { bild: { typ: 'feld', reihen: a, spalten: b }, sichtbar: !!sichtbar }; }

var KERN_TIPP = {
  1: function (r) { return 'Einmal ' + r + ' ist ' + r + '.'; },
  2: function (r) { return 'Das Doppelte von ' + r + '.'; },
  5: function (r) { return 'Die Hälfte von 10 · ' + r + '.'; },
  10: function (r) { return 'Hänge an die ' + r + ' eine Null an.'; }
};

// ---------- Einmaleins ----------

function kernaufgaben(i, benutzt) {
  return einmalig(benutzt, function () {
    var r = zufall(2, i < 3 ? 5 : 10), f = [1, 2, 5, 10][zufall(0, 3)], p = f * r;
    if (i < 5 || i % 2 === 0) {
      return {
        art: 'bloecke', schluessel: f + '*' + r, blase: 'Kernaufgaben sind einfach!',
        hilfe: feldHilfe(f, r),
        bloecke: [{ zeilen: [[f, '·', r, '=', L(0)]] }],
        luecken: [{ loesung: p, auswahl: reiheAuswahl(p, r), sprich: 'Wie viel ist ' + f + ' mal ' + r + '?', tipp: KERN_TIPP[f](r) }]
      };
    }
    return {
      art: 'bloecke', schluessel: p + ':' + r, blase: 'Welche Kernaufgabe hilft?',
      hilfe: feldHilfe(f, r),
      bloecke: [{ zeilen: [[p, ':', r, '=', L(0)]] }],
      luecken: [{ loesung: f, auswahl: auswahl(f, 1, 10), sprich: 'Wie viel ist ' + p + ' geteilt durch ' + r + '?', tipp: 'Wie oft passt die ' + r + ' in ' + p + '? Denk an 1, 2, 5 oder 10 mal.' }]
    };
  });
}

// Malreihe r (2 … 10). Ohne r: jede Aufgabe aus einer anderen Reihe.
function malreihe(i, benutzt, r0) {
  return einmalig(benutzt, function () {
    var r = r0 || zufall(2, 10), k = zufall(i < 3 ? 1 : 0, 10), p = k * r;
    if (k === 0 && Math.random() < 0.7) { k = zufall(1, 10); p = k * r; }
    var art = i < 3 ? 0 : i % 3;
    if (art === 0) {
      return {
        art: 'bloecke', schluessel: 'a' + k + '*' + r, hilfe: feldHilfe(k, r),
        bloecke: [{ zeilen: [[k, '·', r, '=', L(0)]] }],
        luecken: [{ loesung: p, auswahl: reiheAuswahl(p, r), sprich: 'Wie viel ist ' + k + ' mal ' + r + '?', tipp: k > 5 ? 'Von 5 · ' + r + ' = ' + 5 * r + ' aus weiterrechnen.' : 'Zähle in ' + r + 'er-Schritten.' }]
      };
    }
    if (art === 1 && k > 0) {
      return {
        art: 'bloecke', schluessel: 'b' + k + '*' + r, blase: 'Wie oft passt die ' + r + '?', hilfe: feldHilfe(k, r),
        bloecke: [{ zeilen: [[p, '=', L(0), '·', r]] }],
        luecken: [{ loesung: k, auswahl: auswahl(k, 1, 10), sprich: 'Wie viel mal ' + r + ' ergibt ' + p + '?', tipp: 'Zähle in ' + r + 'er-Schritten bis ' + p + '.' }]
      };
    }
    if (k === 0) { k = zufall(1, 10); p = k * r; }
    return {
      art: 'bloecke', schluessel: 'c' + p + ':' + r, blase: 'Geteilt – denk an die Malaufgabe.', hilfe: feldHilfe(k, r),
      bloecke: [{ zeilen: [[p, ':', r, '=', L(0)]] }],
      luecken: [{ loesung: k, auswahl: auswahl(k, 1, 10), sprich: 'Wie viel ist ' + p + ' geteilt durch ' + r + '?', tipp: 'Welche Zahl mal ' + r + ' ergibt ' + p + '?' }]
    };
  });
}

// Zahlenraupe in Malreihen-Schritten.
function malraupe(i, benutzt) {
  return einmalig(benutzt, function () {
    var r = zufall(2, i < 4 ? 5 : 10), start = zufall(0, 5);
    var zahlen = bereich(0, 5).map(function (k) { return (start + k) * r; });
    var pos = i < 3 ? zufall(1, 4) : zufall(0, 5);
    return {
      art: 'raupe', zahlen: zahlen, pos: pos, schluessel: r + ':' + start + ':' + pos,
      blase: 'Die Raupe hüpft in der ' + r + 'er-Reihe.',
      luecken: [{
        loesung: zahlen[pos], auswahl: reiheAuswahl(zahlen[pos], r), tipp: 'Die Raupe springt immer um ' + r + '.',
        sprich: 'Welche Zahl fehlt in der Raupe? ' + zahlen.map(function (z, k) { return k === pos ? 'Lücke' : z; }).join(', ') + '.',
        loesungText: 'Es fehlt die ' + zahlen[pos] + '.'
      }]
    };
  });
}

function malTausch(i, benutzt) {
  return einmalig(benutzt, function () {
    var a, b;
    do { a = zufall(2, i < 4 ? 5 : 10); b = zufall(2, 10); } while (a === b);
    return {
      art: 'bloecke', schluessel: Math.min(a, b) + '*' + Math.max(a, b), blase: 'Tauschaufgaben haben das gleiche Ergebnis.',
      hilfe: feldHilfe(a, b, i < 2),
      bloecke: [{ zeilen: [[a, '·', b, '=', L(0)], [b, '·', a, '=', L(1)]] }],
      luecken: [
        { loesung: a * b, auswahl: reiheAuswahl(a * b, b), sprich: 'Wie viel ist ' + a + ' mal ' + b + '?' },
        { loesung: a * b, sprich: 'Und ' + b + ' mal ' + a + '?', blase: 'Jetzt getauscht!', tipp: 'Tauschaufgabe! Das Ergebnis bleibt gleich.' }
      ]
    };
  });
}

// Nachbaraufgaben: 6 · 7 aus 5 · 7 + 7.
function nachbaraufgaben(i, benutzt) {
  return einmalig(benutzt, function () {
    var kern = [2, 5, 5, 10][zufall(0, 3)], n, r = zufall(2, 10);
    n = kern === 2 ? 3 : kern === 10 ? 9 : (Math.random() < 0.5 ? 4 : 6);
    var mehr = n > kern;
    return {
      art: 'bloecke', schluessel: n + '*' + r, blase: 'Die Kernaufgabe hilft beim Nachbarn.',
      hilfe: feldHilfe(n, r),
      bloecke: [{ zeilen: [[kern, '·', r, '=', L(0)], [n, '·', r, '=', L(1)]] }],
      luecken: [
        { loesung: kern * r, auswahl: reiheAuswahl(kern * r, r), sprich: 'Wie viel ist ' + kern + ' mal ' + r + '?', tipp: KERN_TIPP[kern](r) },
        {
          loesung: n * r, auswahl: reiheAuswahl(n * r, r), sprich: 'Und ' + n + ' mal ' + r + '?', blase: 'Jetzt die Nachbaraufgabe!',
          tipp: mehr ? 'Noch einmal ' + r + ' dazu: ' + kern * r + ' + ' + r + '.' : 'Einmal ' + r + ' weg: ' + kern * r + ' − ' + r + '.'
        }
      ]
    };
  });
}

// Malaufgaben verdoppeln: 3 · 4 → 6 · 4.
function malVerdoppeln(i, benutzt) {
  return einmalig(benutzt, function () {
    var b = zufall(1, 5), r = zufall(2, 10);
    return {
      art: 'bloecke', schluessel: b + '*' + r, blase: 'Doppelt so oft – doppelt so viel!',
      hilfe: feldHilfe(2 * b, r),
      bloecke: [{ zeilen: [[b, '·', r, '=', L(0)], [2 * b, '·', r, '=', L(1)]] }],
      luecken: [
        { loesung: b * r, auswahl: reiheAuswahl(b * r, r), sprich: 'Wie viel ist ' + b + ' mal ' + r + '?' },
        { loesung: 2 * b * r, auswahl: reiheAuswahl(2 * b * r, r), sprich: 'Und ' + 2 * b + ' mal ' + r + '?', blase: 'Jetzt verdoppeln!', tipp: 'Das Doppelte von ' + b * r + '.' }
      ]
    };
  });
}

function quadratzahlen(i, benutzt) {
  return einmalig(benutzt, function () {
    if (i < 5) {
      var n = zufall(1, 10);
      return {
        art: 'bloecke', schluessel: 'q' + n, blase: 'Quadrataufgaben: zweimal die gleiche Zahl.',
        hilfe: feldHilfe(n, n, i < 2),
        bloecke: [{ zeilen: [[n, '·', n, '=', L(0)]] }],
        luecken: [{ loesung: n * n, auswahl: reiheAuswahl(n * n, n), sprich: 'Wie viel ist ' + n + ' mal ' + n + '?', tipp: 'Stell dir ein Quadrat aus Punkten vor: ' + n + ' Reihen mit je ' + n + '.' }]
      };
    }
    var m = zufall(2, 9);
    return {
      art: 'bloecke', schluessel: 'n' + m, blase: 'Die Quadrataufgabe hilft!',
      hilfe: feldHilfe(m + 1, m),
      bloecke: [{ zeilen: [[m, '·', m, '=', L(0)], [m + 1, '·', m, '=', L(1)]] }],
      luecken: [
        { loesung: m * m, auswahl: reiheAuswahl(m * m, m), sprich: 'Wie viel ist ' + m + ' mal ' + m + '?' },
        { loesung: (m + 1) * m, auswahl: reiheAuswahl((m + 1) * m, m), sprich: 'Und ' + (m + 1) + ' mal ' + m + '?', blase: 'Jetzt einmal mehr.', tipp: 'Noch einmal ' + m + ' dazu: ' + m * m + ' + ' + m + '.' }
      ]
    };
  });
}

// Umkehraufgaben: zwei Mal- und zwei Geteiltaufgaben aus drei Zahlen.
function malUmkehr(i, benutzt) {
  return einmalig(benutzt, function () {
    var a, b;
    do { a = zufall(2, i < 2 ? 5 : 10); b = zufall(2, 10); } while (a === b);
    var s = a * b;
    return {
      art: 'umkehr', op: '·', umkehrOp: ':', a: a, b: b, s: s, schluessel: Math.min(a, b) + '*' + Math.max(a, b),
      blase: 'Drei Zahlen, vier Aufgaben!',
      hilfe: feldHilfe(a, b, false),
      luecken: [
        { loesung: s, auswahl: reiheAuswahl(s, b), sprich: 'Wie viel ist ' + a + ' mal ' + b + '?' },
        { loesung: s, sprich: 'Und ' + b + ' mal ' + a + '?', tipp: 'Tauschaufgabe! Das Ergebnis bleibt gleich.', blase: 'Jetzt die Tauschaufgabe.' },
        { loesung: b, auswahl: auswahl(b, 1, 10), sprich: 'Wie viel ist ' + s + ' geteilt durch ' + a + '?', tipp: 'Schau auf die drei Kugeln.', blase: 'Jetzt geteilt!' },
        { loesung: a, auswahl: auswahl(a, 1, 10), sprich: 'Und ' + s + ' geteilt durch ' + b + '?', tipp: 'Schau auf die drei Kugeln.', blase: 'Die letzte!' }
      ]
    };
  });
}

// Rechenblume: innen mal (oder geteilt durch) die Mitte ergibt außen.
function malblume(i, benutzt) {
  return einmalig(benutzt, function () {
    var r = zufall(2, i < 2 ? 5 : 9), geteilt = i >= 3 && i % 2 === 0;
    var faktoren = mischen(bereich(1, geteilt ? 9 : 10)).slice(0, 6);
    var innen = geteilt ? faktoren.map(function (f) { return f * r; }) : faktoren;
    var aussen = geteilt ? faktoren : faktoren.map(function (f) { return f * r; });
    var offen = mischen(bereich(0, 5)).slice(0, 3).sort();
    var luecken = offen.map(function (k) {
      return {
        loesung: aussen[k], auswahl: geteilt ? auswahl(aussen[k], 1, 10) : reiheAuswahl(aussen[k], r),
        sprich: geteilt ? 'Wie viel ist ' + innen[k] + ' geteilt durch ' + r + '?' : 'Wie viel ist ' + innen[k] + ' mal ' + r + '?',
        tipp: geteilt ? 'Welche Zahl mal ' + r + ' ergibt ' + innen[k] + '?' : 'Rechne ' + innen[k] + ' · ' + r + '.',
        blase: 'Nächstes Blatt!'
      };
    });
    return {
      art: 'blume', mitteText: (geteilt ? ':' : '·') + r, innen: innen, aussen: aussen, offen: offen,
      schluessel: (geteilt ? ':' : '*') + r + ':' + innen.join(','),
      blase: geteilt ? 'Teile jede Zahl durch ' + r + '.' : 'Rechne jede Zahl mal ' + r + '.',
      luecken: luecken
    };
  });
}

// Maltabelle: zwei Reihen (r und 2r), fünf Spalten, drei Felder fehlen.
function maltabelle(i, benutzt) {
  return einmalig(benutzt, function () {
    var r = zufall(2, 5), reihen = [r, 2 * r];
    var spalten = mischen(bereich(1, 10)).slice(0, 5).sort(function (a, b) { return a - b; });
    var offen = mischen(bereich(0, 9)).slice(0, 3).sort(function (a, b) { return a - b; });
    var luecken = [];
    var gitter = [[{ kopf: '·' }].concat(spalten.map(function (s) { return { kopf: s }; }))];
    reihen.forEach(function (z, zi) {
      gitter.push([{ kopf: z }].concat(spalten.map(function (s, si) {
        var k = offen.indexOf(zi * 5 + si);
        if (k < 0) return z * s;
        luecken[k] = {
          loesung: z * s, auswahl: reiheAuswahl(z * s, z),
          sprich: 'Was kommt in das Feld ' + z + ' mal ' + s + '?', tipp: 'Rechne ' + z + ' · ' + s + '.', blase: 'Nächstes Feld!'
        };
        return L(k);
      })));
    });
    return {
      art: 'bloecke', schluessel: r + ':' + spalten.join(',') + ':' + offen.join(','), blase: 'Fülle die Maltabelle.',
      bloecke: [{ gitter: gitter, stil: 'maltabelle' }],
      luecken: luecken
    };
  });
}

// ---------- Teilen ----------

var DINGE = [
  { zeichen: '🍒', name: 'Kirschen' }, { zeichen: '🍎', name: 'Äpfel' }, { zeichen: '🍐', name: 'Birnen' },
  { zeichen: '🍓', name: 'Erdbeeren' }, { zeichen: '🍪', name: 'Kekse' }, { zeichen: '🥕', name: 'Möhren' }
];

// Aufteilen: Wie viele Gruppen zu je j Punkten?
function aufteilen(i, benutzt) {
  return einmalig(benutzt, function () {
    var j = zufall(2, i < 4 ? 4 : 6), g = zufall(2, i < 4 ? 4 : 6), n = j * g;
    var gruppen = { typ: 'gruppen', gruppen: g, je: j, umkreist: true };
    return {
      art: 'bloecke', schluessel: n + ':' + j, blase: 'Immer ' + j + ' Punkte kommen zusammen.',
      hilfe: i < 3 ? undefined : { bild: gruppen, sichtbar: false },
      bloecke: (i < 3 ? [{ bild: gruppen }] : [{ bild: { typ: 'punkte', n: n } }]).concat([{ zeilen: [[n, ':', j, '=', L(0)]] }]),
      luecken: [{
        loesung: g, auswahl: auswahl(g, 1, 10),
        sprich: n + ' Punkte. Immer ' + j + ' kommen zusammen. Wie viele Gruppen gibt es? ' + n + ' geteilt durch ' + j + '.',
        tipp: i < 3 ? 'Zähle die Kreise.' : 'Wie oft passt die ' + j + ' in die ' + n + '?'
      }]
    };
  });
}

// Verteilen: n Dinge gerecht an k Kinder.
function verteilen(i, benutzt) {
  return einmalig(benutzt, function () {
    var k = zufall(2, i < 4 ? 3 : 5), je = zufall(2, i < 4 ? 4 : 5), n = k * je, ding = DINGE[zufall(0, DINGE.length - 1)];
    return {
      art: 'bloecke', schluessel: n + ':' + k, blase: 'Verteile gerecht!',
      hilfe: { bild: { typ: 'teller', kinder: k, je: je, ding: ding.zeichen }, sichtbar: false },
      bloecke: [
        { text: n + ' ' + ding.name + ', ' + k + ' Kinder' },
        { bild: { typ: 'dinge', n: n, ding: ding.zeichen } },
        { zeilen: [[n, ':', k, '=', L(0)]] }
      ],
      luecken: [{
        loesung: je, auswahl: auswahl(je, 1, 10),
        sprich: n + ' ' + ding.name + ' werden gerecht an ' + k + ' Kinder verteilt. Wie viele bekommt jedes Kind?',
        tipp: 'Gib jedem Kind eins, dann noch eins, … bis alle verteilt sind.'
      }]
    };
  });
}

function geteiltRechnen(i, benutzt) {
  return einmalig(benutzt, function () {
    var r = zufall(2, 10);
    if (i % 3 === 2) {
      var ks = mischen(bereich(1, 10)).slice(0, 3);
      return {
        art: 'bloecke', schluessel: 't' + r + ':' + ks.join(','), blase: 'Teile jede Zahl durch ' + r + '.',
        bloecke: [{
          gitter: [[{ kopf: ':' }, { kopf: r }]].concat(ks.map(function (k, j) { return [{ kopf: k * r }, L(j)]; })),
          stil: 'geteilt'
        }],
        luecken: ks.map(function (k, j) {
          return {
            loesung: k, auswahl: auswahl(k, 1, 10), sprich: 'Wie viel ist ' + k * r + ' geteilt durch ' + r + '?',
            tipp: 'Welche Zahl mal ' + r + ' ergibt ' + k * r + '?', blase: j ? 'Nächste Zeile!' : undefined
          };
        })
      };
    }
    var k = zufall(1, 10);
    return {
      art: 'bloecke', schluessel: k * r + ':' + r, blase: 'Denk an die Malaufgabe!',
      hilfe: feldHilfe(k, r),
      bloecke: [{ zeilen: [[k * r, ':', r, '=', L(0)]] }],
      luecken: [{ loesung: k, auswahl: auswahl(k, 1, 10), sprich: 'Wie viel ist ' + k * r + ' geteilt durch ' + r + '?', tipp: 'Welche Zahl mal ' + r + ' ergibt ' + k * r + '?' }]
    };
  });
}

function teilenMitRest(i, benutzt) {
  return einmalig(benutzt, function () {
    var d = zufall(2, i < 4 ? 5 : 9), q = zufall(1, i < 4 ? 5 : 9), rest = zufall(1, d - 1), a = q * d + rest;
    return {
      art: 'bloecke', schluessel: a + ':' + d, blase: 'Teilen – und was bleibt übrig?',
      hilfe: { bild: { typ: 'gruppen', gruppen: q, je: d, rest: rest, umkreist: true }, sichtbar: i < 2 },
      bloecke: [{ zeilen: [[a, ':', d, '=', L(0), 'R', L(1)]] }],
      luecken: [
        {
          loesung: q, auswahl: auswahl(q, 1, 10), sprich: 'Wie viel ist ' + a + ' geteilt durch ' + d + '? Wie oft passt die ' + d + ' hinein?',
          tipp: 'Welche Zahl aus der ' + d + 'er-Reihe ist knapp unter ' + a + '?'
        },
        { loesung: rest, auswahl: auswahl(rest, 0, d - 1), sprich: 'Und wie viel bleibt übrig? Das ist der Rest.', blase: 'Wie viel bleibt übrig?', tipp: 'Rechne ' + a + ' − ' + q * d + '.' }
      ]
    };
  });
}

function geradeUngerade(i, benutzt) {
  return einmalig(benutzt, function () {
    var n = i < 4 ? zufall(2, 20) : zufall(21, 99), gerade = n % 2 === 0;
    return {
      art: 'bloecke', schluessel: 'g' + n, blase: 'Gerade oder ungerade?',
      bloecke: (i < 4 ? [{ bild: { typ: 'paare', n: n } }] : []).concat([{ zeilen: [[n, 'ist', L(0)]] }]),
      luecken: [{
        loesung: gerade ? 'gerade' : 'ungerade', optionen: ['gerade', 'ungerade'],
        sprich: 'Ist ' + n + ' gerade oder ungerade?',
        tipp: i < 4 ? 'Hat jeder Punkt einen Partner?' : 'Schau auf die Einer: 0, 2, 4, 6, 8 sind gerade.',
        loesungText: n + ' ist ' + (gerade ? 'gerade' : 'ungerade') + '.'
      }]
    };
  });
}

THEMEN = THEMEN.concat([
  { id: 'k2-kern', klasse: 2, stufe: 5, titel: 'Kernaufgaben', symbol: '2·5', farbe: '#2a9d8f', erzeuge: kernaufgaben },
  {
    id: 'k2-reihe', klasse: 2, stufe: 5, titel: 'Malreihen', symbol: '·7', farbe: '#e76f51', erzeuge: malreihe,
    varianten: bereich(2, 10).map(function (r) { return { id: String(r), titel: '· ' + r, wert: r }; })
      .concat([{ id: 'alle', titel: 'Alle', wert: 0 }])
  },
  { id: 'k2-malraupe', klasse: 2, stufe: 5, titel: 'Malraupe', symbol: '3 6 9', farbe: '#7cb342', erzeuge: malraupe, anzahl: 8 },
  { id: 'k2-tausch', klasse: 2, stufe: 5, titel: 'Tauschaufgaben', symbol: '⇄', farbe: '#00a3c4', erzeuge: malTausch, anzahl: 8 },
  { id: 'k2-nachbar', klasse: 2, stufe: 5, titel: 'Nachbaraufgaben', symbol: '6·7', farbe: '#6a7fdb', erzeuge: nachbaraufgaben, anzahl: 8 },
  { id: 'k2-verdoppeln', klasse: 2, stufe: 5, titel: 'Mal verdoppeln', symbol: '3→6', farbe: '#e9a23b', erzeuge: malVerdoppeln, anzahl: 8 },
  { id: 'k2-quadrat', klasse: 2, stufe: 5, titel: 'Quadratzahlen', symbol: '4·4', farbe: '#c2703d', erzeuge: quadratzahlen, anzahl: 8 },
  { id: 'k2-umkehr', klasse: 2, stufe: 5, titel: 'Umkehraufgaben', symbol: '↺', farbe: '#8e6bbf', erzeuge: malUmkehr, anzahl: 5 },
  { id: 'k2-blume', klasse: 2, stufe: 5, titel: 'Rechenblume', symbol: '✿', farbe: '#d6609a', erzeuge: malblume, anzahl: 5 },
  { id: 'k2-tabelle', klasse: 2, stufe: 5, titel: 'Maltabelle', symbol: '⊞', farbe: '#2a9d8f', erzeuge: maltabelle, anzahl: 5 },

  { id: 'k2-aufteilen', klasse: 2, stufe: 6, titel: 'Aufteilen', symbol: '⁘', farbe: '#00a3c4', erzeuge: aufteilen, anzahl: 8 },
  { id: 'k2-verteilen', klasse: 2, stufe: 6, titel: 'Verteilen', symbol: '🍒', farbe: '#e76f51', erzeuge: verteilen, anzahl: 6 },
  { id: 'k2-geteilt', klasse: 2, stufe: 6, titel: 'Geteilt rechnen', symbol: '24:6', farbe: '#6a7fdb', erzeuge: geteiltRechnen, anzahl: 9 },
  { id: 'k2-rest', klasse: 2, stufe: 6, titel: 'Teilen mit Rest', symbol: 'R', farbe: '#8e6bbf', erzeuge: teilenMitRest, anzahl: 8 },
  { id: 'k2-gerade', klasse: 2, stufe: 6, titel: 'Gerade, ungerade', symbol: '2 4 6', farbe: '#7cb342', erzeuge: geradeUngerade }
]);
