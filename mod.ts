import { walk } from "@std/fs/walk";
import * as path from "@std/path";
import type postcss from "postcss";
import type { Plugin, PluginMiddleware, ResolvedFreshConfig } from "./types.ts";

async function initTailwind(config: ResolvedFreshConfig) {
  return (await import("./compiler.ts")).initTailwind(config);
}

/** A plugin that compiles Tailwind CSS files. */
export default function tailwind(): Plugin {
  let staticDir = path.join(Deno.cwd(), "static");
  let processor: postcss.Processor | null = null;

  const cache = new Map<string, { content: string; map: string }>();

  const tailwindMiddleware: PluginMiddleware = {
    path: "/",
    middleware: {
      // deno-lint-ignore no-explicit-any
      handler: async (_req: any, ctx: any) => {
        const pathname = ctx.url.pathname;

        if (pathname.endsWith(".css.map")) {
          const cached = cache.get(pathname);
          if (cached) return Response.json(cached.map);
        }

        if (!pathname.endsWith(".css") || !processor) {
          return ctx.next();
        }

        let cached = cache.get(pathname);
        if (!cached) {
          const filePath = path.join(
            staticDir,
            pathname.replace(ctx.config.basePath, ""),
          );
          let text = "";
          try {
            text = await Deno.readTextFile(filePath);
            const res = await processor.process(text, {
              from: filePath,
            });

            cached = {
              content: res.content,
              map: res.map?.toString() ?? "",
            };
            cache.set(pathname, cached);
          } catch (err) {
            // If the file is not found than it's likely a virtual file
            // by the user that they respond to via a middleware.
            if (err instanceof Deno.errors.NotFound) {
              return ctx.next();
            }

            cached = {
              content: text,
              map: "",
            };
            console.error(err);
          }
        }

        return new Response(cached!.content, {
          status: 200,
          headers: {
            "Content-Type": "text/css",
            "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
          },
        });
      },
    },
  };

  const middlewares: Plugin["middlewares"] = [];

  return {
    name: "tailwind",
    // deno-lint-ignore no-explicit-any
    async configResolved(config: any) {
      if (config.dev) {
        staticDir = config.staticDir;
        processor = await initTailwind(config);
        middlewares.push(tailwindMiddleware);
      }
    },
    middlewares,
    // deno-lint-ignore no-explicit-any
    async buildStart(config: any) {
      staticDir = config.staticDir;
      const outDir = path.join(config.build.outDir, "static");

      processor = await initTailwind(config);

      const files = walk(config.staticDir, {
        exts: ["css"],
        includeDirs: false,
        includeFiles: true,
      });

      for await (const file of files) {
        const content = await Deno.readTextFile(file.path);
        const result = await processor.process(content, {
          from: file.path,
        });

        const relFilePath = path.relative(staticDir, file.path);
        const outPath = path.join(outDir, relFilePath);

        try {
          await Deno.mkdir(path.dirname(outPath), { recursive: true });
        } catch (err) {
          if (!(err instanceof Deno.errors.AlreadyExists)) {
            throw err;
          }
        }

        await Deno.writeTextFile(outPath, result.content);
      }
    },
  };
}
