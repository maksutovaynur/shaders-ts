import * as PIXI from 'pixi.js';
import * as GPU from 'gpu.js';
import * as Buf from './buffer';

type N = number;


export class Grid2D {
    constructor (public buffer: Float32Array, public width: N, public height: N, public layers: N){};
    size(): N {
        return this.width * this.height * this.layers;
    }
    size2D(): N {
        return this.width * this.height;
    }
    static genRandom(width: N, height: N, layers: N, func: Function | null = null): Grid2D {
        width = Math.floor(width); height = Math.floor(height); layers = Math.floor(layers);
        return new Grid2D(Grid2D.genRandomBuffer(width, height, layers, func), width, height, layers);
    }
    static genRandomBuffer(width: N, height: N, layers: N, func: Function | null = null): Float32Array {
        width = Math.floor(width); height = Math.floor(height); layers = Math.floor(layers);
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
    setData(value: N, x: N, y: N, z: N) {
        let pos = y * this.width * this.layers + x * this.layers + z;
        if (pos >= this.size() || pos < 0) return;
        this.buffer.set([value], pos);
    }
}


export abstract class GridProcess<Params extends object> {
    public grid: Grid2D;
    public parameters: Params;

    private mainKernel: any;
    private mainAdapterKernel: any;
    private clampKernel: any;
    private colorOutputKernel: any;
    private rawOutputKernel: any;
    private mainData: any;

    abstract mainKernelFunction: GPU.KernelFunction;
    abstract gpu: GPU.GPU;

    public constructor(grid: Grid2D, parameters: Params) {
        this.grid = grid;
        this.parameters = parameters;
    }

    build() {
        // This is mandatory to call before usage
        let {width, height, layers} = this.grid;
        this.mainKernel = this.gpu.createKernel(this.mainKernelFunction)
            .setConstants({...this.parameters, width, height, layers})
            .setOutput([this.grid.size()])
            .setPipeline(true);
        this.rawOutputKernel = this.gpu.createKernel(Buf.identity)
            .setOutput([this.grid.size()]);
        this.mainAdapterKernel = this.gpu.createKernel(Buf.identity)
            .setOutput([this.grid.size()])
            .setPipeline(true);
        this.clampKernel = this.gpu.createKernel(Buf.unlimToLim)
            .setOutput([this.grid.size()])
            .setPipeline(true);
        this.colorOutputKernel = this.gpu.createKernel(Buf.demultiplexBuffer)
            .setConstants({width, height, layers})
            .setOutput([this.grid.size2D() * 4]);
        this.mainData = this.grid.buffer;
    }
    update(deltaSeconds: N, iterations: N, ...args: any[]): Float32Array {
        this.mainData = this.grid.buffer
        for (let i = 0; i < iterations; i++) {
            let buffer = this.mainAdapterKernel(this.mainData);
            this.mainData = this.mainKernel(buffer, deltaSeconds / iterations, ...args);
        }
        this.grid.buffer = this.rawOutputKernel(this.mainData);
        return this.grid.buffer;
    }
    getTexture(layers: N[], defaultValues: N[] = [1.0, 1.0, 1.0, 1.0]): PIXI.Texture {
        if (layers.length < 4) {
            for (let i = layers.length; i < 4; i++) {layers.push(-1);}
        } else if (layers.length > 4) layers.length = 4;
        let clampedData = this.clampKernel(this.mainData)
        let buffer = this.colorOutputKernel(clampedData, layers, 4, defaultValues);
        let tex = PIXI.Texture.fromBuffer(buffer, this.grid.width, this.grid.height);
        tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        return tex;
    }
}
