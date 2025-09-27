/** @type {import('next').NextConfig} *//** @type {import('next').NextConfig} *//** @type {import('next').NextConfig} */

const nextConfig = {

  reactStrictMode: true,const config = {const nextConfig = {

}

  reactStrictMode: true,  typescript: {

export default nextConfig
  experimental: {    ignoreBuildErrors: true

    serverActions: {  },

      allowedOrigins: ['localhost:3000', 'localhost:3001'],  outputFileTracingRoot: "/home/juanda/ipuc-contabilidad",

    },}

  },

}export default nextConfig

export default config