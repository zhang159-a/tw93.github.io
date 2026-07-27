const filters = require('../js/article-filter-core.js');

let tests = 0;

function test(name, fn) {
  tests += 1;
  fn();
  process.stdout.write('.');
}

function assertEqual(expected, actual) {
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  if (expectedJson !== actualJson) {
    throw new Error(`expected ${expectedJson}, got ${actualJson}`);
  }
}

test('round trips delimiter characters through repeated URL parameters', () => {
  const tags = ['AI,ML', 'A|B'];
  const url = filters.urlWithState(
    'https://example.com/articles/',
    {category: '技术实践', tags}
  );
  const restored = filters.readState(
    new URL(url).search,
    ['技术实践'],
    tags
  );

  assertEqual({category: '技术实践', tags}, restored);
  assertEqual(['AI,ML', 'A|B'], new URL(url).searchParams.getAll('tags'));
});

test('parses JSON article tag metadata without delimiter ambiguity', () => {
  assertEqual(['AI,ML', 'A|B'], filters.parseItemTags('["AI,ML","A|B"]'));
  assertEqual([], filters.parseItemTags('not-json'));
});

console.log(`\n${tests} tests, 0 failures`);
