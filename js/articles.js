(function() {
  'use strict';

  var root = document.querySelector('[data-articles-root]');
  if (!root) return;

  var items = Array.prototype.slice.call(root.querySelectorAll('[data-article-item]'));
  var categoryButtons = Array.prototype.slice.call(root.querySelectorAll('[data-category-filter]'));
  var tagButtons = Array.prototype.slice.call(root.querySelectorAll('[data-tag-filter]'));
  var clearButtons = Array.prototype.slice.call(root.querySelectorAll('[data-clear-filters]'));
  var resultsCount = root.querySelector('[data-results-count]');
  var activeFilters = root.querySelector('[data-active-filters]');
  var emptyState = root.querySelector('[data-empty-state]');
  var selectedCategory = '';
  var selectedTags = [];

  function availableCategories() {
    return categoryButtons.map(function(button) {
      return button.getAttribute('data-category-filter');
    });
  }

  function availableTags() {
    return tagButtons.map(function(button) {
      return button.getAttribute('data-tag-filter');
    });
  }

  function readUrlState() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get('category') || '';
    var requestedTags = (params.get('tags') || '').split(',').filter(Boolean);
    var knownTags = availableTags();

    selectedCategory = availableCategories().indexOf(category) >= 0 ? category : '';
    selectedTags = requestedTags.filter(function(tag, index) {
      return knownTags.indexOf(tag) >= 0 && requestedTags.indexOf(tag) === index;
    });
  }

  function writeUrlState() {
    var url = new URL(window.location.href);
    if (selectedCategory) {
      url.searchParams.set('category', selectedCategory);
    } else {
      url.searchParams.delete('category');
    }
    if (selectedTags.length > 0) {
      url.searchParams.set('tags', selectedTags.join(','));
    } else {
      url.searchParams.delete('tags');
    }
    window.history.pushState({}, '', url);
  }

  function render() {
    var visibleCount = 0;

    items.forEach(function(item) {
      var matchesCategory = !selectedCategory ||
        item.getAttribute('data-category') === selectedCategory;
      var itemTags = (item.getAttribute('data-tags') || '').split('|').filter(Boolean);
      var matchesTags = selectedTags.length === 0 || selectedTags.some(function(tag) {
        return itemTags.indexOf(tag) >= 0;
      });
      var isVisible = matchesCategory && matchesTags;

      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    categoryButtons.forEach(function(button) {
      var isActive = button.getAttribute('data-category-filter') === selectedCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    tagButtons.forEach(function(button) {
      var isActive = selectedTags.indexOf(button.getAttribute('data-tag-filter')) >= 0;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (resultsCount) resultsCount.textContent = String(visibleCount);
    if (activeFilters) {
      var labels = [];
      if (selectedCategory) labels.push(selectedCategory);
      if (selectedTags.length > 0) labels.push(selectedTags.join(' / '));
      activeFilters.textContent = labels.length > 0 ? labels.join(' · ') : '全部文章';
    }
    if (emptyState) emptyState.hidden = visibleCount !== 0;
    clearButtons.forEach(function(button) {
      button.hidden = !selectedCategory && selectedTags.length === 0;
    });
  }

  categoryButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      selectedCategory = button.getAttribute('data-category-filter');
      writeUrlState();
      render();
    });
  });

  tagButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var tag = button.getAttribute('data-tag-filter');
      var index = selectedTags.indexOf(tag);

      if (index >= 0) {
        selectedTags.splice(index, 1);
      } else {
        selectedTags.push(tag);
      }

      writeUrlState();
      render();
    });
  });

  clearButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      selectedCategory = '';
      selectedTags = [];
      writeUrlState();
      render();
    });
  });

  window.addEventListener('popstate', function() {
    readUrlState();
    render();
  });

  readUrlState();
  render();
})();
