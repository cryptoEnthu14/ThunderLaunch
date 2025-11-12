const warn = (method = 'mobile wallet adapter') => {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[solana-mobile] ${method} is unavailable in this build.`);
  }
};

class BaseMobileWalletAdapter {
  constructor(config = {}) {
    this.name = SolanaMobileWalletAdapterWalletName;
    this._config = config;
    this._listeners = new Map();
  }

  async connect() {
    warn('connect');
    throw new Error('Solana Mobile Wallet Adapter is not available in this environment.');
  }

  async autoConnect() {
    return this.connect();
  }

  async disconnect() {
    this._listeners.clear();
  }

  on(event, listener) {
    const listeners = this._listeners.get(event) || new Set();
    listeners.add(listener);
    this._listeners.set(event, listeners);
  }

  off(event, listener) {
    const listeners = this._listeners.get(event);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) {
      this._listeners.delete(event);
    }
  }
}

export const SolanaMobileWalletAdapterWalletName = 'Solana Mobile Wallet Adapter';
export const SolanaMobileWalletAdapterRemoteWalletName = 'Solana Mobile Wallet Adapter (Remote)';

export class SolanaMobileWalletAdapter extends BaseMobileWalletAdapter {}
export class LocalSolanaMobileWalletAdapter extends BaseMobileWalletAdapter {}
export class RemoteSolanaMobileWalletAdapter extends BaseMobileWalletAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SolanaMobileWalletAdapterRemoteWalletName;
  }
}

export function createDefaultAddressSelector() {
  return async () => null;
}

export function createDefaultAuthorizationResultCache() {
  let cache = null;
  return {
    get: () => cache,
    set: (value) => {
      cache = value ?? null;
    },
    clear: () => {
      cache = null;
    },
  };
}

export function createDefaultWalletNotFoundHandler() {
  return () => warn('wallet not found handler');
}
