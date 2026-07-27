require 'fileutils'
require 'jekyll'
require 'tmpdir'
require_relative '../_plugins/content_taxonomy_validator'

class ContentTaxonomyTest
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

  def test_draft_allows_incomplete_metadata
    build_site(<<~YAML)
      layout: post
      title: ""
      summary: ""
      category: ""
      tags: Git
      published: false
    YAML
  end

  def test_published_article_accepts_valid_metadata
    build_site(<<~YAML)
      layout: post
      title: "测试文章"
      summary: "用于验证有效文章。"
      category: 技术实践
      tags: [Git, Terminal]
      published: true
    YAML
  end

  def test_published_article_reports_missing_metadata
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_site(<<~YAML)
        layout: post
        title: " "
        summary: ""
        category: 技术实践
        tags: Git
        published: true
      YAML
    end

    assert_includes error.message, 'title must not be empty'
    assert_includes error.message, 'summary must not be empty'
    assert_includes error.message, 'tags must be an array'
  end

  def test_published_article_rejects_excess_and_duplicate_tags
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_site(<<~YAML)
        layout: post
        title: "测试文章"
        summary: "用于验证标签。"
        category: 技术实践
        tags: [Git, " git ", Terminal, macOS, Markdown, 写作]
        published: true
      YAML
    end

    assert_includes error.message, 'tags must contain at most 5 items'
    assert_includes error.message, 'tags must not repeat'
    assert_includes error.message, 'tags must not have surrounding whitespace'
  end

  def test_published_article_rejects_legacy_categories_and_missing_tags
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_site(<<~YAML)
        layout: post
        title: "测试文章"
        summary: "用于验证单分类字段。"
        category: 技术实践
        categories: Share
        published: true
      YAML
    end

    assert_includes error.message, 'categories is not supported'
    assert_includes error.message, 'tags must be an array'
  end

  def test_published_article_rejects_empty_and_non_string_tags
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_site(<<~YAML)
        layout: post
        title: "测试文章"
        summary: "用于验证标签类型。"
        category: 技术实践
        tags: ["", 123, {name: Git}]
        published: true
      YAML
    end

    assert_includes error.message, 'tags must contain non-empty strings'
  end

  def test_published_article_rejects_unknown_category
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_site(<<~YAML)
        layout: post
        title: "测试文章"
        summary: "用于验证分类。"
        category: 未知分类
        tags: []
        published: true
      YAML
    end

    assert_includes error.message, 'category'
    assert_includes error.message, '未知分类'
  end

  def build_site(front_matter)
    Dir.mktmpdir('hr00-taxonomy-test') do |source|
      destination = File.join(source, '_site')
      FileUtils.mkdir_p(File.join(source, '_layouts'))
      FileUtils.mkdir_p(File.join(source, '_posts'))
      File.write(File.join(source, '_layouts', 'post.html'), '{{ content }}')
      File.write(
        File.join(source, '_posts', '2026-01-01-test.md'),
        "---\n#{front_matter}---\n\n测试正文。\n"
      )

      config = Jekyll.configuration(
        'source' => source,
        'destination' => destination,
        'quiet' => true
      )
      Jekyll::Site.new(config).process
    end
  end

  def assert_includes(value, expected)
    return if value.include?(expected)

    raise AssertionError, "Expected #{value.inspect} to include #{expected.inspect}"
  end

  def assert_raises(error_class)
    begin
      yield
    rescue error_class => error
      return error
    end

    raise AssertionError, "Expected #{error_class}, but nothing was raised"
  end
end

ContentTaxonomyTest.new.run
