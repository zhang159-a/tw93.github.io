module Jekyll
  module CDNImageFilter
    # Live Aliyun OSS CDNs that support ?x-oss-process= image params.
    OSS_DOMAINS = [
      'gw.alipayobjects.com',
      'gw.alicdn.com',
      'img.alicdn.com'
    ]

    # Build an optimized image URL based on the source host.
    def self.optimize(url)
      return url if url.nil? || url.empty?
      return url if url =~ /\.(svg|gif)$/i

      # Live Aliyun OSS CDNs -> ?x-oss-process= params.
      return url if url.include?('x-oss-process')
      domain_match = OSS_DOMAINS.any? { |domain| url.include?(domain) }
      return url unless domain_match

      separator = url.include?('?') ? '&' : '?'
      # Using w_2000 to match weekly project implementation for high-res screens
      "#{url}#{separator}x-oss-process=image/auto-orient,1/resize,w_2000/format,webp"
    end

    # Filter for processing HTML content (<img> tags)
    def cdn_image_filter(input)
      input.gsub(/<img\s+[^>]*src="([^"]+)"[^>]*>/) do |img_tag|
        src = $1
        new_src = CDNImageFilter.optimize(src)

        if src != new_src
          img_tag.sub(src, new_src)
        else
          img_tag
        end
      end
    end

    # Filter for processing raw URLs (e.g. page.feature)
    def cdn_image_url(input)
      CDNImageFilter.optimize(input)
    end
  end
end

Liquid::Template.register_filter(Jekyll::CDNImageFilter)
