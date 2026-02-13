/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        DATABASE_URL: "mongodb://localhost:32768/nebula_kicks?directConnection=true",
    },
};

export default nextConfig;
