'use strict';

function assertBuffer(buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('Expected a Buffer instance');
  }
}

function assertWidth(width) {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('`width` must be a non-negative integer');
  }
}

function normalizeBigInt(value) {
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new RangeError('Number value must be finite');
    }
    return BigInt(value);
  }
  throw new TypeError('Expected a bigint or number');
}

function toBigIntLE(buf) {
  assertBuffer(buf);
  if (buf.length === 0) {
    return 0n;
  }

  let result = 0n;
  for (let i = buf.length - 1; i >= 0; i -= 1) {
    result = (result << 8n) + BigInt(buf[i]);
  }
  return result;
}

function toBigIntBE(buf) {
  assertBuffer(buf);
  if (buf.length === 0) {
    return 0n;
  }

  let result = 0n;
  for (let i = 0; i < buf.length; i += 1) {
    result = (result << 8n) + BigInt(buf[i]);
  }
  return result;
}

function toBufferLE(value, width) {
  assertWidth(width);
  const num = normalizeBigInt(value);
  const buffer = Buffer.alloc(width);
  let remaining = num;

  for (let i = 0; i < width; i += 1) {
    buffer[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  if (remaining !== 0n) {
    throw new RangeError('Number does not fit in the specified width');
  }

  return buffer;
}

function toBufferBE(value, width) {
  assertWidth(width);
  const num = normalizeBigInt(value);
  const buffer = Buffer.alloc(width);
  let remaining = num;

  for (let i = width - 1; i >= 0; i -= 1) {
    buffer[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  if (remaining !== 0n) {
    throw new RangeError('Number does not fit in the specified width');
  }

  return buffer;
}

module.exports = {
  toBigIntLE,
  toBigIntBE,
  toBufferLE,
  toBufferBE,
};
