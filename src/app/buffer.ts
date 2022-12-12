type N = number;


export function multiplexBuffers(buffer1: N[], buffer2: N[]) {
    let t = this.thread.x;
    let width = this.constants.width;
    let l1 = this.constants.l1;
    let l2 = this.constants.l2;
    let l = l1 + l2;
    let z = t % l;
    let x = Math.floor(t % width / l);
    let y = Math.floor(t / (l * width));
    if (t % l < l1) return buffer1[y * width * l1 + x * l1 + z];
    else return buffer2[y * width * l2 + x * l2 + z];
}

export function demultiplexBuffer(buffer: N[], extract: N[], extractLength: N, defaultValues: N[]) {
    let t = this.thread.x;
    let width = this.constants.width;
    let layers = this.constants.layers;
    let z = extract[t % extractLength];
    if (z < 0) return defaultValues[- z - 1];
    let size = this.constants.height * width * layers;
    let x = Math.floor(t % (width * layers) / layers);
    let y = Math.floor(t / (width * layers));
    return buffer[(y * width * layers + x * layers + z) % size];
}

export function limToUnlim(lims: N[]): N {
    let lim = lims[this.thread.x];
    const _SMALL_DELTA = 1e-9;
    return - Math.log(1.0 - lim + _SMALL_DELTA);
}

export function unlimToLim(unlims: N[]): N {
    let unlim = unlims[this.thread.x];
    const _SMALL_DELTA = 1e-9;
    return 1 - Math.exp(- Math.abs(unlim)) - _SMALL_DELTA;
}

export function identity(x: N[]): N {
    if (this.thread.x % 4 == 3) return 1.0;
    return x[this.thread.x];
}
