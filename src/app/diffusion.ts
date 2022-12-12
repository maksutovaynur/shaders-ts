import * as PIXI from 'pixi.js';
import * as GPU from 'gpu.js';
import * as Funcs from './diffusionFunctions';
import * as Diff from './diffusion';
import * as Grid from './grid';
import { getRandomValues } from 'crypto';
type N = number;

const gpu = new GPU.GPU();
gpu.addFunction(Funcs.calculateDiffusionEffect);
gpu.addFunction(Funcs.calculateDiffusionSpeed);


export class DiffusionParams {constructor(
    public coefficient: number,
    public eulerSteps: number,
    public distructionSpeed: number = 0.0,
){}};


export class DiffusionProcess extends Grid.GridProcess<DiffusionParams> {
    kernelFunction = Funcs.diffusionKernelFunction as GPU.KernelFunction;
    gpu = gpu;
    putSubstance(value: N, x: N, y: N, z: N) {
        this.grid.setData(value, x, y, z)
    }
}


