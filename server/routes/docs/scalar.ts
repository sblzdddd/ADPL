import type { ApiReferenceConfiguration } from "@scalar/api-reference";
import { eventHandler } from "h3";

// Served as /_scalar
export default eventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const title = runtimeConfig.nitro.openAPI?.meta?.title || "API Reference";
  const description = runtimeConfig.nitro.openAPI?.meta?.description || "";
  const openAPIEndpoint = "/docs/openapi";

  // https://github.com/scalar/scalar
  const _config = runtimeConfig.nitro.openAPI?.ui
    ?.scalar as ApiReferenceConfiguration;
  const scalarConfig: ApiReferenceConfiguration = {
    ..._config,
    url: openAPIEndpoint,
    // @ts-expect-error spec is not in the type
    spec: { url: openAPIEndpoint, ..._config?.spec },
  };

  // The default page title

  return /* html */ `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${description}" />
        <title>${title}</title>
      </head>
      <body>
             <style>
         body {
           position: relative;
           margin: 0;
           padding: 0;
           min-height: 100vh;
         }

         .overlay-left, .overlay-right{
            image-rendering: pixelated;
            filter: grayscale(0.75);
            height: 100%;
            width: auto;
            opacity: 0.1;
            pointer-events: none;
            z-index: 1000;
            position: fixed;
         }
         
         .overlay-left {
         transform: rotate(180deg);
           top: 0;
           left: -40px;
         }
         
         .overlay-right {
           bottom: 0;
           right: 0;
         }
       </style>
       
       <img src="https://iili.io/Kdxqi8P.png" alt="Left Overlay" class="overlay-left">
       <img src="https://iili.io/Kdob0sn.png" alt="Right Overlay" class="overlay-right">
        <script
          id="api-reference"
          data-configuration="${JSON.stringify(scalarConfig)
            .split('"')
            .join("&quot;")}"
        ></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>`;
});
defineRouteMeta({
  openAPI: {
    tags: ["Docs"],
    description: "scalar UI documentation for the BakaAPI",
    responses: {
      '200': {
        description: 'OK'
      }
    }
  }
})
