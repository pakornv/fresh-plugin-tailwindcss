# Tailwind CSS v4 plugin for Fresh

An unofficial Tailwind CSS v4 plugin to use in Fresh.

```ts
// fresh.config.ts

import { defineConfig } from "$fresh/server.ts";
import tailwind from "@pakornv/fresh-plugin-tailwindcss";

export default defineConfig({
  plugins: [tailwind()],
});
```

## Credits

- [Fresh](https://github.com/denoland/fresh) The project that inspired this
  package.
