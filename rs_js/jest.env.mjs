// jest.env.mjs
import { TextEncoder, TextDecoder } from 'node:util';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;