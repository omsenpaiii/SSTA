import type { NextConfig } from "next";

type WebpackPlugin = {
  constructor: {
    name?: string;
  };
};

const nextConfig: NextConfig = {
  serverExternalPackages: ["exceljs"],
  transpilePackages: ["@supabase/auth-js", "@supabase/ssr", "@supabase/supabase-js"],
  webpack(config, { dev }) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@supabase/auth-js": require.resolve("@supabase/auth-js"),
    };

    if (!dev && config.optimization?.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin: WebpackPlugin) => plugin.constructor.name !== "CssMinimizerPlugin"
      );
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};


export default nextConfig;
