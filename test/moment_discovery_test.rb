require 'fileutils'
require 'json'
require 'jekyll'
require 'tmpdir'

class MomentDiscoveryTest
  ROOT = File.expand_path('..', __dir__)

  class AssertionError < StandardError; end

  def run
    @source = Dir.mktmpdir('hr00-moment-discovery-source')
    @destination = Dir.mktmpdir('hr00-moment-discovery-output')
    copy_source
    add_published_moment
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
    FileUtils.remove_entry(@source) if @source && Dir.exist?(@source)
    FileUtils.remove_entry(@destination) if @destination && Dir.exist?(@destination)
  end

  private

  def test_moment_page_uses_the_timeline_and_detail_link
    index = read_output('moments/index.html')

    assert_includes index, '值得记住的时刻'
    assert_includes index, 'id="moments-year-2026"'
    assert_includes index, '上海之行'
    assert_includes index, 'class="moment-entry is-detail"'
    assert_includes index, 'href="/moments/2026-07-01-shanghai-trip/"'
    assert_includes index, '第一次和她在上海走了很久。'
  end

  def test_moment_is_available_from_navigation_and_search
    home = read_output('index.html')
    detail = read_output('moments/2026-07-01-shanghai-trip/index.html')
    search_items = JSON.parse(read_output('search.json'))
    moment = search_items.find { |item| item['type'] == 'moment' }

    assert_includes home, 'href="/moments/"'
    assert_includes home, '>Moments</a>'
    assert_includes detail, '返回 Moments'
    assert_equal '上海之行', moment.fetch('title')
    assert_equal [], moment.fetch('categories')
    assert_equal [], moment.fetch('tags')
    assert_includes moment.fetch('summary'), '第一次和她在上海走了很久。'
  end

  def copy_source
    Dir.children(ROOT).each do |entry|
      next if %w[.git _site node_modules].include?(entry)

      FileUtils.cp_r(File.join(ROOT, entry), @source)
    end
  end

  def add_published_moment
    FileUtils.mkdir_p(File.join(@source, '_moments'))
    File.write(File.join(@source, '_moments', '2026-07-01-shanghai-trip.md'), <<~MARKDOWN)
      ---
      title: 上海之行
      date: 2026-07-01
      display: detail
      published: true
      ---

      第一次和她在上海走了很久。

      沿着安福路慢慢走，傍晚的风比想象中更轻。
    MARKDOWN
  end

  def build_site
    config = Jekyll.configuration(
      'source' => @source,
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

  def assert_equal(expected, actual)
    return if expected == actual

    raise AssertionError, "Expected #{expected.inspect}, got #{actual.inspect}"
  end

  def assert_includes(value, expected)
    return if value.include?(expected)

    raise AssertionError, "Expected #{value.inspect} to include #{expected.inspect}"
  end
end

MomentDiscoveryTest.new.run
