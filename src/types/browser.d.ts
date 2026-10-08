interface ClientFingerprint {
    getFingerprint(): number;
    isIE(): boolean;
    isChrome(): boolean;
    isFirefox(): boolean;
    isSafari(): boolean;
    isOpera(): boolean;
    getDeviceVendor(): string | undefined;
    getDevice(): string | undefined;
    getOS(): string | undefined;
    getOSVersion(): string | undefined;
    getBrowser(): string | undefined;
    getBrowserVersion(): string | undefined;
}

interface Window {
    ClientJS: new () => ClientFingerprint;
    msCrypto?: Crypto;
    clipboardData?: { setData(format: string, value: string): void };
}

declare module '*.jpg' {
    const url: string;
    export default url;
}
declare module '*.png' {
    const url: string;
    export default url;
}
declare module '*.svg' {
    const url: string;
    export default url;
}
