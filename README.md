# WinFlags – Proper Flag Emoji Support for Windows Chrome

**Tired of seeing boring “JP” instead of 🇯🇵 on Windows? So were we.**

WinFlags is a lightweight Chrome extension that automatically replaces flag emoji (which show as 2-letter codes on Windows) with real flag icons. Smooth, inline, accessible, and beautifully rendered – just like they should be.

---

## Features

- Replaces broken flag emoji (like 🇺🇸) with real flag images
- Adds hover tooltips with full country names (e.g. "United States")
- Tracks how many flags have been replaced (badge + lifetime total)
- Works on all websites, including dynamic content (e.g. React, infinite scroll)
- No dependencies, no tracking, no nonsense

---

## Why Is This Needed?

On Windows, browsers like Chrome fall back to showing **regional indicator letters** instead of proper emoji flags. This is due to lack of native support in the `Segoe UI Emoji` font.

Instead of waiting on Microsoft, we fix it ourselves.

---

## Installation

1. Download this repo (click Code > Download ZIP)
2. Visit `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked** and select the folder

Done

---

## How It Works

- Detects all Unicode flag emojis (composed of 2 regional indicators)
- Replaces them with `<img>` tags pointing to [flagcdn.com](https://flagcdn.com/)
- Adds `alt` and `title` tags using `Intl.DisplayNames` for proper accessibility
- Works inline – no layout breaks or weird spacing
- Uses a `MutationObserver` to reapply replacements on dynamic pages

---

## Stats & UI

- The badge counter on the extension icon shows how many flags were replaced on the current page
- Clicking the icon opens a popup with:
  - Lifetime total of all flags replaced
  - Install date

---

## Known Limitations

- Flags not included in [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (e.g. 🇺🇳 for United Nations) fall back to emoji
- Uses flag images hosted on [flagcdn.com](https://flagcdn.com) – you’ll need an internet connection to load them
- Only tested on Chromium-based browsers (Chrome, Edge)

---

## Privacy & Permissions

- Does **not** collect or transmit any data
- No background tracking
- Only permission used: `"<all_urls>"` to allow replacements on all websites

---

## Credits

- Flag icons via [flagcdn.com](https://flagcdn.com)
- Country name mapping via native `Intl.DisplayNames`

---

## Want to Contribute?

Pull requests welcome — feel free to:
- Add local image fallback
- Add a language selector
- Bug Microsoft to natively fix this
