/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        DATABASE_URL: "mongodb://localhost:32768/nebula_kicks?directConnection=true",
    },
};

export default nextConfig;
