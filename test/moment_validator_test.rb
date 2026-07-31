require 'fileutils'
require 'jekyll'
require 'tmpdir'
require_relative '../_plugins/moment_validator'

class MomentValidatorTest
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
    build_site('draft.md', <<~YAML)
      title: ""
      display: inline
      published: false
    YAML
  end

  def test_published_moment_accepts_optional_summary_and_cover
    build_site('2026-07-01-shanghai-trip.md', <<~YAML)
      title: 上海之行
      date: 2026-07-01
      display: detail
      cover: https://img.byhaoran.cn/PicGo/shanghai.jpg
      published: true
    YAML
  end

  def test_published_moment_rejects_invalid_metadata
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_site('wrong-name.md', <<~YAML)
        title: ""
        date: 2026-07-02
        display: full
        summary: 12
        cover: /images/moment.jpg
        published: true
      YAML
    end

    assert_includes error.message, 'title must not be empty'
    assert_includes error.message, 'display must be one of inline or detail'
    assert_includes error.message, 'summary must be a string'
    assert_includes error.message, 'cover must be an absolute HTTPS URL'
  end

  def test_published_moment_accepts_legacy_filename
    build_site('2026-7-27-dong ye gui wu.md', <<~YAML)
        title: 上海之行
        date: 2026-07-02
        display: inline
        published: true
      YAML
  end

  def build_site(filename, front_matter)
    Dir.mktmpdir('hr00-moment-test') do |source|
      destination = File.join(source, '_site')
      FileUtils.mkdir_p(File.join(source, '_moments'))
      File.write(
        File.join(source, '_moments', filename),
        "---\n#{front_matter}---\n\n测试正文。\n"
      )

      config = Jekyll.configuration(
        'source' => source,
        'destination' => destination,
        'quiet' => true,
        'collections' => { 'moments' => { 'output' => true } }
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

MomentValidatorTest.new.run
