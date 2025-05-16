# Tailwind CSS v4 plugin for Fresh

An unofficial Tailwind CSS v4 plugin to use in Fresh.

## Installation

Add `"nodeModulesDir": "auto"` to your deno.json file and

```sh
deno add --allow-scripts jsr:@pakornv/fresh-plugin-tailwindcss@2.0.0-alpha.1
```

## Usage

```ts
// dev.ts

import { tailwind } from "@pakornv/fresh-plugin-tailwindcss";

import { Builder } from "fresh/dev";
import { app } from "./main.ts";

const builder = new Builder();
tailwind(builder, app);
if (Deno.args.includes("build")) {
  await builder.build(app);
} else {
  await builder.listen(app);
}
```

## Credits

- [Fresh](https://github.com/denoland/fresh) The project that inspired this
  package.
