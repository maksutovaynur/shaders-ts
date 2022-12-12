import * as PIXI from 'pixi.js';
import * as GPU from 'gpu.js';
import * as Funcs from './diffusionFunctions'
import * as Diff from './diffusion'
import { getRandomValues } from 'crypto';
type N = number;

const gpu = new GPU.GPU();
gpu.addFunction(Funcs.calculateDiffusionEffect);
gpu.addFunction(Funcs.calculateDiffusionSpeed);
gpu.addFunction(limToUnlim);
gpu.addFunction(unlimToLim);


export class DiffusionParams {constructor(
    public coefficient: number,
    public eulerSteps: number
){}};


export class Grid2D {
    constructor (public buffer: Float32Array, public width: N, public height: N, public layers: N){};
    size(): N {
        return this.width * this.height * this.layers;
    }
    static genRandom(width: N, height: N, layers: N, func: Function | null = null): Grid2D {
        return new Grid2D(Grid2D.genRandomBuffer(width, height, layers, func), width, height, layers);
    }
    static genRandomBuffer(width: N, height: N, layers: N, func: Function | null = null): Float32Array {
        let arr = Array.from({ length: width * height * layers });
        function funk(x: N, y: N, z: N){
            if (z == 3) return 1.0;
            return 0.5 + 0.5 * Math.pow(Math.random(), 12);
        }
        function func_flat(e: any, i: N){
            return (func || funk)(
                Math.floor(i % (width * layers) / layers),
                Math.floor(i / (width * layers)), 
                i % layers
            )
        }
        return new Float32Array(arr.map(func_flat));
    }
    toTexture(): PIXI.Texture {
        let tex = PIXI.Texture.fromBuffer(this.buffer, this.width, this.height);
        tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        return tex;
    }
    setData(value: N, x: N, y: N, z: N) {
        let pos = y * this.width * this.layers + x * this.layers + z;
        if (pos >= this.size() || pos < 0) return;
        this.buffer.set([value], pos);
    }
}


export class DiffusionProcess {
    kernel: any;
    toOutput: any;
    fromColor: any;
    grid: Grid2D;
    constructor (grid: Grid2D, params: Diff.DiffusionParams){
        this.grid = grid;
        // this.fromColor = gpu.createKernel(limToUnlim).setOutput([size]).setPipeline(true);
        this.kernel = gpu.createKernel(Funcs.diffusionKernelFunction)
            .setConstants({...params, width: grid.width, height: grid.height, layers: grid.layers})
            .setOutput([grid.size()]).setPipeline(true);
        this.toOutput = gpu.createKernel(identity).setOutput([grid.size()]);
    }
    putSubstance(value: N, x: N, y: N, z: N) {
        this.grid.setData(value, x, y, z)
    }
    update(deltaTime: N): Float32Array {
        let data = this.grid.buffer;
        // data = this.fromColor(data);
        data = this.kernel(data, deltaTime);
        data = this.toOutput(data);
        this.grid.buffer = data;
        return this.grid.buffer;
    }
}

function multiplexBuffers(buffer1: N[], buffer2: N[]) {
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


function demultiplexBuffer(buffer: N[]) {
    let t = this.thread.x;
    let width = this.constants.width;
    let layers = this.constants.layers;
    let extract: N[] = this.constants.extract;
    let z = extract[t % extract.length];
    let x = Math.floor(t % width / layers);
    let y = Math.floor(t / (layers * width));
    return buffer[y * width * layers + x * layers + z];
}


function limToUnlim(lims: N[]): N {
    let lim = lims[this.thread.x];
    const _SMALL_DELTA = 1e-9;
    return - Math.log(1.0 - lim + _SMALL_DELTA);
}

function unlimToLim(unlims: N[]): N {
    let unlim = unlims[this.thread.x];
    const _SMALL_DELTA = 1e-9;
    return 1 - Math.exp(-unlim) - _SMALL_DELTA;
}

function identity(x: N[]): N {
    if (this.thread.x % 4 == 3) return 1.0;
    return x[this.thread.x];
}