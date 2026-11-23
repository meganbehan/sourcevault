const STORE = 'sourcevault-v1';
const state = { sources: [], notes: [], editingId: null };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

const demoSources = [
  { id: 'demo-case', title: 'Miller v. Harbor Holdings', type: 'Case', author: 'Fictional Court of Appeals', year: '2025', citation: 'Miller v. Harbor Holdings, 122 Fict. App. 410 (2025).', tags: ['fiduciary duty', 'disclosure'], text: 'The court considered whether a controlling member owed disclosure obligations to minority investors before approving a related-party transaction. A fiduciary duty requires material information to be disclosed when minority investors must decide whether to consent. The record showed that the omitted valuation information was central to the investors\' decision. The court held that private ordering may define governance procedures, but it cannot eliminate the baseline obligation of good faith.', notes: 'Useful for the relationship between disclosure and fiduciary duty.', excerpts: [{ id: 'excerpt-1', text: 'A fiduciary duty requires material information to be disclosed when minority investors must decide whether to consent.', pdfPage: '8', printedPage: '418', note: 'Strong disclosure passage.' }] },
  { id: 'demo-article', title: 'Private Ordering in Small Business Deals', type: 'Law review article', author: 'Avery Chen', year: '2026', citation: 'Avery Chen, Private Ordering in Small Business Deals, 18 Example L. Rev. 201 (2026).', tags: ['private ordering', 'governance'], text: 'Private ordering permits sophisticated parties to tailor governance rights to a venture\'s needs. Contractual flexibility, however, operates against a background of mandatory rules and good-faith obligations. Disclosure provisions are particularly valuable when investors lack equal access to information. A well-designed operating agreement can specify timing, recipients, and remedies for disclosures without excusing deliberate concealment.', notes: 'Helpful background for the thesis section on contractual tailoring.', excerpts: [{ id: 'excerpt-2', text: 'Disclosure provisions are particularly valuable when investors lack equal access to information.', pdfPage: '13', printedPage: '214', note: 'Connects information asymmetry to disclosure.' }] },
  { id: 'demo-reading', title: 'Course Reading: Contractual Governance', type: 'Other legal or academic source', author: 'Professor Rivera', year: '2026', citation: 'Draft citation—verify before submission.', tags: ['good faith', 'governance'], text: 'Governance agreements allocate decision-making authority and information rights among parties. Good faith is not a substitute for express contractual terms, but it can affect the exercise of discretion where the agreement grants one party unilateral control. Parties drafting disclosure obligations should identify the information to be delivered and the consequences of noncompliance.', notes: 'Course reading; no formal citation entered yet.', excerpts: [] }
];

function persist() { localStorage.setItem(STORE, JSON.stringify({ sources: state.sources, notes: state.notes })); }
function restore() { try { const saved = JSON.parse(localStorage.getItem(STORE)); if (saved) { state.sources = saved.sources || []; state.notes = saved.notes || []; } } catch { /* Start clean if local storage is unavailable. */ } }
function id() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function tags(value) { return Array.isArray(value) ? value : value.split(',').map((tag) => tag.trim()).filter(Boolean); }

