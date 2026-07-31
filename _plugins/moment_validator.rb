require 'date'

module Hr00
  class MomentValidator < Jekyll::Generator
    DISPLAY_MODES = %w[inline detail].freeze
    FILENAME_PATTERN = /\A(\d{4}-\d{2}-\d{2})-[a-z0-9][a-z0-9-]*\.(?:md|markdown|html)\z/.freeze

    safe true
    priority :highest

    def generate(site)
      errors = published_moment_files(site).flat_map do |path|
        data = front_matter(path)
        next [] unless data
        next [] if data['published'] == false

        validate(path, data, site.source)
      end

      return if errors.empty?

      raise Jekyll::Errors::FatalException,
            "Moment validation failed:\n- #{errors.join("\n- ")}"
    end

    private

    def published_moment_files(site)
      Dir.glob(File.join(site.source, '_moments', '**', '*.{md,markdown,html}')).sort
    end

    def front_matter(path)
      content = File.read(path, encoding: 'bom|utf-8')
      return unless content =~ Jekyll::Document::YAML_FRONT_MATTER_REGEXP

      SafeYAML.load(Regexp.last_match(1))
    end

    def validate(path, data, source)
      relative_path = path.delete_prefix("#{source}/")
      prefix = "#{relative_path}:"
      filename_match = File.basename(path).match(FILENAME_PATTERN)
      errors = []

      errors << "#{prefix} filename must follow YYYY-MM-DD-lowercase-slug.md" unless filename_match
      errors << "#{prefix} title must not be empty" if data['title'].to_s.strip.empty?
      errors << "#{prefix} date must be present" if data['date'].to_s.strip.empty?
      unless DISPLAY_MODES.include?(data['display'])
        errors << "#{prefix} display must be one of #{DISPLAY_MODES.join(' or ')}"
      end
      if data.key?('summary') && !data['summary'].is_a?(String)
        errors << "#{prefix} summary must be a string when provided"
      end
      if data.key?('cover') && !data['cover'].to_s.empty? && !data['cover'].match?(%r{\Ahttps://})
        errors << "#{prefix} cover must be an absolute HTTPS URL when provided"
      end

      if filename_match && !data['date'].to_s.strip.empty?
        moment_date = Date.parse(data['date'].to_s).strftime('%Y-%m-%d')
        errors << "#{prefix} date must match the filename date" unless moment_date == filename_match[1]
      end

      errors
    rescue Date::Error
      errors << "#{prefix} date must be a valid calendar date"
      errors
    end
  end
end
