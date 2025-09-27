/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias["@react-native-async-storage/async-storage"] =
      "localforage";
    return config;
  },
  turbopack: {},
  productionBrowserSourceMaps: false,
};

export default nextConfig;