function renderSources() {
  $('#sourceCount').textContent = state.sources.length;
  const grid = $('#sourceGrid'); grid.innerHTML = '';
  $('#emptyVault').classList.toggle('hidden', state.sources.length > 0);
  state.sources.forEach((source) => {
    const card = $('#sourceTemplate').content.cloneNode(true);
    card.querySelector('.type-pill').textContent = source.type;
    card.querySelector('.source-title').textContent = source.title;
    card.querySelector('.source-meta').textContent = [source.author, source.year].filter(Boolean).join(' · ') || 'Details need review';
    card.querySelector('.source-citation').textContent = source.citation || 'Citation details not yet confirmed.';
    card.querySelector('.tag-list').innerHTML = (source.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    card.querySelector('.edit-source').addEventListener('click', () => openSource(source.id));
    card.querySelector('.view-source').addEventListener('click', () => openSource(source.id));
    card.querySelector('.add-excerpt').addEventListener('click', () => openExcerpt(source.id));
    grid.appendChild(card);
  });
}

function renderNotes() {
  const list = $('#notesList'); list.innerHTML = '';
  if (!state.notes.length) { list.innerHTML = '<div class="empty-state"><h3>No saved findings yet.</h3><p>Search the vault and save a passage when you find something useful.</p></div>'; return; }
  state.notes.forEach((note) => { const article = document.createElement('article'); article.className = 'note-card'; article.innerHTML = `<strong>${escapeHtml(note.sourceTitle)}</strong><p>“${escapeHtml(note.text)}”</p><small>${escapeHtml(note.location || 'Location unavailable')} · ${escapeHtml(note.citation || 'Citation details not yet confirmed.')}</small>`; list.appendChild(article); });
}

function setView(view) {
  ['vault', 'notes', 'about'].forEach((name) => $(`#${name}View`).classList.toggle('hidden', name !== view));
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  if (view === 'notes') renderNotes();
}

function openSource(sourceId = null) {
  state.editingId = sourceId;
  const source = state.sources.find((item) => item.id === sourceId);
  const form = $('#sourceForm'); form.reset();
  $('#dialogTitle').textContent = source ? 'Edit source' : 'New source';
  $('#deleteSource').classList.toggle('hidden', !source);
  if (source) Object.entries(source).forEach(([key, value]) => { const field = form.elements[key]; if (field && key !== 'tags') field.value = value || ''; });
  if (source) form.elements.tags.value = (source.tags || []).join(', ');
  $('#fileStatus').textContent = 'Or paste source text below. Scanned PDFs are not supported.';
  $('#sourceDialog').showModal();
}

function openExcerpt(sourceId) { const form = $('#excerptForm'); form.reset(); form.elements.sourceId.value = sourceId; $('#excerptDialog').showModal(); }

function citationFor(source, page) {
  const base = source.citation?.trim();
  if (!base || base === 'Draft citation—verify before submission.') return 'Citation details not yet confirmed.';
  if (!page) return `${base} Draft citation—verify before submission.`;
  const period = base.endsWith('.') ? base.slice(0, -1) : base;
  const parenthetical = period.lastIndexOf(' (');
  return parenthetical > -1 ? `${period.slice(0, parenthetical)}, ${page}${period.slice(parenthetical)}. Draft citation—verify before submission.` : `${period}, ${page}. Draft citation—verify before submission.`;
}

function queryTerms(query) {
  const stop = new Set(['which', 'sources', 'source', 'discuss', 'does', 'any', 'the', 'and', 'with', 'what', 'about', 'that', 'this', 'are', 'for', 'from', 'include', 'cite', 'to', 'of', 'in', 'or', 'my', 'vault']);
  const related = { disclosure: ['information', 'concealment', 'transparent'], fiduciary: ['duty', 'loyalty', 'good faith'], governance: ['operating agreement', 'control', 'decision-making'], ordering: ['contractual', 'agreement', 'tailor'], good: ['faith', 'discretion'] };
  const raw = query.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  return [...new Set(raw.filter((term) => !stop.has(term)).flatMap((term) => [term, ...(related[term] || [])]))];
}

function sentenceMatches(text, terms) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).filter((sentence) => terms.some((term) => sentence.toLowerCase().includes(term))).slice(0, 3);
}

function searchVault(query) {
  const terms = queryTerms(query);
  const results = [];
  state.sources.forEach((source) => {
    const searchable = `${source.title} ${(source.tags || []).join(' ')} ${source.notes || ''} ${source.text || ''}`;
    const matches = sentenceMatches(source.text || '', terms);
    const metaMatch = terms.some((term) => `${source.title} ${(source.tags || []).join(' ')} ${source.notes || ''}`.toLowerCase().includes(term));
    if (matches.length || metaMatch) {
      const excerpt = matches.join(' ') || source.text.slice(0, 320);
      const direct = terms.some((term) => (source.text || '').toLowerCase().includes(term));
      const linkedExcerpt = (source.excerpts || []).find((item) => excerpt.includes(item.text.slice(0, 25))) || (source.excerpts || [])[0];
      results.push({ source, excerpt, direct, linkedExcerpt });
    }
  });
  return results;
}

