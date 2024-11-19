require 'digest'

def make_challenge(name)
  hash = Digest::MD5.hexdigest("showdown.space Browser automation challenges #{name}")[0..7]
  { 'VITE_CHALLENGE' => name, 'BUILD_BASE' => "/challenge-#{name}-#{hash}/", 'BUILD_OUT' => "dist/challenge-#{name}-#{hash}" }
end

envs = [
  make_challenge('buttons'),
  make_challenge('demo'),
  make_challenge('hunting'),
  make_challenge('mui'),
  make_challenge('robot'),
  make_challenge('towers'),
]

File.open('Makefile', 'w') do |f|
  # Write phony targets
  targets = envs.map { |env| "challenge-#{env['VITE_CHALLENGE']}" }
  f.puts ".PHONY: all clean #{targets.join(' ')} landing"
  f.puts

  # Write all target
  f.puts "all: clean #{targets.join(' ')} landing"
  f.puts

  # Write clean target
  f.puts "clean:"
  f.puts "\trm -rf dist"
  f.puts

  # Write individual build targets
  envs.each do |env|
    target = "challenge-#{env['VITE_CHALLENGE']}"
    f.puts "#{target}:"
    env_vars = env.map { |k, v| "#{k}=#{v}" }.join(" \\\n\t")
    f.puts "\t#{env_vars} \\"
    f.puts "\tpnpm run build:challenge"
    f.puts
  end

  # Write landing target
  f.puts "landing: #{targets.join(' ')}"
  f.puts "\tcp landing.html dist/index.html"
  f.puts
end
