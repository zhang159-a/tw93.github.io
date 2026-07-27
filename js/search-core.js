(function(root, factory) {
  'use strict';

  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.Hr00SearchCore = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function normalizeText(value) {
    return String(value || '').toLowerCase();
  }

  function normalizeList(value) {
    return Array.isArray(value) ? value.map(normalizeText) : [];
  }

  function scoreResult(post, query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return 0;

    const title = normalizeText(post.title);
    const summary = normalizeText(post.summary);
    const content = normalizeText(post.content);
    const categories = normalizeList(post.categories);
    const tags = normalizeList(post.tags);
    let score = 0;

    if (title.includes(normalizedQuery)) score += 100;
    if (categories.some(category => category.includes(normalizedQuery))) score += 80;
    if (tags.some(tag => tag.includes(normalizedQuery))) score += 80;
    if (summary.includes(normalizedQuery)) score += 40;
    if (content.includes(normalizedQuery)) score += 10;

    return score;
  }

  function rankResults(items, query) {
    return items
      .map((post, index) => ({
        post,
        index,
        score: scoreResult(post, query)
      }))
      .filter(result => result.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index);
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function highlightText(text, query) {
    if (!text) return '';

    const safeText = escapeHtml(text);
    const safeQuery = escapeHtml(query);
    if (!safeQuery) return safeText;

    const regex = new RegExp(`(${escapeRegex(safeQuery)})`, 'gi');
    return safeText.replace(regex, '<mark>$1</mark>');
  }

  function normalizeUrl(value) {
    const url = String(value || '');
    return url.startsWith('/') ? url : '#';
  }

  return {
    escapeHtml,
    highlightText,
    normalizeUrl,
    rankResults,
    scoreResult
  };
});
