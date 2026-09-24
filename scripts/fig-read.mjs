// Shared .fig decoding: zip -> canvas.fig -> "fig-kiwi" header + [schema, message] chunks
import fs from 'node:fs';
import { unzipSync, inflateSync } from 'fflate';
import { decompress as zstdDecompress } from 'fzstd';
import * as kiwi from 'kiwi-schema';

export function readFig(file) {
  const zip = unzipSync(fs.readFileSync(file));
  const canvas = Buffer.from(zip['canvas.fig']);
  const meta = zip['meta.json'] ? JSON.parse(Buffer.from(zip['meta.json']).toString('utf8')) : {};
  if (canvas.subarray(0, 8).toString() !== 'fig-kiwi') throw new Error('canvas.fig is not a fig-kiwi file');

  const chunks = [];
  for (let o = 12; o < canvas.length; ) {
    const len = canvas.readUInt32LE(o);
    chunks.push(canvas.subarray(o + 4, o + 4 + len));
    o += 4 + len;
  }
  const inflate = (c) => (c[0] === 0x28 && c[1] === 0xb5 ? zstdDecompress(c) : inflateSync(c));
  const schema = kiwi.compileSchema(kiwi.decodeBinarySchema(inflate(chunks[0])));
  const message = schema.decodeMessage(inflate(chunks[1]));
  return { nodes: message.nodeChanges, blobs: message.blobs ?? [], meta };
}

export const guid = (g) => (g ? `${g.sessionID}:${g.localID}` : null);
