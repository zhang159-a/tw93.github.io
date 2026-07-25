require 'cgi'
require 'uri'

module Jekyll
  module VideoEmbedFilter
    STANDALONE_URL_PARAGRAPH = %r{<p>\s*(https?://[^\s<]+)\s*</p>}i.freeze
    YOUTUBE_HOSTS = %w[
      youtube.com
      www.youtube.com
      m.youtube.com
      music.youtube.com
      youtube-nocookie.com
      www.youtube-nocookie.com
    ].freeze
    BILIBILI_HOSTS = %w[
      bilibili.com
      www.bilibili.com
      m.bilibili.com
    ].freeze
    DIRECT_VIDEO_EXTENSIONS = %w[.mp4 .webm .ogv .ogg .m4v].freeze

    def video_embed_filter(input)
      input.to_s.gsub(STANDALONE_URL_PARAGRAPH) do |paragraph|
        source_url = CGI.unescapeHTML(Regexp.last_match(1))
        video_embed_html(source_url) || paragraph
      end
    end

    private

    def video_embed_html(source_url)
      uri = URI.parse(source_url)
      return unless %w[http https].include?(uri.scheme)

      youtube_embed(uri) || bilibili_embed(uri) || direct_video_embed(uri)
    rescue URI::InvalidURIError, ArgumentError
      nil
    end

    def youtube_embed(uri)
      video_id = youtube_video_id(uri)
      return unless video_id

      iframe_embed(
        "https://www.youtube-nocookie.com/embed/#{video_id}",
        'YouTube 视频播放器',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      )
    end

    def youtube_video_id(uri)
      host = uri.host&.downcase

      if host == 'youtu.be'
        candidate = uri.path.split('/').reject(&:empty?).first
      elsif YOUTUBE_HOSTS.include?(host)
        candidate = youtube_path_video_id(uri.path)
        candidate ||= query_params(uri)['v'] if uri.path == '/watch'
      end

      candidate if candidate&.match?(/\A[A-Za-z0-9_-]{11}\z/)
    end

    def youtube_path_video_id(path)
      path.match(%r{\A/(?:embed|live|shorts)/([A-Za-z0-9_-]{11})(?:/|\z)})&.[](1)
    end

    def bilibili_embed(uri)
      return unless BILIBILI_HOSTS.include?(uri.host&.downcase)

      video_match = uri.path.match(%r{\A/video/(BV[0-9A-Za-z]{10}|av(\d+))(?:/|\z)}i)
      return unless video_match

      params = query_params(uri)
      player_params = if video_match[2]
                        { 'aid' => video_match[2] }
                      else
                        { 'bvid' => video_match[1] }
                      end

      page = params['p']
      player_params['page'] = page if page&.match?(/\A[1-9]\d*\z/)

      player_url = "https://player.bilibili.com/player.html?#{URI.encode_www_form(player_params)}"
      iframe_embed(player_url, '哔哩哔哩视频播放器', 'autoplay; fullscreen')
    end

    def direct_video_embed(uri)
      return unless DIRECT_VIDEO_EXTENSIONS.include?(File.extname(uri.path).downcase)

      escaped_url = CGI.escapeHTML(uri.to_s)
      <<~HTML.chomp
        <div class="video-container">
          <video src="#{escaped_url}" controls preload="metadata" playsinline>
            你的浏览器不支持 HTML5 视频播放。
          </video>
        </div>
      HTML
    end

    def iframe_embed(source_url, title, permissions)
      escaped_url = CGI.escapeHTML(source_url)
      <<~HTML.chomp
        <div class="video-container">
          <iframe src="#{escaped_url}" title="#{title}" loading="lazy" allow="#{permissions}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
      HTML
    end

    def query_params(uri)
      URI.decode_www_form(uri.query.to_s).to_h
    end
  end
end

Liquid::Template.register_filter(Jekyll::VideoEmbedFilter)