function renderResults(query) {
  const results = searchVault(query); const section = $('#resultsSection'); const list = $('#resultsList');
  section.classList.remove('hidden'); $('#resultsTitle').textContent = results.length ? `${results.length} relevant passage${results.length === 1 ? '' : 's'} found` : 'No relevant passage found'; list.innerHTML = '';
  if (!results.length) { list.innerHTML = '<article class="result-card"><p>No relevant passage was found in the current vault. Try a different term, add a tag, or review your saved source text.</p></article>'; return; }
  results.forEach((result) => {
    const card = $('#resultTemplate').content.cloneNode(true); const page = result.linkedExcerpt?.printedPage; const pdf = result.linkedExcerpt?.pdfPage;
    card.querySelector('.result-label').textContent = result.direct ? 'Direct match in saved source' : 'Related discussion in saved source';
    card.querySelector('blockquote').textContent = `“${result.excerpt}”`;
    card.querySelector('.result-title').textContent = result.source.title;
    card.querySelector('.result-location').textContent = page ? `Printed/reporter p. ${page}` : (pdf ? `PDF p. ${pdf}` : 'Location not yet saved');
    card.querySelector('.result-citation').textContent = citationFor(result.source, page);
    card.querySelector('.save-result').addEventListener('click', () => { state.notes.unshift({ sourceTitle: result.source.title, text: result.excerpt, location: page ? `Printed/reporter p. ${page}` : (pdf ? `PDF p. ${pdf}` : ''), citation: citationFor(result.source, page) }); persist(); alert('Saved to Research notes.'); });
    list.appendChild(card);
  });
}

async function readFile(file) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    $('#fileStatus').textContent = 'Reading text from PDF…';
    try {
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 35); pageNumber += 1) { const page = await pdf.getPage(pageNumber); const content = await page.getTextContent(); pages.push(`[PDF page ${pageNumber}]\n${content.items.map((item) => item.str).join(' ')}`); }
      const text = pages.join('\n\n'); if (!text.trim()) throw new Error('No readable text');
      $('#sourceForm').elements.text.value = text; $('#fileStatus').textContent = `Extracted text from ${Math.min(pdf.numPages, 35)} page(s). Review it before saving.`;
    } catch { $('#fileStatus').textContent = 'This PDF could not be read. Paste source text or use a text-readable PDF.'; }
  } else { $('#sourceForm').elements.text.value = await file.text(); $('#fileStatus').textContent = `Loaded ${file.name}.`; }
}

function bindEvents() {
  $('#openAdd').addEventListener('click', () => openSource()); document.querySelectorAll('.open-add').forEach((button) => button.addEventListener('click', () => openSource()));
  $('#closeDialog').addEventListener('click', () => $('#sourceDialog').close()); $('#cancelDialog').addEventListener('click', () => $('#sourceDialog').close());
  $('#closeExcerpt').addEventListener('click', () => $('#excerptDialog').close()); $('#cancelExcerpt').addEventListener('click', () => $('#excerptDialog').close());
  $('#fileInput').addEventListener('change', (event) => event.target.files[0] && readFile(event.target.files[0]));
  $('#sourceForm').addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const prior = state.sources.find((item) => item.id === state.editingId); const source = { id: prior?.id || id(), title: form.get('title').trim(), type: form.get('type'), citation: form.get('citation').trim(), author: form.get('author').trim(), year: form.get('year').trim(), tags: tags(form.get('tags')), text: form.get('text').trim(), notes: form.get('notes').trim(), excerpts: prior?.excerpts || [] }; if (prior) state.sources = state.sources.map((item) => item.id === prior.id ? source : item); else state.sources.unshift(source); persist(); renderSources(); $('#sourceDialog').close(); });
  $('#deleteSource').addEventListener('click', () => { if (state.editingId && confirm('Delete this source and its saved excerpts?')) { state.sources = state.sources.filter((item) => item.id !== state.editingId); persist(); renderSources(); $('#sourceDialog').close(); } });
  $('#excerptForm').addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); state.sources = state.sources.map((source) => source.id === form.get('sourceId') ? { ...source, excerpts: [...(source.excerpts || []), { id: id(), text: form.get('excerpt').trim(), pdfPage: form.get('pdfPage').trim(), printedPage: form.get('printedPage').trim(), note: form.get('note').trim() }] } : source); persist(); renderSources(); $('#excerptDialog').close(); });
  $('#searchForm').addEventListener('submit', (event) => { event.preventDefault(); const query = $('#vaultQuery').value.trim(); if (query) renderResults(query); }); $('#clearSearch').addEventListener('click', () => { $('#resultsSection').classList.add('hidden'); $('#vaultQuery').value = ''; });
  $('#loadDemo').addEventListener('click', () => { if (!state.sources.length || confirm('Add fictional demo sources to the vault?')) { const existing = new Set(state.sources.map((source) => source.id)); state.sources.push(...demoSources.filter((source) => !existing.has(source.id))); persist(); renderSources(); } });
  $('#projectName').addEventListener('click', () => { const name = prompt('Project name:', $('#projectName').textContent); if (name?.trim()) $('#projectName').textContent = name.trim(); });
  document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
}

restore(); bindEvents(); renderSources();
