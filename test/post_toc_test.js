global.window = {};
global.document = {
  addEventListener() {}
};

const {
  buildPostTocHierarchy,
  getPostReadProgress,
  shouldShowPostTocTop
} = require('../js/index.js');

let tests = 0;

function test(name, fn) {
  tests += 1;
  try {
    fn();
    process.stdout.write('.');
  } catch (error) {
    process.stdout.write('F');
    error.message = `${name}: ${error.message}`;
    throw error;
  }
}

function assertEqual(expected, actual) {
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  if (expectedJson !== actualJson) {
    throw new Error(`expected ${expectedJson}, got ${actualJson}`);
  }
}

function item(level, text) {
  return {
    element: {},
    id: text.toLowerCase(),
    text,
    level
  };
}

test('preserves heading depth relative to the shallowest article heading', () => {
  const hierarchy = buildPostTocHierarchy([
    item('h1', 'Spec Coding'),
    item('h2', 'speckit-plan'),
    item('h3', 'speckit-analyze')
  ]);

  assertEqual([0, 1, 2], hierarchy.visibleItems.map(entry => entry.depth));
});

test('keeps the existing h2 and h3 hierarchy for regular posts', () => {
  const hierarchy = buildPostTocHierarchy([
    item('h2', 'Section'),
    item('h3', 'Detail')
  ]);

  assertEqual([0, 1], hierarchy.visibleItems.map(entry => entry.depth));
});

test('assigns child headings to their nearest top-level branch', () => {
  const hierarchy = buildPostTocHierarchy([
    item('h2', 'Overview'),
    item('h3', 'Context'),
    item('h2', 'Implementation'),
    item('h3', 'Details')
  ]);

  assertEqual(
    ['overview', 'overview', 'implementation', 'implementation'],
    hierarchy.visibleItems.map(entry => entry.branchId)
  );
});

test('keeps every heading available for active-branch navigation', () => {
  const headings = [item('h2', 'Overview')];

  for (let index = 0; index < 15; index += 1) {
    headings.push(item('h3', `Section ${index + 1}`));
  }

  const hierarchy = buildPostTocHierarchy(headings);

  assertEqual(16, hierarchy.visibleItems.length);
});

test('calculates and clamps reading progress', () => {
  assertEqual(0, getPostReadProgress(100, 300, 2000, 1000));
  assertEqual(50, getPostReadProgress(800, 300, 2000, 1000));
  assertEqual(100, getPostReadProgress(1400, 300, 2000, 1000));
});

test('handles an article shorter than the viewport', () => {
  assertEqual(0, getPostReadProgress(100, 300, 800, 1000));
  assertEqual(100, getPostReadProgress(300, 300, 800, 1000));
});

test('shows the top button after most of one viewport', () => {
  assertEqual(false, shouldShowPostTocTop(600, 800));
  assertEqual(true, shouldShowPostTocTop(601, 800));
});

console.log(`\n${tests} tests, 0 failures`);
