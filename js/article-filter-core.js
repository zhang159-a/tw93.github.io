(function(root, factory) {
  'use strict';

  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.Hr00ArticleFilterCore = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function readState(search, availableCategories, availableTags) {
    const params = new URLSearchParams(search);
    const requestedCategory = params.get('category') || '';
    const requestedTags = params.getAll('tags').filter(Boolean);
    const category = availableCategories.includes(requestedCategory)
      ? requestedCategory
      : '';
    const tags = requestedTags.filter(function(tag, index) {
      return availableTags.includes(tag) && requestedTags.indexOf(tag) === index;
    });

    return {category, tags};
  }

  function urlWithState(href, state) {
    const url = new URL(href);

    if (state.category) {
      url.searchParams.set('category', state.category);
    } else {
      url.searchParams.delete('category');
    }

    url.searchParams.delete('tags');
    state.tags.forEach(function(tag) {
      url.searchParams.append('tags', tag);
    });

    return url.toString();
  }

  function parseItemTags(value) {
    try {
      const tags = JSON.parse(value || '[]');
      return Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string') : [];
    } catch (_error) {
      return [];
    }
  }

  return {
    parseItemTags,
    readState,
    urlWithState
  };
});
