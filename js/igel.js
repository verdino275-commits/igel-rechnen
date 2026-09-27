// Der Igel – eigenes Maskottchen als SVG.
// stimmung: 'normal' | 'froh' | 'denkt'
function igelSVG(stimmung) {
  stimmung = stimmung || 'normal';
  var cx = 88, cy = 100, rx = 64, ry = 44;
  var n = 15, start = 205, ende = 22;
  var punkte = [];
  for (var k = 0; k <= n; k++) {
    var t = (start - (start - ende) * k / n) * Math.PI / 180;
    punkte.push((cx + rx * Math.cos(t)).toFixed(1) + ',' + (cy - ry * Math.sin(t)).toFixed(1));
    if (k < n) {
      var tm = (start - (start - ende) * (k + 0.5) / n) * Math.PI / 180;
      punkte.push((cx + (rx + 20) * Math.cos(tm)).toFixed(1) + ',' + (cy - (ry + 20) * Math.sin(tm)).toFixed(1));
    }
  }

  var auge = stimmung === 'froh'
    ? '<path d="M145 99 q7 -8 14 0" fill="none" stroke="#3a2a20" stroke-width="4" stroke-linecap="round"/>'
    : '<circle cx="152" cy="97" r="6.5" fill="#3a2a20"/><circle cx="154.5" cy="94.5" r="2.2" fill="#fff"/>';
  var mund = stimmung === 'froh'
    ? '<path d="M160 116 q10 12 22 0" fill="#c0564b" stroke="#3a2a20" stroke-width="3" stroke-linejoin="round"/>'
    : stimmung === 'denkt'
      ? '<path d="M164 120 h14" stroke="#3a2a20" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M162 117 q9 9 18 0" fill="none" stroke="#3a2a20" stroke-width="3" stroke-linecap="round"/>';

  var stacheln = '';
  var striche = [[48, 78], [62, 66], [78, 60], [95, 60], [110, 66], [40, 96], [56, 88], [72, 80], [90, 78], [105, 84], [50, 112], [66, 104], [84, 98]];
  striche.forEach(function (p) {
    stacheln += '<path d="M' + p[0] + ' ' + p[1] + ' l-9 -9" stroke="#5b3a24" stroke-width="3" stroke-linecap="round"/>';
  });

  return '<svg class="igel igel-' + stimmung + '" viewBox="0 0 210 160" role="img" aria-label="Igel">' +
    '<ellipse cx="74" cy="143" rx="13" ry="7" fill="#6b4630"/>' +
    '<ellipse cx="124" cy="143" rx="13" ry="7" fill="#6b4630"/>' +
    '<polygon points="' + punkte.join(' ') + '" fill="#6e4528" stroke="#4d2f1b" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#8a5a3b"/>' +
    stacheln +
    '<ellipse cx="138" cy="110" rx="34" ry="30" fill="#f2d3a8"/>' +
    '<path d="M148 90 Q186 96 196 111 Q186 128 146 132 Z" fill="#f2d3a8"/>' +
    '<circle cx="130" cy="82" r="9" fill="#f2d3a8"/><circle cx="130" cy="83" r="4.5" fill="#d9a877"/>' +
    '<circle cx="196" cy="110" r="7" fill="#3a2a20"/><circle cx="198" cy="107.5" r="2" fill="#fff"/>' +
    auge +
    '<circle cx="158" cy="116" r="6" fill="#f08a7e" opacity=".55"/>' +
    mund +
    '</svg>';
}
