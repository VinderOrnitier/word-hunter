/* =========================================================
   icons.js -- Pixelarticons inline-SVG bake
   ---------------------------------------------------------
   Replaces the iconify-icon web component, which races and
   silently fails to render past ~20 instances on a page.

   How it works
   ------------
   1. On load, ONE HTTP request to api.iconify.design fetches
      the JSON bodies for the 19 icon slugs the Pokedex theme
      uses.
   2. Once the data is in, every <iconify-icon icon="pixelarticons:X">
      in the DOM gets replaced with a real inline <svg>.
   3. The svg uses width: 1em / height: 1em + currentColor so
      it behaves exactly like the web component did: parent
      font-size + color drive it.
   4. After dynamic DOM mutations, call window.PDX_RESCAN_ICONS()
      to swap any newly-inserted <iconify-icon> placeholders.

   If the fetch fails, icons remain as <iconify-icon> elements
   (empty 0x0 boxes). A console warning prints once.
   ========================================================= */

(function () {
  var SLUGS = [
    'info-box', 'play', 'chart', 'sliders', 'trash',
    'external-link', 'search', 'minus', 'plus', 'reload',
    'edit', 'shuffle', 'chevron-down', 'target', 'clock',
    'check', 'close', 'bookmark', 'star', 'trophy',
  ];

  var url = 'https://api.iconify.design/pixelarticons.json?icons=' + SLUGS.join(',');
  var iconsData = null;
  var viewW = 24;
  var viewH = 24;
  var pendingRescan = false;

  function svgFor(slug) {
    if (!iconsData) return '';
    var entry = iconsData[slug];
    if (!entry || !entry.body) return '';
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" ' +
      'viewBox="0 0 ' + viewW + ' ' + viewH + '" ' +
      'fill="currentColor" ' +
      'style="width:1em;height:1em;display:inline-block;vertical-align:-0.125em;line-height:1;flex-shrink:0;">' +
      entry.body +
      '</svg>'
    );
  }

  function rescan() {
    if (!iconsData) {
      // Data not in yet; mark so we re-run when it arrives.
      pendingRescan = true;
      return;
    }
    var nodes = document.querySelectorAll('iconify-icon[icon^="pixelarticons:"]');
    nodes.forEach(function (el) {
      var name = el.getAttribute('icon').replace('pixelarticons:', '');
      var svg = svgFor(name);
      if (!svg) return;
      el.outerHTML = svg;
    });
  }

  // Public hooks for HTML pages that insert <iconify-icon> after load.
  window.PDX_RESCAN_ICONS = rescan;
  window.PDX_ICON = svgFor;

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      iconsData = data.icons || {};
      viewW = data.width || 24;
      viewH = data.height || 24;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', rescan);
      } else {
        rescan();
      }

      // Watch for late insertions for the first 5 seconds after load.
      // Covers pages that generate icons from data after their inline
      // script runs but without explicitly calling rescan.
      var obs = new MutationObserver(function (records) {
        var hasIconInsert = records.some(function (r) {
          return [].some.call(r.addedNodes, function (n) {
            return n.nodeType === 1 && (
              n.tagName === 'ICONIFY-ICON' ||
              (n.querySelector && n.querySelector('iconify-icon[icon^="pixelarticons:"]'))
            );
          });
        });
        if (hasIconInsert) rescan();
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 5000);
    })
    .catch(function (err) {
      console.warn('[icons.js] failed to fetch Pixelarticons:', err);
    });
})();
