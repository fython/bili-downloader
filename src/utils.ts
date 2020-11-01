export function bytesToMBytesText(n: number): string {
    return `${(n/1024/1024).toFixed(2)}MB`;
}

export function bytesToSpeedText(n: number): string {
    if (n < 1024) {
        return `${n}B/s`;
    } else if (n < 1024 * 1024) {
        return `${(n/1024).toFixed(2)}KB/s`;
    } else {
        return `${(n/1024/1024).toFixed(2)}MB/s`;
    }
}

export function percentText(current: number, max: number): string {
    return `${(current/max*100).toFixed(2)}%`;
}

export function escapeDirName(name: string): string {
    return name.replace(/\//g, '_')
        .replace(/ /g, '_')
        .replace(/\\/g, '_');
}
