
          // The entire, final content of the file goes here...
          const nextConfig = {
            images: {
              remotePatterns: [
                { hostname: 'picsum.photos' },
                { hostname: 'images.unsplash.com' },
                { hostname: 'source.unsplash.com' }, // This line was added
              ],
            },
          };
          export default nextConfig;
        