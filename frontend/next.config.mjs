/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: ( config ) => {
        config.resolve.alias['@react-native-async-storage/async-storage'] = 'localforage'
        return config
    },
    productionBrowserSourceMaps: false,
}

export default nextConfig