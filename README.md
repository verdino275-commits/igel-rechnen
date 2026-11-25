# Igel-Rechnen 🦔

Eine kleine Rechen-Übungs-App für die 1. und 2. Klasse, gemacht fürs Smartphone.
Auf der Startseite wählt man **Igel-Rechnen 1** (1. Klasse) oder **Igel-Rechnen 2** (2. Klasse).

**▶ Direkt spielen: https://verdino275-commits.github.io/igel-rechnen/**

- Übungen im Zahlenraum bis 10: Zahlenraupe, Plus, Minus, Vergleichen (<, >, =), Tauschaufgaben,
  Zahlenhaus, Zahlenmauer, Rechenblume, Umkehraufgaben
- Übungen im Zahlenraum bis 20: Aufgaben mit 10, Ähnliche Aufgaben, Verdoppeln/Halbieren,
  Erst bis 10 (Zehnerübergang), Erst verdoppeln, Plus statt Minus, Mit 9 und 11, Gemischt
- **Igel-Rechnen 2** – Zahlen bis 100: Zehner und Einer, Hundertertafel, Zahlenstrahl, Nachbarzehner,
  Vergleichen, Zehnerzahlen
- Plus und Minus bis 100: Ähnliche Aufgaben, Über den Zehner, Erst Zehner dazu/weg – dann Einer,
  Einfache Paare, Plus statt Minus, Mit 8 und 9 Einern, Überschlagen, Gemischt
- Einmaleins: Kernaufgaben, Malreihen (einzeln wählbar), Malraupe, Tausch-, Nachbar- und Umkehraufgaben,
  Mal verdoppeln, Quadratzahlen, Rechenblume, Maltabelle
- Teilen: Aufteilen, Verteilen, Geteilt rechnen, Teilen mit Rest, Gerade und ungerade
- Große Tasten, eigenes Ziffernfeld, Punktestreifen als Hilfe
- Aufgaben werden auf Wunsch vorgelesen (Sprachausgabe des Geräts)
- Jede Runde hat 5–10 zufällige Aufgaben, am Ende gibt es bis zu 3 Sterne
- Elternbereich mit Einstellungen und Fortschritt
- Keine Anmeldung, keine Werbung, kein Tracking – der Fortschritt bleibt auf dem Gerät
- Funktioniert nach dem ersten Öffnen auch offline und lässt sich zum Startbildschirm hinzufügen

## Lokal ausprobieren

```bash
python3 -m http.server 8765
```

Dann im Browser `http://localhost:8765` öffnen.

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst |
| `css/style.css` | Aussehen |
| `js/igel.js` | Das Igel-Maskottchen (SVG) |
| `js/aufgaben.js` | Aufgaben-Generatoren und Themenliste, Zahlen bis 10 |
| `js/aufgaben-20.js` | Aufgaben-Generatoren für Zahlen bis 20 |
| `js/aufgaben-100.js` | Igel-Rechnen 2: Zahlen bis 100, Plus und Minus bis 100 |
| `js/aufgaben-mal.js` | Igel-Rechnen 2: Einmaleins und Teilen |
| `js/app.js` | Bildschirme, Eingabe, Vorlesen, Speichern |
| `sw.js` | Offline-Speicher |

Neue Übungen kommen in die Liste `THEMEN` (Klasse 1 in `js/aufgaben.js`, Klasse 2 mit `klasse: 2` in den beiden neuen Dateien).

Die Musterfotos aus den Übungsheften (`Musterbuch/`, `Igelrechnen 2/`) liegen nur lokal und werden über `.gitignore` nie hochgeladen.
