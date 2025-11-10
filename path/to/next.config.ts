
          // Poora updated file content yahan hota hai
          const nextConfig = {
            images: {
              remotePatterns: [
                { hostname: 'picsum.photos' },
                { hostname: 'images.unsplash.com' },
                { hostname: 'source.unsplash.com' }, // Yeh line add ki gayi hai
              ],
            },
          };
          export default nextConfig;
        