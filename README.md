# SourceVault

SourceVault is a static, browser-based prototype for a source-grounded legal research vault. Users can upload text-readable PDFs or paste source text, organize source cards, add excerpts, and search only the materials stored in the vault.

## Run locally

Open `index.html` in a modern browser. For PDF text extraction, use an internet connection so the app can load PDF.js from its public CDN. Pasted text and the fictional demo sources work without that feature.

## Main functions

- Stores sources, notes, and excerpts in the browser's local storage.
- Supports text-readable PDF, `.txt`, and `.md` files, or pasted source text.
- Keeps PDF pages separate from confirmed printed/reporter pages.
- Searches the saved vault only and displays the retrieved passage with its source.
- Produces user-editable draft citations and only presents a proposed pincite when a printed/reporter page has been entered.

## Limitations

This is a course prototype. It does not browse for legal sources, use OCR, provide legal advice, or verify Bluebook compliance. Use made-up or public materials for demonstrations.
