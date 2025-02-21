import tailwindcss from "@tailwindcss/postcss";
import cssnano from "cssnano";
import postcss from "postcss";
import type { ResolvedFreshConfig } from "./types.ts";

export function initTailwind(
  config: ResolvedFreshConfig,
): postcss.Processor {
  const plugins = [tailwindcss()];

  if (!config.dev) {
    plugins.push(cssnano());
  }

  return postcss(plugins);
}
