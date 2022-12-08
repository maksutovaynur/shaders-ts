varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 diffusionCoefficient;
uniform int diffusionEulerSteps = 3;
uniform float gridStep;
uniform float deltaTime;

vec3 calculateDiffusionSpeed(vec3 c, ct, cr, cb, cl, diffCoeff, float gridStep) {
    // Вычисляем дивергенцию концентрации вещества
    vec3 spaceDeriv = (ct + cr + cb + cl - 4 * c) / gridStep / gridStep;
    // Возвращаем домноженную на коэффициент диффузии - получится производная по времени
    return spaceDeriv * diffCoeff;
}

vec3 getDiffusionStep(vec3 c, ct, cr, cb, cl, diffCoeff, float deltaTime, gridStep, int iterations) {
    // Реализует итеративно неявный метод Эйлера. При iterations == 1 получаем явный метод.
    vec3 cCurrent = c;
    for(int i = 0; i < iterations; i ++){
        vec3 diffSpeed = calculateDiffusionSpeed(cCurrent, ct, cr, cb, cl, diffCoeff, gridStep);
        cCurrent = c + diffSpeed * deltaTime;
    }
    return cCurrent - c;
}

vec3 getDiffusion(sampler2D texture) {
    vec2 horizontalStep = vec2(gridStep, 0);
    vec2 verticalStep = vec2(0, gridStep);

    vec3 c = texture2D(texture, vTextureCoord);
    vec3 ct = texture2D(texture, vTextureCoord - verticalStep);
    vec3 cr = texture2D(texture, vTextureCoord + horizontalStep);
    vec3 cb = texture2D(texture, vTextureCoord + verticalStep);
    vec3 cl = texture2D(texture, vTextureCoord - horizontalStep);
    vec3 cDelta = getDiffusionStep(c, ct, cr, cb, cl, diffusionCoefficient, 
        deltaTime, gridStep, diffusionEulerSteps);
    return c + deltaTime;
}

void main(void){
    gl_FragColor = getDiffusion(uSampler);
}