import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    env: {
        API_URL: 'https://otel-api.svai.dev'
    },
      async headers() {
        return [
            {
                // matching all API routes
                source: "/fact",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
};

export default nextConfig;
