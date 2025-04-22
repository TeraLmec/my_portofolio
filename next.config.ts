import type { NextConfig } from "next";

/* interface TestableRule {
  test?: {
    test?(path: string): boolean;
  };
  issuer: unknown;
  resourceQuery?: {
    not?: RegExp[];
  };
  exclude: unknown;
} */

const nextConfig: NextConfig = {
  webpack(config) {
    // tell TS “treat every rule as if it were TestableRule”
    const rules = config.module.rules/*  as TestableRule[] */;

    const fileLoaderRule = rules.find((rule) => rule.test?.test?.(".svg"));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule!.issuer,
        resourceQuery: { not: [...fileLoaderRule!.resourceQuery!.not!, /url/] }, // exclude if *.svg?url
        use: {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule!.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
