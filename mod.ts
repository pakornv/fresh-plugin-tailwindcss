import type { App } from "@fresh/core";
import type { Builder } from "@fresh/core/dev";
import { initTailwind } from "./compiler.ts";

export function tailwind<T>(
  builder: Builder,
  app: App<T>,
): void {
  const processor = initTailwind(app.config);

  builder.onTransformStaticFile(
    { pluginName: "tailwind", filter: /\.css$/ },
    async (args) => {
      const result = await processor.process(args.text, {
        from: args.path,
      });
      return {
        content: result.content,
        map: result.map?.toString(),
      };
    },
  );
}
