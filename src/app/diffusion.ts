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


class Field {
    constructor (width: N, height: N, depth: N, values: N[]){};
}

function get2Element(buffer: N[], w: N, h: N, d: N, x: N, y: N, z: N) {
    return buffer[x * h * d + y * d + z];
}


export class DiffusionProcess {
    kernel: any;
    width: N;
    height: N;
    concentrations;
    constructor (initialConcentrations: N[][], params: Diff.DiffusionParams){
        this.width = initialConcentrations.length;
        this.height = initialConcentrations[0].length;
        this.concentrations = initialConcentrations;
        this.kernel = gpu.createKernel(Funcs.diffusionKernelFunction)
            .setConstants({...params, width: this.width, height: this.height})
            .setOutput([this.width, this.height]);
    }
    update(deltaTime: N): N[][] {
        this.concentrations = this.kernel(this.concentrations, deltaTime);
        return this.concentrations;
    }
    static async numbersFromTexture(resource: string): Promise<N[][][]> {
        let img = document.createElement('img');
        img.src = resource;
        await img.decode();
        function convert(img: N[][][]) {
            let value = img[this.thread.y][this.thread.x as any][this.thread.z as any];
            // value = - Math.log(value/value - value);
            return value;
        }
        let kernel = gpu.createKernel(convert)
        .setOutput([img.height, img.width, 4]);
        // .setOutput([4, img.width, img.height]);
        return kernel(img) as N[][][];
    }
}

export class DiffusionProcess2 {
    kernel: any;
    kernelG: any;
    width: N;
    height: N;
    concentrations: PIXI.Sprite;
    constructor (sprite: PIXI.Sprite, params: Diff.DiffusionParams){
        this.width = sprite.width;
        this.height = sprite.height;
        this.concentrations = sprite;
        this.kernel = gpu.createKernel(Funcs.diffusionKernelFunction)
            .setConstants({...params, width: this.width, height: this.height})
            .setOutput([this.width, this.height])
            .setPipeline(true);
        this.kernelG = gpu.createKernel(function(values: N[][]){
            this.color(0.0, 0.0, values[this.thread.x][this.thread.y]);
        }).setGraphical(true);
    }
    update(deltaTime: N): PIXI.Sprite {
        let result = this.kernel(this.concentrations.texture, deltaTime);
        let pixels = this.kernelG(result).getPixels();
        this.concentrations.texture = PIXI.Texture.fromBuffer(pixels, this.width, this.height);
        return this.concentrations;
    }
}

function limToUnlim(lim: N): N {
    const _SMALL_DELTA = 1e-9;
    return - Math.log(1.0 - lim + _SMALL_DELTA);
}

function unlimToLim(unlim: N): N {
    return 1 - Math.exp(-unlim);
}
