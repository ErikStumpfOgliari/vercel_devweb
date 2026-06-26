/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'sequelize', 'pg', 'pg-hstore', 'pg-pool', 'pg-protocol',
      'pg-connection-string', 'sequelize-pool', 'wkx', 'validator',
      'semver', 'toposort-class', 'moment', 'moment-timezone',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = ['pg', 'pg-hstore', 'pg-native', 'pg-pool', 'pg-protocol',
        'pg-connection-string', 'sequelize', 'sequelize-pool'];
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
        ({ request }, callback) => {
          if (externals.includes(request)) return callback(null, `commonjs ${request}`);
          callback();
        },
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
