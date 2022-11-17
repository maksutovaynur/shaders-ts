import * as PIXI from 'pixi.js';
let shader_vert = require('../shaders/mand.vert');
let shader_frag = require('../shaders/mand.frag');
let paletteSrc = require("../assets/pal.png");


function loadGeometry(w: number, h: number, worldScale = 1, colorScale = 1) {
    const X = w / 2, Y = h / 2;
    const wX = X * worldScale, wY = Y * worldScale;
    const cX = X * colorScale, cY = Y * colorScale;
    return new PIXI.Geometry()
        .addAttribute('aVertexPosition', [-X, -Y, X, -Y, X, Y, -X, Y], 2)
        .addAttribute('aColor', [0, 0, 0, /**/ cX, 0, 0, /**/ cX, cY, 0, /**/ 0, cY, 0], 3)
        .addAttribute('aUvs', [-wX, -wY, wX, -wY, wX, wY, -wX, wY], 2)
        .addIndex([0, 1, 2, 0, 2, 3]);
}

class Fractal {
    constructor(public shape: PIXI.Mesh<PIXI.Shader>, public params: any){}
}

export default function createFractal(
    x: number, 
    y: number, 
    minscale = 0.01, 
    shaderIter=128
): Fractal {
    const scale = 2 / Math.min(x, y);
    const uniform = {
        tex: PIXI.Texture.from(paletteSrc),
        scale: {type: 'v2', value: {x: 1.0, y: 1.0}},
        center: {type: 'v2', value: {x: 0.0, y: 0.0}},
    }
    const shape = new PIXI.Mesh(
        loadGeometry(x / minscale, y / minscale, scale, scale * minscale),
        loadShader(uniform, shaderIter)
    );
    shape.position.set(x / 2, y / 2);
    shape.scale.set(minscale);
    return new Fractal(shape, uniform);
}

function loadShader(uniform: any, iter: number = 5): PIXI.Shader {
    const fragSrc = shader_frag.replace("{iter}", iter);
    const vertSrc = shader_vert;
    return PIXI.Shader.from(vertSrc, fragSrc, uniform);
}
