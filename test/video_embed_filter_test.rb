require 'jekyll'
require_relative '../_plugins/video_embed_filter'

class VideoEmbedFilterTest
  class AssertionError < StandardError; end

  class FilterHarness
    include Jekyll::VideoEmbedFilter
  end

  def run
    tests = private_methods(false).grep(/\Atest_/).sort
    failures = []

    tests.each do |test|
      @filter = FilterHarness.new
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

  def test_embeds_standalone_youtube_watch_url
    result = filter('<p>https://www.youtube.com/watch?v=n0VhIVtviC0</p>')

    assert_includes result, 'class="video-container"'
    assert_includes result, 'https://www.youtube-nocookie.com/embed/n0VhIVtviC0'
    assert_includes result, 'title="YouTube 视频播放器"'
  end

  def test_embeds_supported_youtube_url_variants
    [
      'https://youtu.be/n0VhIVtviC0',
      'https://www.youtube.com/shorts/n0VhIVtviC0',
      'https://www.youtube.com/live/n0VhIVtviC0'
    ].each do |url|
      assert_includes filter("<p>#{url}</p>"), '/embed/n0VhIVtviC0'
    end
  end

  def test_embeds_bilibili_bvid_and_page
    result = filter('<p>https://www.bilibili.com/video/BV1B7411m7LV?p=2</p>')

    assert_includes result, 'https://player.bilibili.com/player.html?bvid=BV1B7411m7LV&amp;page=2'
    assert_includes result, 'title="哔哩哔哩视频播放器"'
  end

  def test_embeds_bilibili_aid
    result = filter('<p>https://www.bilibili.com/video/av170001</p>')

    assert_includes result, 'https://player.bilibili.com/player.html?aid=170001'
  end

  def test_embeds_direct_video_file
    result = filter('<p>https://cdn.example.com/videos/demo.mp4?download=0&amp;token=public</p>')

    assert_includes result, '<video '
    assert_includes result, 'src="https://cdn.example.com/videos/demo.mp4?download=0&amp;token=public"'
    assert_includes result, 'controls'
  end

  def test_leaves_unknown_provider_unchanged
    input = '<p>https://example.com/watch/video-123</p>'

    assert_equal input, filter(input)
  end

  def test_leaves_inline_url_unchanged
    input = '<p>正文中的视频：https://www.youtube.com/watch?v=n0VhIVtviC0</p>'

    assert_equal input, filter(input)
  end

  def test_leaves_markdown_link_unchanged
    input = '<p><a href="https://www.youtube.com/watch?v=n0VhIVtviC0">视频链接</a></p>'

    assert_equal input, filter(input)
  end

  def test_leaves_invalid_video_id_unchanged
    input = '<p>https://www.youtube.com/watch?v=not-valid</p>'

    assert_equal input, filter(input)
  end

  def filter(html)
    @filter.video_embed_filter(html)
  end

  def assert_includes(value, expected)
    return if value.include?(expected)

    raise AssertionError, "Expected #{value.inspect} to include #{expected.inspect}"
  end

  def assert_equal(expected, actual)
    return if expected == actual

    raise AssertionError, "Expected #{expected.inspect}, got #{actual.inspect}"
  end
end

VideoEmbedFilterTest.new.run
