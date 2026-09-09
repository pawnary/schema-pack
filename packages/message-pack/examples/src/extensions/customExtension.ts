import assert from 'node:assert';

import {
  Decoder,
  Encoder,
  type ExtensionEncoder,
  type MessagePackDecoder,
  type MessagePackExtension,
} from '@schema-pack/message-pack';

class Point {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class PointExtension<
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackExtension<Point, TBuffer> {
  readonly type = 10;
  readonly constructors = Point;

  encode(value: Point, encoder: ExtensionEncoder<TBuffer>): void {
    encoder.write(value.x).write(value.y);
  }

  decode(decoder: MessagePackDecoder<TBuffer>): Point {
    const x = decoder.nextValue<number>();
    const y = decoder.nextValue<number>();

    return new Point(x, y);
  }
}

const encoder = new Encoder();
const decoder = new Decoder();
const extension = new PointExtension();

encoder.addExtension(extension);
decoder.addExtension(extension);

const point = new Point(1, 2);

const buffer = encoder.write(point).flush();
const decoded = decoder.decode(buffer);

console.log({ buffer, decoded, point });

assert.deepStrictEqual(
  decoded,
  point,
  'Decoded point does not match the original point',
);
