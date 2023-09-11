#!/bin/bash

set -euox pipefail

bun run src/compile.ts && \
tsc && \
vite build --config vite.ssr.config.ts && \
vite build --config vite.hydration.config.ts && \
vite build --config vite.site.config.ts && \
terser -c -m --module dist-ssr/ssr.js > dist-ssr/ssr.min.js && \
terser -c -m --module dist-hydration/hydration.js > dist-hydration/hydration.min.js &&
javy compile dist-ssr/ssr.min.js -o dist-ssr/ssr.wasm --wit src/ssr.wit -n index-world
