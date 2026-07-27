require 'fileutils'
require 'json'
require 'jekyll'
require 'tmpdir'

class ArticleDiscoveryTest
  ROOT = File.expand_path('..', __dir__)

  class AssertionError < StandardError; end

  def run
    @destination = Dir.mktmpdir('hr00-article-discovery')
    build_site

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
  ensure
    FileUtils.remove_entry(@destination) if @destination && Dir.exist?(@destination)
  end

  private

  def test_category_article_index_is_available_from_navigation_and_posts
    index = read_output('articles/index.html')
    home = read_output('index.html')
    post = read_output('2026-07-23/kaku.html')

    assert_includes home, 'href="/articles/"'
    assert_includes home, '>文章</a>'
    assert_includes home, 'header-item-left header-item-mobile-hidden"><a href="/about.html"'
    refute_includes home, 'header-item-mobile-hidden"><a href="/articles/"'
    assert_includes index, 'data-articles-root'
    assert_includes index, 'data-article-count="3"'
    assert_includes index, 'Kaku AI 终端'
    assert_includes index, '妙言使用指南'
    assert_includes index, 'Github-Desktop 使用'
    assert_article_date index, 'Github-Desktop 使用', '2026-07-25'
    assert_article_date index, '妙言使用指南', '2026-07-23'
    assert_includes post, 'class="post-category-link"'
    assert_includes post, '/articles/?category='
  end

  def test_article_index_and_posts_expose_tag_filters
    index = read_output('articles/index.html')
    post = read_output('2026-07-23/kaku.html')

    assert_includes index, 'data-tag-filter="Terminal"'
    assert_includes index, 'data-tag-filter="Git"'
    assert_includes post, 'class="post-tag-link"'
    assert_includes post, '/articles/?tags=Terminal'
  end

  def test_search_index_exposes_categories_and_tags
    search_items = JSON.parse(read_output('search.json'))
    kaku = search_items.find { |item| item['title'] == 'Kaku AI 终端' }
    weekly = search_items.find { |item| item['type'] == 'weekly' }

    assert_equal ['技术实践'], kaku.fetch('categories')
    assert_equal ['Kaku', 'Terminal'], kaku.fetch('tags')
    assert_equal ['Weekly'], weekly.fetch('categories')
    assert_equal [], weekly.fetch('tags')
  end

  def build_site
    config = Jekyll.configuration(
      'source' => ROOT,
      'destination' => @destination,
      'quiet' => true
    )
    Jekyll::Site.new(config).process
  end

  def read_output(relative_path)
    path = File.join(@destination, relative_path)
    raise AssertionError, "Missing build output #{relative_path}" unless File.file?(path)

    File.read(path, encoding: 'utf-8')
  end

  def assert_includes(value, expected)
    return if value.include?(expected)

    raise AssertionError, "Expected output to include #{expected.inspect}"
  end

  def refute_includes(value, unexpected)
    return unless value.include?(unexpected)

    raise AssertionError, "Expected output not to include #{unexpected.inspect}"
  end

  def assert_equal(expected, actual)
    return if expected == actual

    raise AssertionError, "Expected #{expected.inspect}, got #{actual.inspect}"
  end

  def assert_article_date(output, title, expected_date)
    title_index = output.index(title)
    raise AssertionError, "Missing article #{title.inspect}" unless title_index

    article_start = output.rindex('<article', title_index)
    article_end = output.index('</article>', title_index)
    article = output[article_start..article_end]
    return if article.include?(">#{expected_date}</time>")

    raise AssertionError, "Expected #{title.inspect} to show #{expected_date}"
  end
end

ArticleDiscoveryTest.new.run
