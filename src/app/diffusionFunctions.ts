type N = number;

export function diffusionKernelFunction(concentrations: N[], dt: N): N {
    let w = this.constants.width;
    let h = this.constants.height;
    let l = this.constants.layers;
    let size = w * h * l;
    let t = this.thread.x;
    let coefficient = this.constants.coefficient;
    let eulerSteps = this.constants.eulerSteps;
    let c: N = concentrations[t];
    let delta: N = calculateDiffusionEffect(
            c,
            concentrations[(t - w * l) % size],
            concentrations[(t + l) % size],
            concentrations[(t + w * l) % size],
            concentrations[(t - l) % size],
            coefficient,
            dt,
            eulerSteps
    );
    let newC = c + delta;
    if (newC < 0) newC = 0.0;
    return newC;
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
        cCurrent = c + diffSpeed * deltaTime;
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
