/*!
 * calling-card.js: cut-out lettering with 5 preset looks
 *
 * Usage:
 *   <script src="calling-card.js"></script>
 *   <h1 class="calling-card-1">Mizu</h1>
 *   <h2 class="calling-card-3">Take your time</h2>
 *
 * Each class (calling-card-1 to calling-card-5) has its own array of 20 letter styles.
 * Letter 1 uses entry 1, letter 2 uses entry 2, and so on. Letter 21 loops back to entry 1.
 * Spaces don't use up an entry.
 *
 * Every entry is: [ font, paper, rotation(deg), size(em), edge ]
 *   font     index into FONTS
 *   paper    index into PAPERS
 *   rotation tilt in degrees (negative = anticlockwise)
 *   size     font-size multiplier (1 = normal)
 *   edge     index into EDGES (the cut-out shape)
 */
(function () {
  'use strict';

  var FONTS = [
    { family: "'Anton', sans-serif", weight: 400 },               // 0
    { family: "'Bebas Neue', sans-serif", weight: 400 },          // 1
    { family: "'Abril Fatface', serif", weight: 400 },            // 2
    { family: "'Playfair Display', serif", weight: 900 },         // 3
    { family: "'Special Elite', monospace", weight: 400 },        // 4
    { family: "'Rubik Mono One', sans-serif", weight: 400 },      // 5
    { family: "'Permanent Marker', cursive", weight: 400 },       // 6
    { family: "'Old Standard TT', serif", weight: 700 },          // 7
    { family: "'Bangers', cursive", weight: 400 },                // 8
    { family: "'Shrikhand', cursive", weight: 400 }               // 9
  ];

  var PAPERS = [
    { bg: '#ffffff', fg: '#000000' },   // 0 white, black ink
    { bg: '#000000', fg: '#ffffff' },   // 1 black, white ink
    { bg: '#e5001c', fg: '#ffffff' },   // 2 red, white ink
    { bg: '#ffffff', fg: '#e5001c' },   // 3 white, red ink
    { bg: '#000000', fg: '#e5001c' },   // 4 black, red ink
    { bg: '#d8d8d8', fg: '#000000' },   // 5 grey, black ink
    { bg: '#f1e8d0', fg: '#1a1a1a' }    // 6 newsprint, dark ink
  ];

  var EDGES = [
    'polygon(2% 4%,48% 0,97% 3%,100% 52%,96% 98%,52% 100%,3% 95%,0 48%)',
    'polygon(0 6%,55% 0,100% 5%,96% 50%,100% 94%,45% 100%,4% 97%,2% 45%)',
    'polygon(4% 0,100% 2%,98% 55%,100% 100%,50% 96%,0 100%,3% 50%)',
    'polygon(0 0,52% 4%,100% 0,97% 48%,100% 100%,48% 97%,0 100%,4% 52%)',
    'polygon(3% 3%,100% 0,95% 46%,99% 97%,6% 100%,0 55%)',
    'polygon(0 4%,46% 2%,100% 0,98% 60%,94% 100%,40% 97%,2% 100%,5% 50%)'
  ];

  // ---- EDIT THESE: one array of 20 entries per class --------------------
  // [font, paper, rotation, size, edge]
  var CARDS = {

    // 1: bold mix of everything, red/black/white
    1: [
      [0,1,-5,1.1,0],[2,0,4,1,1],[8,2,-3,1.2,2],[3,3,6,.95,3],[5,1,-7,1,4],
      [1,0,3,1.15,5],[6,4,-4,1.05,0],[7,6,5,.9,1],[0,2,-2,1.2,2],[9,0,7,1,3],
      [4,5,-6,1.1,4],[2,1,2,1,5],[8,3,-5,1.15,0],[3,0,4,.9,1],[5,2,-3,1,2],
      [1,4,6,1.2,3],[0,6,-7,1,4],[7,1,3,1.1,5],[9,3,-4,.95,0],[6,0,5,1.05,1]
    ],

    // 2: black and white, serifs and condensed caps, cleaner
    2: [
      [3,0,-3,1.1,0],[7,1,3,1,1],[2,0,-2,1.2,2],[3,1,5,.95,3],[7,0,-4,1.1,4],
      [2,1,2,1,5],[3,5,-5,1.15,0],[1,0,4,1,1],[7,1,-3,1.05,2],[2,0,6,.9,3],
      [3,1,-2,1.2,4],[1,5,3,1,5],[7,0,-6,1.1,0],[2,1,4,1,1],[3,0,-3,.95,2],
      [1,1,5,1.15,3],[2,5,-4,1,4],[7,0,2,1.1,5],[3,1,-5,1,0],[1,5,3,1.05,1]
    ],

    // 3: red-heavy, marker and comic fonts, chaotic
    3: [
      [6,2,-6,1.2,0],[8,0,5,1,1],[9,1,-4,1.1,2],[6,3,7,.95,3],[0,2,-3,1.15,4],
      [8,4,4,1,5],[4,0,-7,1.1,0],[9,2,3,1.2,1],[6,5,-5,1,2],[5,1,6,.9,3],
      [8,2,-2,1.15,4],[0,3,5,1,5],[9,0,-6,1.1,0],[4,2,2,1,1],[6,1,-4,1.2,2],
      [8,6,7,.95,3],[5,2,-3,1.1,4],[9,4,4,1,5],[0,2,-5,1.15,0],[4,0,3,1,1]
    ],

    // 4: typewriter and newsprint, subtle tilt
    4: [
      [4,6,-2,1,0],[7,0,3,1.05,1],[3,5,-3,1,2],[4,0,2,1.1,3],[1,6,-4,1,4],
      [7,5,4,1.1,5],[2,0,-2,.95,0],[4,6,3,1,1],[3,0,-5,1.15,2],[1,5,2,1,3],
      [7,6,-3,1.05,4],[4,0,5,1,5],[2,5,-2,1.1,0],[3,6,4,.95,1],[1,0,-4,1,2],
      [7,5,3,1.15,3],[4,6,-3,1,4],[2,0,2,1.05,5],[3,5,-5,1,0],[1,0,4,1.1,1]
    ],

    // 5: loud display and mono, red/black inverted
    5: [
      [5,4,-4,1.2,0],[0,3,5,1,1],[8,1,-6,1.1,2],[2,2,3,1,3],[5,0,-3,1.15,4],
      [1,4,6,1,5],[9,2,-5,1.2,0],[0,1,4,.95,1],[3,3,-2,1.1,2],[8,0,7,1,3],
      [5,2,-4,1.15,4],[6,4,3,1,5],[0,3,-6,1.1,0],[2,1,5,1,1],[9,0,-3,1.2,2],
      [4,2,4,1,3],[8,4,-5,1.1,4],[5,3,2,1.15,5],[1,1,-4,1,0],[7,2,6,1.05,1]
    ]
  };
  // -----------------------------------------------------------------------

  var FONT_QUERY = ['Anton', 'Bebas+Neue', 'Abril+Fatface', 'Playfair+Display:wght@900',
    'Special+Elite', 'Rubik+Mono+One', 'Permanent+Marker', 'Old+Standard+TT:wght@700',
    'Bangers', 'Shrikhand'];

  function setup() {
    if (document.getElementById('cc-css')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + FONT_QUERY.join('&family=') + '&display=swap';
    document.head.appendChild(link);

    var s = document.createElement('style');
    s.id = 'cc-css';
    s.textContent =
      '.cc-wrap{display:inline-flex;flex-wrap:wrap;align-items:center;gap:.06em .08em;line-height:1;' +
      'filter:drop-shadow(.04em .06em 0 rgba(0,0,0,.5))}' +
      '.cc-l{display:inline-block;line-height:1.05;padding:.05em .14em;white-space:pre}' +
      '.cc-gap{display:inline-block;width:.45em}';
    document.head.appendChild(s);
  }

  function build(el, n, text) {
    var seq = CARDS[n];
    el.textContent = '';
    el.classList.add('cc-wrap');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', text);

    var i = 0;
    Array.from(text).forEach(function (ch) {
      var span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      if (/\s/.test(ch)) {
        span.className = 'cc-gap';
        el.appendChild(span);
        return;
      }
      var e = seq[i % seq.length];
      i++;
      var font = FONTS[e[0]], paper = PAPERS[e[1]];
      span.className = 'cc-l';
      span.textContent = ch;
      span.style.fontFamily = font.family;
      span.style.fontWeight = font.weight;
      span.style.background = paper.bg;
      span.style.color = paper.fg;
      span.style.fontSize = e[3] + 'em';
      span.style.transform = 'rotate(' + e[2] + 'deg)';
      span.style.clipPath = EDGES[e[4]];
      el.appendChild(span);
    });
  }

  function apply(el) {
    var m = /(?:^|\s)calling-card-([1-5])(?:\s|$)/.exec(el.className);
    if (!m) return;
    setup();
    if (!el.dataset.ccText) el.dataset.ccText = el.textContent.trim();
    build(el, m[1], el.dataset.ccText);
  }

  function init() {
    document.querySelectorAll('[class*="calling-card-"]').forEach(apply);
  }

  window.CallingCard = { apply: apply, cards: CARDS };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();