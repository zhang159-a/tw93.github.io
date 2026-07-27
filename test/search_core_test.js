const search = require('../js/search-core.js');

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(expected, actual) {
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  assert(expectedJson === actualJson, `expected ${expectedJson}, got ${actualJson}`);
}

test('matches every searchable field and ranks explicit metadata first', () => {
  const results = search.rankResults([
    { title: 'Exact topic', summary: '', content: '', categories: [], tags: [] },
    { title: 'Other', summary: '', content: '', categories: [], tags: ['topic'] },
    { title: 'Other', summary: 'topic', content: '', categories: [], tags: [] },
    { title: 'Other', summary: '', content: 'topic', categories: [], tags: [] }
  ], 'topic');

  assertEqual([100, 80, 40, 10], results.map(result => result.score));
});

test('keeps source order when relevance is equal', () => {
  const results = search.rankResults([
    { title: 'First', summary: 'same', content: '', categories: [], tags: [] },
    { title: 'Second', summary: 'same', content: '', categories: [], tags: [] }
  ], 'same');

  assertEqual(['First', 'Second'], results.map(result => result.post.title));
});

test('matches categories and tags', () => {
  const post = {
    title: 'Post',
    summary: '',
    content: '',
    categories: ['技术实践'],
    tags: ['Terminal']
  };

  assert(search.scoreResult(post, '技术') > 0, 'category should match');
  assert(search.scoreResult(post, 'terminal') > 0, 'tag should match case-insensitively');
});

test('keeps Weekly searchable without fabricated taxonomy', () => {
  const weekly = {
    title: 'Weekly 001',
    summary: '独立周刊描述',
    content: '正文',
    categories: [],
    tags: [],
    type: 'weekly'
  };

  assert(search.scoreResult(weekly, '周刊') > 0, 'Weekly summary should match');
  assertEqual([], weekly.categories);
  assertEqual([], weekly.tags);
});

test('escapes metadata before highlighting it', () => {
  const value = search.highlightText('<img src=x onerror=alert(1)>Terminal', 'terminal');

  assert(!value.includes('<img'), 'raw HTML should not survive');
  assert(value.includes('&lt;img'), 'HTML should be escaped');
  assert(value.includes('<mark>Terminal</mark>'), 'safe match should be highlighted');
});

console.log(`\n${tests} tests, 0 failures`);
