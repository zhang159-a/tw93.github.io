global.window = {};
global.document = {
  addEventListener() {}
};

const { buildPostTocHierarchy } = require('../js/index.js');

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
  ], 14);

  assertEqual([0, 1, 2], hierarchy.visibleItems.map(entry => entry.depth));
});

test('keeps the existing h2 and h3 hierarchy for regular posts', () => {
  const hierarchy = buildPostTocHierarchy([
    item('h2', 'Section'),
    item('h3', 'Detail')
  ], 14);

  assertEqual([0, 1], hierarchy.visibleItems.map(entry => entry.depth));
});

test('keeps only top-level headings when a nested toc exceeds the limit', () => {
  const headings = [
    item('h1', 'Overview'),
    item('h1', 'Spec Coding')
  ];

  for (let index = 0; index < 13; index += 1) {
    headings.push(item('h2', `Section ${index + 1}`));
  }

  const hierarchy = buildPostTocHierarchy(headings, 14);

  assertEqual(['Overview', 'Spec Coding'], hierarchy.visibleItems.map(entry => entry.text));
});

test('does not collapse a long flat toc', () => {
  const headings = [];

  for (let index = 0; index < 15; index += 1) {
    headings.push(item('h2', `Section ${index + 1}`));
  }

  const hierarchy = buildPostTocHierarchy(headings, 14);

  assertEqual(15, hierarchy.visibleItems.length);
});

console.log(`\n${tests} tests, 0 failures`);
