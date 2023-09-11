declare namespace Javy {
  namespace IO {
    function writeSync(fileDescriptor: number, buffer: Uint8Array);
    function readSync(fileDescriptor: number, buffer: Uint8Array);
  }
}
