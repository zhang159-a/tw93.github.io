module Hr00
  class ContentTaxonomyValidator < Jekyll::Generator
    CATEGORIES = ['技术实践', '学习笔记', '生活记录', '思考随笔'].freeze

    safe true
    priority :highest

    def generate(site)
      site.config['article_categories'] = CATEGORIES

      errors = published_post_files(site).flat_map do |path|
        data = front_matter(path)
        next [] unless data
        next [] if data['published'] == false

        post_errors = []
        relative_path = path.delete_prefix("#{site.source}/")
        prefix = "#{relative_path}:"

        post_errors << "#{prefix} title must not be empty" if data['title'].to_s.strip.empty?
        post_errors << "#{prefix} summary must not be empty" if data['summary'].to_s.strip.empty?
        unless CATEGORIES.include?(data['category'])
          post_errors << "#{prefix} category must be one of #{CATEGORIES.join('、')} (got #{data['category'].inspect})"
        end
        if data.key?('tags') && !data['tags'].is_a?(Array)
          post_errors << "#{prefix} tags must be an array"
        elsif data['tags'].is_a?(Array)
          tags = data['tags']
          post_errors << "#{prefix} tags must contain at most 5 items" if tags.length > 5
          if tags.any? { |tag| tag.is_a?(String) && tag != tag.strip }
            post_errors << "#{prefix} tags must not have surrounding whitespace"
          end

          normalized_tags = tags.map { |tag| tag.to_s.strip.downcase }
          if normalized_tags.uniq.length != normalized_tags.length
            post_errors << "#{prefix} tags must not repeat, including case-only differences"
          end
        end

        post_errors
      end

      return if errors.empty?

      raise Jekyll::Errors::FatalException,
            "Content taxonomy validation failed:\n- #{errors.join("\n- ")}"
    end

    private

    def published_post_files(site)
      Dir.glob(File.join(site.source, '_posts', '**', '*.{md,markdown,html}')).sort
    end

    def front_matter(path)
      content = File.read(path, encoding: 'bom|utf-8')
      return unless content =~ Jekyll::Document::YAML_FRONT_MATTER_REGEXP

      SafeYAML.load(Regexp.last_match(1))
    end
  end
end
