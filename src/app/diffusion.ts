import * as PIXI from 'pixi.js';
import * as GPU from 'gpu.js';
import * as Diff from './diffusion';
import * as Grid from './grid';
import { getRandomValues } from 'crypto';
type N = number;

const gpu = new GPU.GPU();
gpu.addFunction(calculateDiffusionEffect);
gpu.addFunction(calculateDiffusionSpeed);
gpu.addFunction(flatten);


export class DiffusionParams {constructor(
    public coefficient: number,
    public eulerSteps: number,
    public distructionSpeed: number = 0.0,
){}};


export class DiffusionProcess extends Grid.GridProcess<DiffusionParams> {
    mainKernelFunction = diffusionKernelFunction as GPU.KernelFunction;
    gpu = gpu;
    putSubstance(value: N, x: N, y: N, z: N) {
        this.grid.setData(value, x, y, z)
    }
}

export function diffusionKernelFunction(concentrations: N[], deltaSeconds: N): N {
    let w = this.constants.width;
    let h = this.constants.height;
    let l = this.constants.layers;

    let t = Math.floor(this.thread.x);
    let x = Math.floor(t % (w * l) / l);
    let y = Math.floor(t / (w * l));
    let z = t % l;

    let c: N = concentrations[t];
    let delta: N = calculateDiffusionEffect(
            c,
            concentrations[flatten(x, y - 1, z, w, h, l)],
            concentrations[flatten(x + 1, y, z, w, h, l)],
            concentrations[flatten(x, y + 1, z, w, h, l)],
            concentrations[flatten(x - 1, y, z, w, h, l)],
            this.constants.coefficient,
            deltaSeconds,
            this.constants.eulerSteps
    );
    let newC = c + delta;

    newC = newC * Math.exp(- deltaSeconds * this.constants.distructionSpeed);
    return newC;
}


export function flatten(x: N, y: N, z: N, w: N, h: N, l: N): N {
    x = Math.max(Math.min(w - 1, x), 0);
    y = Math.max(Math.min(h - 1, y), 0);
    z = Math.max(Math.min(l - 1, z), 0);
    return y % h * w * l + x % w * l + z % l;
}

export function calculateDiffusionEffect(
    c: N, ct: N, cr: N, cb: N, cl: N, 
    diffCoeff: N, deltaTime: N, eulerSteps: N
): N {
    let cCurrent = c;
    for(let i = 0; i < eulerSteps; i ++){
        let diffSpeed = calculateDiffusionSpeed(
            cCurrent, ct, cr, cb, cl, 
            diffCoeff
        );
        cCurrent = Math.max(c + diffSpeed * deltaTime, 0.0);
    }
    return cCurrent - c;
}

export function calculateDiffusionSpeed(
    c: N, ct: N, cr: N, cb: N, cl: N, diffCoeff: N
): N {
    // Вычисляем дивергенцию концентрации вещества
    let spaceDeriv = - 4.0 * c + ct + cr + cb + cl;
    // Возвращаем домноженную на коэффициент диффузии - получится производная по времени
    return spaceDeriv * diffCoeff;
}

