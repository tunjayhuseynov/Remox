/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { 
      "crypto": require.resolve("crypto-browserify"),
      "fs": false,
      "net": false,
      "querystring": require.resolve("querystring-es3"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url/")
    };

    return config;
  },
}


module.exports = nextConfig
