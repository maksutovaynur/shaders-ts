precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 diffusionCoefficient;
uniform float gridStep;
uniform float deltaTime;

const int diffusionEulerSteps = 3;
const float minPrec = 1e-9;


vec4 calculateDiffusionSpeed(
    vec4 c, vec4 ct, vec4 cr, vec4 cb, vec4 cl, vec4 diffCoeff, float gridStep
) {
    // Вычисляем дивергенцию концентрации вещества
    vec4 spaceDeriv = (ct + cr + cb + cl - 4.0 * c) / gridStep / gridStep;
    // Возвращаем домноженную на коэффициент диффузии - получится производная по времени
    return spaceDeriv * diffCoeff;
}

vec4 getUnlimValue(sampler2D texture, vec2 coord) {
    vec4 value = texture2D(texture, coord);
    vec4 p = 1.0 - value + minPrec;
    return -log(p);
}

vec4 limValue(vec4 unlimited) {
    vec4 e = exp(- unlimited);
    return 1.0 - e;
}

vec4 getDiffusion(sampler2D texture) {
    vec2 horizontalStep = vec2(gridStep, 0);
    vec2 verticalStep = vec2(0, gridStep);
    vec4 c = getUnlimValue(texture, vTextureCoord);
    vec4 ct = getUnlimValue(texture, vTextureCoord - verticalStep);
    vec4 cr = getUnlimValue(texture, vTextureCoord + horizontalStep);
    vec4 cb = getUnlimValue(texture, vTextureCoord + verticalStep);
    vec4 cl = getUnlimValue(texture, vTextureCoord - horizontalStep);

    vec4 cCurrent = c;
    for(int i = 0; i < diffusionEulerSteps; i ++){
        vec4 diffSpeed = calculateDiffusionSpeed(
            cCurrent, ct, cr, cb, cl, 
            diffusionCoefficient, gridStep
        );
        cCurrent = c + diffSpeed * deltaTime;
    }
    vec4 deltaC = cCurrent - c;
    vec4 result = limValue(c + deltaC);
    result.w = 1.0;
    return result;
}

void main(void){
    gl_FragColor = getDiffusion(uSampler);
}