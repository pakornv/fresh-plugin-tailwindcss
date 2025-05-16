import type { ResolvedFreshConfig } from "@fresh/core";
import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

export function initTailwind(
  config: ResolvedFreshConfig,
): postcss.Processor {
  const plugins = [tailwindcss({
    optimize: {
      minify: config.mode === "production",
    },
  })];

  return postcss(plugins);
}
