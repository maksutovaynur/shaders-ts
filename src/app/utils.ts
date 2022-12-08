import * as PIXI from 'pixi.js';
import { BaseRenderTexture, RenderTexture, spritesheetAsset, Texture } from 'pixi.js';

const renderer = PIXI.autoDetectRenderer();

export class TextureUpdater<U extends object> {
    filter: PIXI.Filter;
    public uniforms: U;
    constructor (
        vertShader: string | undefined,
        fragShader: string | undefined,
        uniforms: U
    ){
        this.uniforms = uniforms;
        this.filter = new PIXI.Filter(vertShader, fragShader, this.uniforms);
    };
    update(texture: PIXI.Texture, targetWidth: number, targetHeight: number): PIXI.Texture {
        let {width: w, height: h} = {width: targetWidth, height: targetHeight};
        let renderTexture = PIXI.RenderTexture.create({ width: w, height: h});
        // let renderTexture = PIXI.RenderTexture();
        let sprite = createCanvas(w, h, texture);
        sprite.filters = [ this.filter ];
        renderer.render(sprite, {renderTexture});
        // return texture;
        return PIXI.Texture.from(renderTexture.baseTexture);
    }
}


export function createCanvas(w: number, h: number, texture: PIXI.Texture): PIXI.Sprite {
    let canvas = PIXI.Sprite.from(texture);
    canvas.anchor.set(0.5);
    canvas.x = w / 2;
    canvas.y = h / 2;
    canvas.width = w;
    canvas.height = h;
    
    console.log(`sprite[w=${canvas.width}, ${canvas.height}]`);
    console.log(`texture[w=${texture.width}, ${texture.height}]`);
    return canvas;
}
