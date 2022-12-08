type N = number;

export function diffusionKernelFunction(concentrations: N[][], dt: N): N {
    let x = this.thread.x;
    let y = this.thread.y;
    let w = this.constants.width;
    let h = this.constants.height;
    let coefficient = this.constants.coefficient;
    let eulerSteps = this.constants.eulerSteps;
    let c: N = concentrations[x][y];
    let delta: N = calculateDiffusionEffect(
            c,
            concentrations[x][(y - 1) % h],
            concentrations[(x + 1) % w][y],
            concentrations[x][(y + 1) % h],
            concentrations[(x - 1) % w][y],
            coefficient,
            dt,
            eulerSteps
    );
    return c + delta;
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
    let spaceDeriv = (ct + cr + cb + cl - 4.0 * c);
    // Возвращаем домноженную на коэффициент диффузии - получится производная по времени
    return spaceDeriv * diffCoeff;
}
