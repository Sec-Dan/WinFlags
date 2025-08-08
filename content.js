(function(){
  if (window.top !== window) return;

  const unsupportedCodes = new Set();
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  function getCountryCode(emoji) {
    const cps = [...emoji].map(c => c.codePointAt(0));
    if (cps.length !== 2) return null;
    return cps
      .map(cp => String.fromCharCode(cp - 0x1F1E6 + 65))
      .join('')
      .toLowerCase();
  }

  function replaceFlagEmojis(root = document.body) {
    let total = 0, replaced = 0;
    const els = root.querySelectorAll("*:not(script):not(style):not([data-flags-done])");
    els.forEach(el => {
      el.setAttribute('data-flags-done','1');
      el.childNodes.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        const matches = node.textContent.match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g);
        if (!matches) return;

        const frag = document.createDocumentFragment();
        let last = 0, text = node.textContent;

        matches.forEach(match => {
          const idx = text.indexOf(match, last);
          if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)));

          total++;
          const code = getCountryCode(match);

          if (!code || unsupportedCodes.has(code)) {
            frag.appendChild(document.createTextNode(match));
          } else {
            const upper = code.toUpperCase(),
                  name  = regionNames.of(upper) || upper,
                  img   = document.createElement('img');

            img.src             = `https://flagcdn.com/24x18/${code}.png`;
            img.alt             = `${name} flag`;
            img.title           = name;
            img.width           = 24;
            img.height          = 18;
            img.loading         = 'lazy';
            img.crossOrigin     = 'anonymous';
            img.style.display       = 'inline';
            img.style.verticalAlign = 'middle';
            img.style.margin        = '0 2px';

            img.onerror = () => {
              unsupportedCodes.add(code);
              img.replaceWith(document.createTextNode(match));
            };

            frag.appendChild(img);
            replaced++;
          }

          last = idx + match.length;
        });

        frag.appendChild(document.createTextNode(text.slice(last)));
        el.replaceChild(frag, node);
      });
    });

    return { total, replaced };
  }

  function safeReplace() {
    const { replaced } = replaceFlagEmojis();
    if (replaced > 0) {
      chrome.runtime.sendMessage({ type: 'flagsReplaced', replaced });
    }
  }

  function debounce(fn, wait) {
    let t = null;
    return () => {
      if (t) return;
      t = setTimeout(() => { fn(); t = null; }, wait);
    };
  }

  function init() {
    safeReplace();
    const obs = new MutationObserver(debounce(safeReplace, 500));
    obs.observe(document.body, { childList: true, subtree: true });
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function idleScan(){
        safeReplace();
        requestIdleCallback(idleScan, { timeout: 2000 });
      }, { timeout: 2000 });
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
