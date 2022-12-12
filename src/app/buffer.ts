type N = number;


export function demultiplexBuffer(buffer: N[], extract: N[], extractLength: N, defaultValues: N[]) {
    let t = this.thread.x;
    let z = extract[t % extractLength];
    if (z < 0) return defaultValues[-z - 1];

    let w = this.constants.width;
    let h = this.constants.height;
    let l = this.constants.layers;

    let x = Math.floor(t % (w * l) / l);
    let y = Math.floor(t / (w * l));
    return buffer[y * w * l + x * l + z];
}

export function limToUnlim(lims: N[]): N {
    let lim = lims[this.thread.x];
    return - Math.log(1.0 - lim);
}

export function unlimToLim(unlims: N[]): N {
    let unlim = unlims[this.thread.x];
    return 1 - Math.exp(-Math.abs(unlim));
}

export function identity(x: N[]): N {
    return x[this.thread.x];
}
