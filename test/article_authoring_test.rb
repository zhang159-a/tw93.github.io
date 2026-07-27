require 'fileutils'
require 'jekyll'
require 'tmpdir'

class ArticleAuthoringTest
  ROOT = File.expand_path('..', __dir__)

  class AssertionError < StandardError; end

  def run
    tests = private_methods(false).grep(/\Atest_/).sort
    failures = []

    tests.each do |test|
      send(test)
      print '.'
    rescue StandardError => error
      print 'F'
      failures << [test, error]
    end

    puts
    failures.each do |test, error|
      warn "#{test}: #{error.class}: #{error.message}"
    end
    puts "#{tests.length} tests, #{failures.length} failures"

    exit(1) unless failures.empty?
  end

  private

  def test_four_category_templates_are_minimal_and_blank
    expected_templates = {
      '01-技术实践.md' => '技术实践',
      '02-学习笔记.md' => '学习笔记',
      '03-生活记录.md' => '生活记录',
      '04-思考随笔.md' => '思考随笔'
    }
    actual_templates = Dir.children(File.join(ROOT, '_templates')).grep(/\.md\z/).sort

    assert_equal expected_templates.keys, actual_templates

    expected_templates.each do |filename, category|
      data, body = read_front_matter(File.join(ROOT, '_templates', filename))
      assert_equal(
        %w[layout title poem summary feature category tags published],
        data.keys
      )
      assert_equal 'post', data['layout']
      assert_equal '', data['title']
      assert_equal '', data['poem']
      assert_equal '', data['summary']
      assert_equal '', data['feature']
      assert_equal category, data['category']
      assert_equal [], data['tags']
      assert_equal false, data['published']
      assert_equal '', body.strip
    end
  end

  def test_confirmed_articles_use_the_new_taxonomy
    expected_articles = {
      '2026-07-23-kaku.md' => %w[Kaku Terminal],
      '2026-07-23-miaoyan-guide.md' => ['Markdown', '写作'],
      '2026-7-25-Github-Desktop.md' => ['Git'],
      '2026-7-25-Hr00.md' => ['博客'],
      '2026-7-25-Terminal-Editing.md' => ['Terminal', '快捷键'],
      '2026-7-26-Mac.md' => ['macOS', '工具推荐'],
      '2026-7-26-Terminal-Tools.md' => ['Terminal']
    }

    expected_articles.each do |filename, tags|
      data, = read_front_matter(File.join(ROOT, '_posts', filename))
      assert_equal '技术实践', data['category']
      assert_equal tags, data['tags']
      assert_equal false, data.key?('categories')
    end
  end

  def test_empty_poem_falls_back_to_title
    Dir.mktmpdir('hr00-poem-test') do |source|
      FileUtils.mkdir_p(File.join(source, '_includes'))
      FileUtils.mkdir_p(File.join(source, '_layouts'))
      FileUtils.cp(
        File.join(ROOT, '_includes', 'header.html'),
        File.join(source, '_includes', 'header.html')
      )
      File.write(
        File.join(source, '_layouts', 'default.html'),
        '{% include header.html %}{{ content }}'
      )
      File.write(
        File.join(source, 'index.md'),
        "---\nlayout: default\ntitle: 回退标题\npoem: \"\"\n---\n"
      )

      destination = File.join(source, '_site')
      config = Jekyll.configuration(
        'source' => source,
        'destination' => destination,
        'quiet' => true,
        'title' => 'Hr00',
        'menu' => []
      )
      Jekyll::Site.new(config).process

      output = File.read(File.join(destination, 'index.html'))
      assert_includes output, 'aria-label="回退标题"'
      assert_includes output, '>回退标题</textPath>'
    end
  end

  def test_hidden_field_no_longer_hides_published_article
    Dir.mktmpdir('hr00-discovery-test') do |source|
      FileUtils.mkdir_p(File.join(source, '_includes'))
      FileUtils.mkdir_p(File.join(source, '_posts'))
      FileUtils.cp(
        File.join(ROOT, '_includes', 'post-item.html'),
        File.join(source, '_includes', 'post-item.html')
      )
      FileUtils.cp(File.join(ROOT, 'feed.xml'), File.join(source, 'feed.xml'))
      File.write(
        File.join(source, 'index.md'),
        "---\nlayout: null\n---\n{% include post-item.html posts=site.posts %}\n"
      )
      File.write(
        File.join(source, '_posts', '2026-01-01-visible.md'),
        "---\nlayout: null\ntitle: 应该被发现\nsummary: 测试\nhidden: true\n---\n"
      )

      destination = File.join(source, '_site')
      config = Jekyll.configuration(
        'source' => source,
        'destination' => destination,
        'quiet' => true
      )
      Jekyll::Site.new(config).process

      output = File.read(File.join(destination, 'index.html'))
      feed = File.read(File.join(destination, 'feed.xml'))
      assert_includes output, '应该被发现'
      assert_includes feed, '应该被发现'
    end
  end

  def test_hidden_field_no_longer_hides_read_more_link
    template = File.read(File.join(ROOT, '_includes', 'read-more.html'))

    refute_includes template, 'previous.hidden'
    refute_includes template, 'previous.hide'
  end

  def read_front_matter(path)
    content = File.read(path, encoding: 'bom|utf-8')
    match = content.match(Jekyll::Document::YAML_FRONT_MATTER_REGEXP)
    raise AssertionError, "Missing front matter in #{path}" unless match

    [SafeYAML.load(match[1]), match.post_match]
  end

  def assert_equal(expected, actual)
    return if expected == actual

    raise AssertionError, "Expected #{expected.inspect}, got #{actual.inspect}"
  end

  def assert_includes(value, expected)
    return if value.include?(expected)

    raise AssertionError, "Expected #{value.inspect} to include #{expected.inspect}"
  end

  def refute_includes(value, unexpected)
    return unless value.include?(unexpected)

    raise AssertionError, "Expected #{value.inspect} not to include #{unexpected.inspect}"
  end
end

ArticleAuthoringTest.new.run
