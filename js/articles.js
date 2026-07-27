(function() {
  'use strict';

  var FilterCore = window.Hr00ArticleFilterCore;
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
    var state = FilterCore.readState(
      window.location.search,
      availableCategories(),
      availableTags()
    );

    selectedCategory = state.category;
    selectedTags = state.tags;
  }

  function writeUrlState() {
    var url = FilterCore.urlWithState(window.location.href, {
      category: selectedCategory,
      tags: selectedTags
    });
    window.history.pushState({}, '', url);
  }

  function render() {
    var visibleCount = 0;

    items.forEach(function(item) {
      var matchesCategory = !selectedCategory ||
        item.getAttribute('data-category') === selectedCategory;
      var itemTags = FilterCore.parseItemTags(item.getAttribute('data-tags'));
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
