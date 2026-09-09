import Debugger from '../debugger.ts';
import messagePackDebugSymbols from '../debugSymbols/messagePack.ts';

const debug = new Debugger(messagePackDebugSymbols);

export default function debugMessagePack(buffer: Uint8Array): string {
  return debug.debugToString(buffer);
}
