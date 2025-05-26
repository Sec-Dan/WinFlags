console.log("WinFlags content.js is running");

// Built-in API for converting ISO country codes to full names
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function getCountryCode(emoji) {
  const codePoints = [...emoji].map(c => c.codePointAt(0));
  if (codePoints.length !== 2) return null;
  return codePoints.map(cp => String.fromCharCode(cp - 0x1F1E6 + 65)).join('').toLowerCase();
}

function replaceFlagEmojis(root = document.body) {
  const elements = root.querySelectorAll("*:not(script):not(style)");
  let total = 0;
  let replaced = 0;

  elements.forEach(el => {
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const matches = node.textContent.match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g);
        if (matches) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;
          let text = node.textContent;

          matches.forEach(match => {
            const index = text.indexOf(match, lastIndex);
            if (index > lastIndex) {
              frag.appendChild(document.createTextNode(text.slice(lastIndex, index)));
            }

            const code = getCountryCode(match);
            total++;

            if (code) {
              const upperCode = code.toUpperCase();
              const countryName = regionNames.of(upperCode) || upperCode;

              const img = document.createElement("img");
              img.src = `https://flagcdn.com/24x18/${code}.png`;
              img.alt = `${countryName} flag`;
              img.title = countryName;
              img.style.display = "inline";
              img.style.verticalAlign = "middle";
              img.style.margin = "0 2px";
              img.style.width = "24px";
              img.style.height = "18px";
              img.loading = "lazy";
              img.crossOrigin = "anonymous";

              img.onerror = () => {
                const fallback = document.createTextNode(match);
                img.replaceWith(fallback);
              };

              frag.appendChild(img);
              replaced++;
            } else {
              frag.appendChild(document.createTextNode(match));
            }

            lastIndex = index + match.length;
          });

          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
          el.replaceChild(frag, node);
        }
      }
    }
  });

  console.log(`Found ${total} flags, replaced ${replaced}`);

  if (total > 0) {
    chrome.runtime.sendMessage({ type: "flagsReplaced", found: total, replaced });
  }
}

// Initial run
replaceFlagEmojis();

// Watch for future DOM updates
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        replaceFlagEmojis(node);
      }
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
