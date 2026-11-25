(function () {
  'use strict';

  var VERSION = '2.0';
  var SPEICHER_SCHLUESSEL = 'igel-rechnen-v1';
  var LOB = ['Super!', 'Toll!', 'Richtig!', 'Klasse!', 'Prima!', 'Spitze!', 'Genau!'];
  var ZEICHEN_WORT = { '<': 'kleiner', '>': 'größer', '=': 'gleich' };
  var app = document.getElementById('app');

  // ---------- Speichern (nur auf diesem Gerät) ----------

  var daten = laden();

  function laden() {
    var leer = { einstellungen: { vorlesen: true, toene: true, eingabe: 'auto' }, fortschritt: {} };
    try {
      var gespeichert = JSON.parse(localStorage.getItem(SPEICHER_SCHLUESSEL));
      if (gespeichert) {
        leer.einstellungen = Object.assign(leer.einstellungen, gespeichert.einstellungen);
        leer.fortschritt = gespeichert.fortschritt || {};
      }
    } catch (e) { /* kein Speicher verfügbar – dann eben ohne */ }
    return leer;
  }

  function speichern() {
    try { localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(daten)); } catch (e) { }
  }

  // ---------- Töne und Vorlesen ----------

  var audio = null;
  function ton(folge) {
    if (!daten.einstellungen.toene) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime;
      folge.forEach(function (f, k) {
        var osc = audio.createOscillator(), gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, t + k * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, t + k * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.12 + 0.25);
        osc.connect(gain).connect(audio.destination);
        osc.start(t + k * 0.12);
        osc.stop(t + k * 0.12 + 0.3);
      });
    } catch (e) { }
  }
  var TON_RICHTIG = [660, 880], TON_TEIL = [660], TON_FALSCH = [300], TON_ENDE = [523, 659, 784, 1047];

  var stimme = null;
  function stimmeSuchen() {
    if (!('speechSynthesis' in window)) return;
    var alle = speechSynthesis.getVoices();
    stimme = alle.filter(function (v) { return /^de/i.test(v.lang); })[0] || null;
  }
  if ('speechSynthesis' in window) {
    stimmeSuchen();
    speechSynthesis.onvoiceschanged = stimmeSuchen;
  }

  // Zahlen als Wörter vorlesen – sonst liest die Sprachausgabe „3.“ als „dritter“.
  var EINER_WORT = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
    'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  var ZEHNER_WORT = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function zahlWort(n) {
    if (n < 20) return EINER_WORT[n];
    if (n < 100) {
      var e = n % 10, z = ZEHNER_WORT[Math.floor(n / 10)];
      return e === 0 ? z : (e === 1 ? 'ein' : EINER_WORT[e]) + 'und' + z;
    }
    return n === 100 ? 'hundert' : String(n);
  }
  function zahlenAlsWoerter(text) {
    return text.replace(/\d+/g, function (z) { return zahlWort(Number(z)); });
  }

  function sprich(text, erzwingen) {
    if (!('speechSynthesis' in window)) return;
    if (!daten.einstellungen.vorlesen && !erzwingen) return;
    speechSynthesis.cancel();
    text = text.replace(/−/g, ' minus ').replace(/\+/g, ' plus ').replace(/·/g, ' mal ').replace(/(\d) ?: ?(\d)/g, '$1 geteilt durch $2');
    var u = new SpeechSynthesisUtterance(zahlenAlsWoerter(text));
    u.lang = 'de-DE';
    u.rate = 0.9;
    if (stimme) u.voice = stimme;
    speechSynthesis.speak(u);
  }

  // ---------- Bausteine ----------

  function sterneHTML(anzahl, klasse) {
    var s = '';
    for (var k = 1; k <= 3; k++) s += '<span class="stern' + (k <= anzahl ? ' an' : '') + '">★</span>';
    return '<span class="sterne ' + (klasse || '') + '" aria-label="' + anzahl + ' von 3 Sternen">' + s + '</span>';
  }

  // Punktestreifen: Liste von Punkt-Arten ('blau', 'orange', 'rot', 'weg'), auf 10 Felder aufgefüllt.
  // Mehr als 10 Punkte: zwei Streifen untereinander (Zahlen bis 20).
  function streifenHTML(punkte, form) {
    if (punkte.length > 10) {
      return '<div class="streifen-20">' + streifenHTML(punkte.slice(0, 10), form) + streifenHTML(punkte.slice(10), form) + '</div>';
    }
    var felder = '';
    for (var k = 0; k < 10; k++) {
      var art = punkte[k];
      felder += '<span class="feld">' + (art ? '<span class="punkt ' + art + '"></span>' : '') + '</span>';
    }
    return '<div class="streifen ' + (form || '') + '" aria-hidden="true">' + felder + '</div>';
  }

  // Eine Lücke, die das Kind ausfüllt. k = Nummer der Lücke in der Aufgabe.
  function feld(k, klasse) {
    return '<span class="luecke ' + (klasse || '') + '" data-k="' + k + '">&nbsp;</span>';
  }

  // ---------- Navigation (Zurück-Taste des Handys) ----------

  // Seiten: Hauptseite (Klassenwahl) → Klasse → (Reihe wählen) → Übung.
  // Jede Unterseite legt einen Eintrag im Verlauf an, damit die Zurück-Taste eine Seite zurückgeht.
  window.addEventListener('popstate', function (ev) {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    zeigeSeite(ev.state);
  });
  function neueSeite(zustand) { history.pushState(zustand || { unterseite: true }, ''); }

  function zeigeSeite(zustand) {
    runde = null;
    if (zustand && zustand.varianten) return zeigeVarianten(zustand.varianten);
    if (zustand && zustand.klasse) return zeigeKlasse(zustand.klasse);
    zeigeHauptseite();
  }

  // Eine Seite zurück (oder direkt zur Seite darüber, wenn es keinen Verlauf gibt).
  function zurueck(ersatz) {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (history.state && (history.state.unterseite || history.state.klasse || history.state.varianten)) history.back();
    else ersatz();
  }

  var KLASSEN = {
    1: {
      titel: 'Igel-Rechnen 1', klasse: '1. Klasse', inhalt: 'Zahlen bis 20', farbe: '#2a9d8f',
      abschnitte: [[1, 'Zahlen bis 10'], [2, 'Zahlen bis 20']]
    },
    2: {
      titel: 'Igel-Rechnen 2', klasse: '2. Klasse', inhalt: 'Zahlen bis 100 und Einmaleins', farbe: '#e76f51',
      abschnitte: [[3, 'Zahlen bis 100'], [4, 'Plus und Minus bis 100'], [5, 'Einmaleins'], [6, 'Teilen']]
    }
  };

  function klasseVon(t) { return t.klasse || 1; }
  function themaMitId(id) { return THEMEN.filter(function (t) { return t.id === id; })[0]; }

  // Ein Thema mit Varianten (Malreihen) wird für jede Variante zu einem eigenen Thema.
  function variantenThema(t, v) {
    return {
      id: t.id + '-' + v.id, titel: t.titel + ' ' + v.titel, klasse: t.klasse, stufe: t.stufe, farbe: t.farbe,
      anzahl: t.anzahl, eltern: t.id,
      erzeuge: function (i, benutzt) { return t.erzeuge(i, benutzt, v.wert); }
    };
  }

  function besteSterne(t) {
    if (!t.varianten) { var f = daten.fortschritt[t.id]; return f ? f.beste : 0; }
    return Math.max.apply(null, t.varianten.map(function (v) { return besteSterne(variantenThema(t, v)); }));
  }

  // ---------- Hauptseite: Klasse wählen ----------

  function zeigeHauptseite() {
    runde = null;
    var karte = function (nr) {
      var k = KLASSEN[nr], themen = THEMEN.filter(function (t) { return klasseVon(t) === nr && !t.bald; });
      var sterne = themen.reduce(function (s, t) { return s + besteSterne(t); }, 0);
      return '<button class="klassen-karte" data-klasse="' + nr + '" style="--farbe:' + k.farbe + '">' +
        '<span class="klassen-nr">' + nr + '</span>' +
        '<span class="klassen-text"><span class="klassen-titel">' + k.titel + '</span>' +
        '<span class="klassen-info">' + k.klasse + ' · ' + k.inhalt + '</span>' +
        '<span class="klassen-sterne"><span class="stern an">★</span> ' + sterne + ' von ' + themen.length * 3 + '</span></span>' +
        '<span class="pfeil" aria-hidden="true">›</span></button>';
    };
    app.innerHTML =
      '<section class="start">' +
      '<button class="eltern-knopf" data-aktion="eltern" aria-label="Elternbereich">⚙</button>' +
      '<div class="kopf">' + igelSVG('froh') +
      '<div><h1>Igel-Rechnen</h1><p class="gruss">Hallo! In welche Klasse gehst du?</p></div></div>' +
      '<div class="klassen">' + karte(1) + karte(2) + '</div>' +
      '</section>';
  }

  // ---------- Übersicht einer Klasse ----------

  function zeigeKlasse(nr) {
    runde = null;
    var k = KLASSEN[nr];
    var karten = function (stufe) {
      return THEMEN.filter(function (t) { return klasseVon(t) === nr && t.stufe === stufe; }).map(function (t) {
        if (t.bald) {
          return '<div class="karte bald" aria-disabled="true"><span class="symbol">' + t.symbol +
            '</span><span class="titel">' + t.titel + '</span><span class="marke">bald</span></div>';
        }
        return '<button class="karte" data-thema="' + t.id + '" style="--farbe:' + t.farbe + '">' +
          '<span class="symbol">' + t.symbol + '</span><span class="titel">' + t.titel + '</span>' +
          sterneHTML(besteSterne(t), 'klein') + '</button>';
      }).join('');
    };

    app.innerHTML =
      '<section class="start" style="--farbe:' + k.farbe + '">' +
      '<header class="leiste"><button class="rund" data-aktion="haupt" aria-label="Zur Klassenwahl">‹</button>' +
      '<h2 class="seitentitel">' + k.titel + '</h2><span class="platzhalter"></span></header>' +
      '<div class="kopf klein">' + igelSVG('froh') +
      '<p class="gruss">Was wollen wir heute üben?</p></div>' +
      k.abschnitte.map(function (a) {
        return '<h2>' + a[1] + '</h2><div class="karten">' + karten(a[0]) + '</div>';
      }).join('') +
      '</section>';
  }

  // ---------- Variante wählen (z. B. welche Malreihe) ----------

  function zeigeVarianten(themaId) {
    runde = null;
    var t = themaMitId(themaId);
    app.innerHTML =
      '<section class="start" style="--farbe:' + t.farbe + '">' +
      '<header class="leiste"><button class="rund" data-aktion="haupt" aria-label="Zurück">‹</button>' +
      '<h2 class="seitentitel">' + t.titel + '</h2><span class="platzhalter"></span></header>' +
      '<div class="kopf klein">' + igelSVG('froh') + '<p class="gruss">Welche Reihe möchtest du üben?</p></div>' +
      '<div class="karten drei">' + t.varianten.map(function (v) {
        var f = daten.fortschritt[t.id + '-' + v.id];
        return '<button class="karte" data-thema="' + t.id + '" data-variante="' + v.id + '" style="--farbe:' + t.farbe + '">' +
          '<span class="symbol">' + v.titel + '</span>' + sterneHTML(f ? f.beste : 0, 'klein') + '</button>';
      }).join('') + '</div>' +
      '</section>';
  }

  // ---------- Übungsrunde ----------

  var runde = null;

  function starteRunde(thema, gleicheSeite) {
    runde = { thema: thema, anzahl: thema.anzahl || 10, nr: 0, benutzt: {}, gleichRichtig: 0 };
    if (!gleicheSeite) neueSeite({ unterseite: true, klasse: klasseVon(thema) });
    naechsteAufgabe();
  }

  function waehleThema(themaId, varianteId) {
    var t = themaMitId(themaId);
    if (varianteId) return starteRunde(variantenThema(t, t.varianten.filter(function (v) { return v.id === varianteId; })[0]));
    if (t.varianten) { neueSeite({ varianten: t.id, klasse: klasseVon(t) }); return zeigeVarianten(t.id); }
    starteRunde(t);
  }

  function naechsteAufgabe() {
    if (runde.nr >= runde.anzahl) return zeigeErgebnis();
    runde.aufgabe = runde.thema.erzeuge(runde.nr, runde.benutzt);
    runde.ohneFehler = true;
    zeichneAufgabe();
    aktiviereLuecke(0);
  }

  function aktuelleLuecke() { return runde.aufgabe.luecken[runde.k]; }
  function lueckeEl(k) { return app.querySelector('.luecke[data-k="' + k + '"]'); }

  function aktiviereLuecke(k) {
    runde.k = k;
    runde.fehler = 0;
    runde.eingabe = '';
    runde.gesperrt = false;
    app.querySelectorAll('.luecke.aktiv').forEach(function (l) { l.classList.remove('aktiv'); });
    lueckeEl(k).classList.add('aktiv');
    app.querySelector('.eingabe').innerHTML = eingabeHTML();
    if (k > 0) blase(aktuelleLuecke().blase || 'Weiter so!', 'normal');
    sprich(aktuelleLuecke().sprich);
  }

  function mitAuswahl() {
    var e = daten.einstellungen.eingabe;
    return e === 'auswahl' || (e === 'auto' && runde.nr < (runde.anzahl >= 8 ? 3 : 1));
  }

  function zeichneAufgabe() {
    var a = runde.aufgabe;
    var fortschritt = '';
    for (var k = 0; k < runde.anzahl; k++) {
      fortschritt += '<span class="schritt' + (k < runde.nr ? ' fertig' : k === runde.nr ? ' jetzt' : '') + '"></span>';
    }
    var hilfe = a.hilfe
      ? '<div class="hilfe' + (a.hilfe.sichtbar ? '' : ' versteckt') + '">' +
        (a.hilfe.bild ? bildHTML(a.hilfe.bild) : streifenHTML(a.hilfe.punkte)) + '</div>'
      : '';

    app.innerHTML =
      '<section class="uebung" style="--farbe:' + runde.thema.farbe + '">' +
      '<header class="leiste">' +
      '<button class="rund" data-aktion="heim" aria-label="Zur Übersicht">✕</button>' +
      '<div class="fortschritt" aria-label="Aufgabe ' + (runde.nr + 1) + ' von ' + runde.anzahl + '">' + fortschritt + '</div>' +
      '<button class="rund" data-aktion="vorlesen" aria-label="Vorlesen">🔊</button>' +
      '</header>' +
      '<div class="igel-zeile">' + igelSVG('normal') + '<p class="blase">' +
      (a.blase || (runde.nr === 0 ? 'Los geht’s!' : 'Rechne mal!')) + '</p></div>' +
      '<div class="buehne buehne-' + a.art + '">' + (a.art === 'haus' ? buehneHTML(a) + hilfe : hilfe + buehneHTML(a)) + '</div>' +
      '<div class="eingabe"></div>' +
      '</section>';
  }

  function buehneHTML(a) {
    switch (a.art) {
      case 'rechnung':
        return '<div class="gleichung">' + a.a + ' ' + a.op + ' ' + a.b + ' = ' + feld(0) + '</div>';

      case 'zeilen':
        return zeilenHTML(a.zeilen);

      case 'bloecke':
        return a.bloecke.map(function (b) {
          if (b.zeilen) return zeilenHTML(b.zeilen);
          if (b.gitter) return gitterHTML(b.gitter, b.stil);
          if (b.bild) return bildHTML(b.bild);
          if (b.text) return '<p class="aufgabentext">' + b.text + '</p>';
          return '';
        }).join('');

      case 'haus':
        return '<div class="haus"><div class="dach"><span class="dachzahl">' + a.dach + '</span></div><div class="wand">' +
          a.zeilen.map(function (z, k) {
            return '<div class="stockwerk' + (k === a.aktiv ? ' aktiv' : '') + '"><span>' + z[0] + '</span><span class="plus">+</span>' +
              (k === a.aktiv ? feld(0) : '<span>' + z[1] + '</span>') + '</div>';
          }).join('') + '</div></div>';

      case 'vergleich':
        var seite = function (s) {
          return '<div class="seite"><span class="zahl">' + s.text + '</span>' +
            (s.punkte ? streifenHTML(wiederhole('blau', s.wert), 'feld5') : '') + '</div>';
        };
        return '<div class="vergleich">' + seite(a.links) + feld(0, 'zeichen') + seite(a.rechts) + '</div>';

      case 'raupe':
        return '<div class="raupe">' + raupenkopf() + a.zahlen.map(function (z, k) {
          return k === a.pos ? feld(0, 'glied') : '<span class="glied">' + z + '</span>';
        }).join('') + '</div>';

      case 'tausch':
        return '<div class="gleichungen">' +
          '<div class="gleichung klein">' + a.a + ' + ' + a.b + ' = ' + feld(0) + '</div>' +
          '<div class="gleichung klein">' + a.b + ' + ' + a.a + ' = ' + feld(1) + '</div></div>';

      case 'mauer':
        return '<div class="mauer">' + a.reihen.map(function (reihe) {
          return '<div class="reihe">' + reihe.map(function (stein) {
            return stein.luecke !== undefined ? feld(stein.luecke, 'stein') : '<span class="stein">' + stein.wert + '</span>';
          }).join('') + '</div>';
        }).join('') + '</div>';

      case 'blume':
        return blumeHTML(a);

      case 'umkehr':
        var op = a.op || '+', um = a.umkehrOp || '−';
        return '<div class="kugeln"><span class="kugel">' + a.a + '</span><span class="kugel">' + a.b +
          '</span><span class="kugel gross">' + a.s + '</span></div>' +
          '<div class="umkehr">' +
          '<div class="gleichung klein">' + a.a + ' ' + op + ' ' + a.b + ' = ' + feld(0) + '</div>' +
          '<div class="gleichung klein">' + a.s + ' ' + um + ' ' + a.a + ' = ' + feld(2) + '</div>' +
          '<div class="gleichung klein">' + a.b + ' ' + op + ' ' + a.a + ' = ' + feld(1) + '</div>' +
          '<div class="gleichung klein">' + a.s + ' ' + um + ' ' + a.b + ' = ' + feld(3) + '</div></div>';
    }
    return '';
  }

  function raupenkopf() {
    return '<svg class="raupenkopf" viewBox="0 0 60 64" aria-hidden="true">' +
      '<path d="M22 14 Q18 2 10 4 M38 14 Q42 2 50 4" stroke="#4d7a22" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="10" cy="4" r="4" fill="#4d7a22"/><circle cx="50" cy="4" r="4" fill="#4d7a22"/>' +
      '<circle cx="30" cy="38" r="25" fill="#8bc34a" stroke="#4d7a22" stroke-width="3"/>' +
      '<circle cx="22" cy="33" r="5" fill="#fff"/><circle cx="38" cy="33" r="5" fill="#fff"/>' +
      '<circle cx="23" cy="34" r="2.6" fill="#2d2d2d"/><circle cx="39" cy="34" r="2.6" fill="#2d2d2d"/>' +
      '<path d="M21 46 q9 8 18 0" stroke="#2d2d2d" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
  }

  function blumeHTML(a) {
    var html = '<div class="blume">';
    a.innen.forEach(function (_, k) {
      html += '<span class="blatt" style="transform: rotate(' + (k * 60) + 'deg)"></span>';
    });
    a.innen.forEach(function (zahl, k) {
      var winkel = k * 60 * Math.PI / 180;
      var pos = function (r) {
        return 'left:' + (50 + r * Math.sin(winkel)).toFixed(1) + '%;top:' + (50 - r * Math.cos(winkel)).toFixed(1) + '%';
      };
      html += '<span class="innen" style="' + pos(24) + '">' + zahl + '</span>';
      var offen = a.offen.indexOf(k);
      html += offen >= 0
        ? '<span class="aussen-platz" style="' + pos(40) + '">' + feld(offen, 'blatt-luecke') + '</span>'
        : '<span class="aussen" style="' + pos(40) + '">' + (a.aussen ? a.aussen[k] : a.mitte - zahl) + '</span>';
    });
    return html + '<span class="mitte' + (a.mitteText ? ' text' : '') + '">' + (a.mitteText || a.mitte) + '</span></div>';
  }

  // Gleichungen untereinander. Die Schrift wird kleiner, je länger die längste Zeile ist.
  function zeilenHTML(zeilen) {
    var laenge = function (zeile) {
      return zeile.reduce(function (s, teil) { return s + 1 + (typeof teil === 'object' ? 3 : String(teil).length); }, 0);
    };
    var max = Math.max.apply(null, zeilen.map(laenge));
    var groesse = zeilen.length === 1 && max <= 12 ? '' : max <= 15 ? ' klein' : max <= 19 ? ' kleiner' : ' winzig';
    return '<div class="gleichungen">' + zeilen.map(function (zeile) {
      return '<div class="gleichung' + groesse + '">' + zeile.map(teilHTML).join(' ') + '</div>';
    }).join('') + '</div>';
  }

  function teilHTML(teil) {
    if (teil === null || teil === undefined) return '';
    if (typeof teil !== 'object') return String(teil);
    if (teil.luecke !== undefined) return feld(teil.luecke);
    if (teil.kopie !== undefined) return '<span class="kopie" data-kopie="' + teil.kopie + '">?</span>';
    return '';
  }

  // Lösung einer Lücke an den Stellen zeigen, die sie wiederverwenden (z. B. 53 + 10 = 63, dann 63 + 4).
  function fuelleKopien(k, wert) {
    app.querySelectorAll('.kopie[data-kopie="' + k + '"]').forEach(function (e) {
      e.textContent = wert;
      e.classList.add('gefuellt');
    });
  }

  // Tabelle: Hundertertafel-Ausschnitt, Maltabelle, Zehner/Einer-Tafel. null = leeres Feld.
  function gitterHTML(gitter, stil) {
    var spalten = Math.max.apply(null, gitter.map(function (z) { return z.length; }));
    return '<div class="gitter ' + (stil || '') + '" style="grid-template-columns:repeat(' + spalten + ', auto)">' +
      gitter.map(function (zeile) {
        return zeile.map(function (z) {
          if (z === null) return '<span class="zelle leer"></span>';
          if (typeof z === 'object' && z.luecke !== undefined) return feld(z.luecke, 'zelle');
          if (typeof z === 'object' && z.kopf !== undefined) return '<span class="zelle kopf">' + z.kopf + '</span>';
          return '<span class="zelle">' + teilHTML(z) + '</span>';
        }).join('');
      }).join('') + '</div>';
  }

  function punkteHTML(n, klasse) {
    var s = '';
    for (var k = 0; k < n; k++) s += '<span class="pkt' + (klasse ? ' ' + klasse : '') + '"></span>';
    return s;
  }

  // Bilder zu den Aufgaben.
  function bildHTML(b) {
    var k, html;
    switch (b.typ) {
      case 'zehner': // Zehnerstangen und einzelne Einer
        html = '<div class="bild zehner-bild" aria-hidden="true">';
        for (k = 0; k < b.z; k++) html += '<span class="stange">' + punkteHTML(10) + '</span>';
        if (b.e) html += '<span class="einer">' + punkteHTML(b.e) + '</span>';
        return html + '</div>';

      case 'feld': // Punktefeld für Malaufgaben: reihen × spalten
        html = '<div class="bild punktefeld" aria-hidden="true">';
        for (k = 0; k < b.reihen; k++) html += '<span class="feldreihe">' + punkteHTML(b.spalten) + '</span>';
        return html + '</div>';

      case 'gruppen': // Punkte in Gruppen, eingekreist, optional mit Rest
        html = '<div class="bild gruppen" aria-hidden="true">';
        for (k = 0; k < b.gruppen; k++) {
          html += '<span class="gruppe' + (b.umkreist ? ' umkreist' : '') + '" style="--je:' + Math.min(b.je, 3) + '">' + punkteHTML(b.je) + '</span>';
        }
        if (b.rest) html += '<span class="gruppe rest" style="--je:' + Math.min(b.rest, 3) + '">' + punkteHTML(b.rest, 'rot') + '</span>';
        return html + '</div>';

      case 'punkte': // lose Punkte
        return '<div class="bild lose-punkte" aria-hidden="true">' + punkteHTML(b.n) + '</div>';

      case 'paare': // gerade/ungerade: Punkte paarweise
        html = '<div class="bild paare" aria-hidden="true">';
        for (k = 0; k < Math.floor(b.n / 2); k++) html += '<span class="paar">' + punkteHTML(2) + '</span>';
        if (b.n % 2) html += '<span class="paar">' + punkteHTML(1, 'rot') + '</span>';
        return html + '</div>';

      case 'dinge':
        html = '<div class="bild dinge" aria-hidden="true">';
        for (k = 0; k < b.n; k++) html += '<span>' + b.ding + '</span>';
        return html + '</div>';

      case 'teller': // gerecht verteilt: ein Teller je Kind
        html = '<div class="bild teller-bild" aria-hidden="true">';
        for (k = 0; k < b.kinder; k++) {
          var inhalt = '';
          for (var j = 0; j < b.je; j++) inhalt += '<span>' + b.ding + '</span>';
          html += '<span class="kind"><span class="gesicht">🙂</span><span class="teller">' + inhalt + '</span></span>';
        }
        return html + '</div>';

      case 'strahl':
        return strahlSVG(b.von, b.bis, b.wert);
    }
    return '';
  }

  // Zahlenstrahl von „von“ bis „bis“, ein Strich je Zahl, Pfeil zeigt auf „wert“.
  function strahlSVG(von, bis, wert) {
    var breite = 340, rand = 18, schritt = (breite - 2 * rand) / (bis - von), html = '';
    var x = function (n) { return (rand + (n - von) * schritt).toFixed(1); };
    html += '<line x1="' + (rand - 8) + '" y1="52" x2="' + (breite - rand + 8) + '" y2="52" stroke="#3d3027" stroke-width="2.5"/>';
    for (var n = von; n <= bis; n++) {
      var lang = n % 10 === 0 ? 16 : n % 5 === 0 ? 11 : 6;
      html += '<line x1="' + x(n) + '" y1="' + (52 - lang) + '" x2="' + x(n) + '" y2="' + (52 + lang) +
        '" stroke="#3d3027" stroke-width="' + (n % 10 === 0 ? 2.5 : 1.5) + '"/>';
      if (n % 10 === 0) html += '<text x="' + x(n) + '" y="92" text-anchor="middle" font-size="20" font-weight="700" fill="#3d3027">' + n + '</text>';
    }
    if (wert !== undefined) html += '<path d="M' + x(wert) + ' 32 l-9 -18 h18 z" class="strahl-pfeil"/>';
    return '<svg class="bild strahl" viewBox="0 0 ' + breite + ' 100" aria-hidden="true">' + html + '</svg>';
  }

  function eingabeHTML() {
    var l = aktuelleLuecke();
    if (l.optionen) {
      var wort = l.optionen.some(function (o) { return typeof o === 'string'; });
      return '<div class="auswahl" style="grid-template-columns:repeat(' + l.optionen.length + ', 1fr)">' +
        l.optionen.map(function (o) {
          return '<button class="taste gross' + (wort ? ' wort' : '') + '" data-antwort="' + o + '">' + o + '</button>';
        }).join('') + '</div>';
    }
    if (runde.aufgabe.zeichen) {
      return '<div class="auswahl">' + ['<', '=', '>'].map(function (z) {
        return '<button class="taste gross" data-antwort="' + z + '" aria-label="' + ZEICHEN_WORT[z] + '">' + z + '</button>';
      }).join('') + '</div>';
    }
    if (mitAuswahl()) {
      var werte = l.auswahl || auswahl(l.loesung, 0, Math.max(10, l.loesung + 3));
      return '<div class="auswahl">' + werte.map(function (z) {
        return '<button class="taste gross" data-antwort="' + z + '">' + z + '</button>';
      }).join('') + '</div>';
    }
    var tasten = '';
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (z) { tasten += '<button class="taste" data-ziffer="' + z + '">' + z + '</button>'; });
    tasten += '<button class="taste neben" data-aktion="loeschen" aria-label="Löschen">⌫</button>' +
      '<button class="taste" data-ziffer="0">0</button>' +
      '<button class="taste ok" data-aktion="pruefen" aria-label="Fertig">✓</button>';
    return '<div class="ziffernfeld">' + tasten + '</div>';
  }

  function zeigeEingabe() {
    var l = lueckeEl(runde.k);
    if (l) l.innerHTML = runde.eingabe === '' ? '&nbsp;' : runde.eingabe;
  }

  function tippe(ziffer) {
    if (!runde || runde.gesperrt || runde.eingabe.length >= 3) return;
    runde.eingabe = (runde.eingabe === '0' ? '' : runde.eingabe) + ziffer;
    zeigeEingabe();
  }

  function loesche() {
    if (!runde || runde.gesperrt) return;
    runde.eingabe = runde.eingabe.slice(0, -1);
    zeigeEingabe();
  }

  function blase(text, stimmung) {
    var b = app.querySelector('.blase');
    if (b) b.textContent = text;
    var zeile = app.querySelector('.igel-zeile');
    if (zeile) zeile.querySelector('svg').outerHTML = igelSVG(stimmung || 'normal');
  }

  function weiterNach(ms) {
    var dieseRunde = runde, k = runde.k;
    setTimeout(function () {
      if (runde !== dieseRunde || runde.k !== k) return;
      weiter();
    }, ms);
  }

  // Nächste Lücke oder nächste Aufgabe.
  function weiter() {
    if (runde.k < runde.aufgabe.luecken.length - 1) return aktiviereLuecke(runde.k + 1);
    if (runde.ohneFehler) runde.gleichRichtig++;
    runde.nr++;
    naechsteAufgabe();
  }

  function pruefe(antwort) {
    if (!runde || runde.gesperrt) return;
    var a = runde.aufgabe, l = aktuelleLuecke(), el = lueckeEl(runde.k);
    el.textContent = antwort;

    if (String(antwort) === String(l.loesung)) {
      runde.gesperrt = true;
      el.classList.remove('aktiv', 'falsch');
      el.classList.add('richtig');
      fuelleKopien(runde.k, l.loesung);
      var letzte = runde.k === a.luecken.length - 1;
      if (letzte) {
        var lob = LOB[zufall(0, LOB.length - 1)];
        blase(lob, 'froh');
        ton(TON_RICHTIG);
        sprich(lob);
        weiterNach(1300);
      } else {
        blase('Richtig!', 'froh');
        ton(TON_TEIL);
        weiterNach(700);
      }
      return;
    }

    runde.fehler++;
    runde.ohneFehler = false;
    ton(TON_FALSCH);
    el.classList.remove('wackeln');
    void el.offsetWidth; // Animation neu starten
    el.classList.add('wackeln', 'falsch');

    if (runde.fehler === 1) {
      var falscherKnopf = app.querySelector('[data-antwort="' + antwort + '"]');
      if (falscherKnopf) falscherKnopf.disabled = true;
      var hilfe = app.querySelector('.hilfe');
      if (hilfe) hilfe.classList.remove('versteckt');
      var tipp = l.tipp ? 'Fast! ' + l.tipp : hilfe ? (a.hilfe.bild ? 'Fast! Schau dir das Bild an.' : 'Fast! Schau dir die Punkte an.') : 'Fast! Versuch es nochmal.';
      blase(tipp, 'denkt');
      sprich(tipp);
      var dieseRunde = runde, k = runde.k;
      setTimeout(function () {
        if (runde !== dieseRunde || runde.k !== k || runde.gesperrt) return;
        runde.eingabe = '';
        el.classList.remove('falsch');
        zeigeEingabe();
      }, 700);
      return;
    }

    // Zweiter Fehler: Lösung zeigen, dann tippt das Kind auf „Weiter“.
    runde.gesperrt = true;
    var kNr = runde.k;
    setTimeout(function () {
      el.textContent = l.loesung;
      el.classList.remove('falsch', 'aktiv');
      el.classList.add('loesung');
      fuelleKopien(kNr, l.loesung);
    }, 500);
    var text = l.loesungText || (a.zeichen ? 'Hier passt ' + l.loesung + '.' : 'Das Ergebnis ist ' + l.loesung + '.');
    blase(text, 'normal');
    sprich(a.zeichen ? 'Hier passt ' + ZEICHEN_WORT[l.loesung] + '.' : text);
    app.querySelector('.eingabe').innerHTML = '<button class="weiter" data-aktion="weiter">Weiter ➜</button>';
  }

  // ---------- Ergebnis ----------

  function sterneFuer(richtig, anzahl) {
    var anteil = richtig / anzahl;
    return anteil >= 0.9 ? 3 : anteil >= 0.7 ? 2 : 1;
  }

  function zeigeErgebnis() {
    var r = runde, sterne = sterneFuer(r.gleichRichtig, r.anzahl);
    var f = daten.fortschritt[r.thema.id] || { beste: 0, runden: 0, richtig: 0, aufgaben: 0 };
    f.beste = Math.max(f.beste, sterne);
    f.runden++;
    f.richtig += r.gleichRichtig;
    f.aufgaben += r.anzahl;
    daten.fortschritt[r.thema.id] = f;
    speichern();

    var text = sterne === 3 ? 'Wow, das war super!' : sterne === 2 ? 'Gut gemacht!' : 'Schön geübt! Übung macht den Meister.';
    app.innerHTML =
      '<section class="ergebnis" style="--farbe:' + r.thema.farbe + '">' +
      igelSVG('froh') +
      sterneHTML(sterne, 'gross') +
      '<h2>' + text + '</h2>' +
      '<p>' + r.gleichRichtig + ' von ' + r.anzahl + ' gleich richtig.</p>' +
      '<div class="knoepfe">' +
      '<button class="weiter" data-aktion="nochmal">Nochmal</button>' +
      '<button class="weiter zweit" data-aktion="heim">Übersicht</button>' +
      '</div></section>';
    ton(TON_ENDE);
    sprich(text);
  }

  // ---------- Elternbereich ----------

  function zeigeElternTor() {
    runde = null;
    var a = zufall(12, 39), b = zufall(12, 39);
    neueSeite();
    app.innerHTML =
      '<section class="eltern">' +
      '<header class="leiste"><button class="rund" data-aktion="heim" aria-label="Zurück">✕</button><h2>Für Erwachsene</h2><span></span></header>' +
      '<form class="tor" data-summe="' + (a + b) + '">' +
      '<label for="tor-eingabe">Bitte lösen: ' + a + ' + ' + b + ' =</label>' +
      '<input id="tor-eingabe" type="number" inputmode="numeric" autocomplete="off" required>' +
      '<button class="weiter" type="submit">Öffnen</button>' +
      '<p class="hinweis" hidden>Das stimmt leider nicht.</p>' +
      '</form></section>';
    app.querySelector('#tor-eingabe').focus();
  }

  function zeigeEltern() {
    var e = daten.einstellungen;
    var zeile = function (t) {
      var f = daten.fortschritt[t.id];
      var quote = f && f.aufgaben ? Math.round(100 * f.richtig / f.aufgaben) + ' %' : '–';
      return '<tr><td>' + t.titel + '</td><td>' + (f ? f.runden : 0) + '</td><td>' + quote + '</td><td>' +
        sterneHTML(f ? f.beste : 0, 'klein') + '</td></tr>';
    };
    var zeilen = [1, 2].map(function (nr) {
      return '<tr class="gruppe-kopf"><th colspan="4">' + KLASSEN[nr].titel + '</th></tr>' +
        THEMEN.filter(function (t) { return klasseVon(t) === nr && !t.bald; }).map(function (t) {
          if (!t.varianten) return zeile(t);
          // Malreihen: nur geübte Reihen auflisten
          var geuebt = t.varianten.map(function (v) { return variantenThema(t, v); })
            .filter(function (vt) { return daten.fortschritt[vt.id]; });
          return geuebt.length ? geuebt.map(zeile).join('') : zeile(t);
        }).join('');
    }).join('');

    app.innerHTML =
      '<section class="eltern">' +
      '<header class="leiste"><button class="rund" data-aktion="heim" aria-label="Zurück">✕</button><h2>Elternbereich</h2><span></span></header>' +
      '<div class="block"><h3>Einstellungen</h3>' +
      '<label class="schalter"><input type="checkbox" data-einstellung="vorlesen"' + (e.vorlesen ? ' checked' : '') + '> Aufgaben vorlesen</label>' +
      '<label class="schalter"><input type="checkbox" data-einstellung="toene"' + (e.toene ? ' checked' : '') + '> Töne</label>' +
      '<label class="auswahl-zeile">Antworten eingeben:<select data-einstellung="eingabe">' +
      '<option value="auto"' + (e.eingabe === 'auto' ? ' selected' : '') + '>Automatisch (erst Knöpfe, dann Ziffern)</option>' +
      '<option value="ziffern"' + (e.eingabe === 'ziffern' ? ' selected' : '') + '>Immer Ziffernfeld</option>' +
      '<option value="auswahl"' + (e.eingabe === 'auswahl' ? ' selected' : '') + '>Immer Auswahl-Knöpfe</option>' +
      '</select></label>' +
      ('speechSynthesis' in window ? '<button class="klein-knopf" data-aktion="test-stimme">Stimme testen</button>' : '<p class="hinweis">Dieser Browser kann nicht vorlesen.</p>') +
      '</div>' +
      '<div class="block"><h3>Fortschritt</h3>' +
      '<table><thead><tr><th>Thema</th><th>Runden</th><th>Gleich richtig</th><th>Beste</th></tr></thead><tbody>' + zeilen + '</tbody></table>' +
      '<button class="klein-knopf gefahr" data-aktion="zuruecksetzen">Fortschritt löschen</button>' +
      '</div>' +
      '<div class="block"><h3>App aufs Handy holen</h3>' +
      '<p class="erklaerung"><b>Android (Chrome):</b> Menü ⋮ → „Zum Startbildschirm hinzufügen“ bzw. „App installieren“.</p>' +
      '<p class="erklaerung"><b>iPhone (Safari):</b> Teilen-Symbol □↑ → „Zum Home-Bildschirm“.</p>' +
      '<p class="erklaerung">Danach startet Igel-Rechnen wie eine eigene App und funktioniert auch ohne Internet.</p>' +
      '</div>' +
      '<p class="fuss">Igel-Rechnen ' + VERSION + ' · speichert alles nur auf diesem Gerät. Keine Anmeldung, keine Werbung.</p>' +
      '</section>';
  }

  // ---------- Bedienung ----------

  app.addEventListener('click', function (ev) {
    var knopf = ev.target.closest('button');
    if (!knopf) return;
    var d = knopf.dataset;

    if (d.klasse) { neueSeite({ klasse: Number(d.klasse) }); return zeigeKlasse(Number(d.klasse)); }
    if (d.thema) return waehleThema(d.thema, d.variante);
    if (d.ziffer !== undefined) return tippe(d.ziffer);
    if (d.antwort !== undefined) return pruefe(d.antwort);

    switch (d.aktion) {
      case 'loeschen':
        loesche();
        break;
      case 'pruefen':
        if (runde && runde.eingabe !== '') pruefe(Number(runde.eingabe));
        break;
      case 'weiter':
        if (runde) weiter();
        break;
      case 'vorlesen':
        if (runde) sprich(aktuelleLuecke().sprich, true);
        break;
      case 'nochmal':
        starteRunde(runde.thema, true);
        break;
      case 'heim':
        var klasse = runde && klasseVon(runde.thema);
        zurueck(function () { if (klasse) { runde = null; zeigeKlasse(klasse); } else zeigeHauptseite(); });
        break;
      case 'haupt':
        zurueck(zeigeHauptseite);
        break;
      case 'eltern':
        zeigeElternTor();
        break;
      case 'test-stimme':
        sprich('Hallo, ich bin der Igel. Wie viel ist 3 plus 4?', true);
        break;
      case 'zuruecksetzen':
        if (confirm('Wirklich den gesamten Fortschritt löschen?')) { daten.fortschritt = {}; speichern(); zeigeEltern(); }
        break;
    }
  });

  app.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var form = ev.target;
    if (Number(form.querySelector('input').value) === Number(form.dataset.summe)) zeigeEltern();
    else form.querySelector('.hinweis').hidden = false;
  });

  app.addEventListener('change', function (ev) {
    var name = ev.target.dataset.einstellung;
    if (!name) return;
    daten.einstellungen[name] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    speichern();
  });

  // Tastatur (praktisch am Computer)
  document.addEventListener('keydown', function (ev) {
    if (!runde || !runde.aufgabe || runde.gesperrt || ev.target.tagName === 'INPUT') return;
    if (runde.aufgabe.zeichen) {
      if (['<', '>', '='].indexOf(ev.key) >= 0) pruefe(ev.key);
      return;
    }
    if (aktuelleLuecke().optionen) return; // nur mit den Knöpfen
    if (/^[0-9]$/.test(ev.key)) tippe(ev.key);
    else if (ev.key === 'Backspace') loesche();
    else if (ev.key === 'Enter' && runde.eingabe !== '') pruefe(Number(runde.eingabe));
  });

  // Offline-Nutzung
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () { });
  }

  zeigeSeite(history.state);
})();
