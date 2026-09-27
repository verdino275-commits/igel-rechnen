# Igel-Rechnen 🦔

Eine kleine Rechen-Übungs-App für die 1. Klasse (ab 6 Jahren), gemacht fürs Smartphone.

**▶ Direkt spielen: https://verdino275-commits.github.io/igel-rechnen/**

- Übungen im Zahlenraum bis 10: Zahlenraupe, Plus, Minus, Vergleichen (<, >, =), Tauschaufgaben,
  Zahlenhaus, Zahlenmauer, Rechenblume, Umkehraufgaben
- Übungen im Zahlenraum bis 20: Aufgaben mit 10, Ähnliche Aufgaben, Verdoppeln/Halbieren,
  Erst bis 10 (Zehnerübergang), Erst verdoppeln, Plus statt Minus, Mit 9 und 11, Gemischt
- Große Tasten, eigenes Ziffernfeld, Punktestreifen als Hilfe
- Aufgaben werden auf Wunsch vorgelesen (Sprachausgabe des Geräts)
- Jede Runde hat 5–10 zufällige Aufgaben, am Ende gibt es bis zu 3 Sterne
- Elternbereich mit Einstellungen und Fortschritt
- Keine Anmeldung, keine Werbung, kein Tracking – der Fortschritt bleibt auf dem Gerät
- Funktioniert nach dem ersten Öffnen auch offline und lässt sich zum Startbildschirm hinzufügen

## Lokal ausprobieren

```bash
python -m http.server 8765
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
| `js/app.js` | Bildschirme, Eingabe, Vorlesen, Speichern |
| `sw.js` | Offline-Speicher |

Neue Übungen kommen in `js/aufgaben.js` in die Liste `THEMEN`.
