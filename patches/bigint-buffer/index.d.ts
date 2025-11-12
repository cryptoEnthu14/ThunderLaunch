/// <reference types="node" />

export function toBigIntLE(buf: Buffer): bigint;
export function toBigIntBE(buf: Buffer): bigint;
export function toBufferLE(num: bigint | number, width: number): Buffer;
export function toBufferBE(num: bigint | number, width: number): Buffer;
