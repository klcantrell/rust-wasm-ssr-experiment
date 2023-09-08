import { renderToString } from "react-dom/server";

import App, { AppProps } from "./App";

function readInput<T>() {
  const chunkSize = 1024;
  const inputChunks = [];
  let totalBytes = 0;

  // Read all the available bytes
  // eslint-disable-next-line no-constant-condition
  while (1) {
      const buffer = new Uint8Array(chunkSize);
      // Stdin file descriptor
      const fd = 0;
      const bytesRead = Javy.IO.readSync(fd, buffer);

      totalBytes += bytesRead;
      if (bytesRead === 0) {
          break;
      }
      inputChunks.push(buffer.subarray(0, bytesRead)) as T;
  }

  // Assemble input into a single Uint8Array
  const { finalBuffer } = inputChunks.reduce((context, chunk) => {
      context.finalBuffer.set(chunk, context.bufferOffset);
      context.bufferOffset += chunk.length;
      return context;
  }, { bufferOffset: 0, finalBuffer: new Uint8Array(totalBytes) });

  return JSON.parse(new TextDecoder().decode(finalBuffer));
}

export function ssr() {
  const props = readInput<AppProps>();
  const encodedOutput = new TextEncoder().encode(renderToString(<App {...props} />));
  const buffer = new Uint8Array(encodedOutput);
  Javy.IO.writeSync(1, buffer);
}
