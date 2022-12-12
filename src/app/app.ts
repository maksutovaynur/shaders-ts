import * as PIXI from 'pixi.js';
import * as Ev from '@pixi/events';
import * as Diffusion from './diffusion';
import { Sprite } from 'pixi.js';
import { allowedNodeEnvironmentFlags } from 'process';
const initPicture = require('../assets/startingPoint.png');
delete PIXI.Renderer.__plugins.interaction;
type N = number;


export default function createApp(parent: HTMLElement | null) {
    // parent.clientWidth, parent.clientHeight;
    if (!parent) return;
    const app = new PIXI.Application({
        resizeTo: parent,
        view: parent as HTMLCanvasElement,
        backgroundColor: 0x30cfff
    });
    if (!('events' in app.renderer))
        app.renderer.addSystem(Ev.EventSystem, 'events');
    let { width: w, height: h } = app.screen;
    let d = 4;

    let grid = Diffusion.Grid2D.genRandom(200, 150, 4, (x: N, y: N , z: N) => {
        return 0.01 + 0.1 * Math.pow(Math.random(), 12);
    });
    let diff = new Diffusion.DiffusionProcess(
        grid,
        new Diffusion.DiffusionParams(0.003, 5)
    );
    let canvas = createCanvas(w, h, diff.getTexture([0]));
    let text = createInfoText(w, h);
    app.stage.addChild(canvas);
    app.stage.addChild(text);
    // app.stage.addListener('mousedown')

    let mouse = {active: false, x: 0, y: 0};
    canvas.interactive = true;
    canvas.addListener('pointerdown', function(event: any) {
        mouse.active = true;
        mouse.x = event.data.x;
        mouse.y = event.data.y;
    });
    canvas.addListener('pointerup', function(event: any) {
        mouse.active = false;
    });
    canvas.addListener('pointermove', function(event: any) {
        mouse.x = event.data.x;
        mouse.y = event.data.y;
    });
    console.log(`canvas=${Object.keys(canvas)}`);
    app.ticker.maxFPS = 60;
    console.log(`Image shape d=${d}, h=${h}, w=${w}`);
    let i = 0;
    let start = performance.now();
    let prev = start;
    app.ticker.add((deltaFrame: N) => {
        const delta = app.ticker.deltaMS;
        let now = performance.now();
        if (mouse.active) {
            diff.putSubstance(
                1.1 * delta, 
                Math.floor(mouse.x * grid.width / canvas.width), 
                Math.floor(mouse.y * grid.height / canvas.height), 
                2
            );
        }
        updateInfoText(text, delta);
        prev = now;        
        if (i % 60 == 0)
            console.log(`
                typeof r[0]=${grid.buffer[0].constructor.name}, 
                typeof r=${grid.buffer.constructor.name},
                r[0]=${grid.buffer[0]}
                `);
        const IT = 3;
        for (let k = 0; k < IT; k++) {
            diff.update(delta / IT);
        }
        canvas.texture = diff.getTexture([0, 1, 2]);
        i += 1;
    });

}

function updateInfoText(text: PIXI.Text, deltaTime: N) {
    let fps = PIXI.Ticker.shared.FPS;
    text.text = `FPS=${fps.toFixed(1)}, dt=${deltaTime.toFixed(1)}ms`;
}

function createInfoText(w: number, h: number) {
    let text = new PIXI.Text('FPS: ');
    text.x = 0;
    text.y = 0;
    text.style = {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: '#FFFFFF'
    }
    return text;
}

function createCanvas(w: number, h: number, texture: PIXI.Texture): PIXI.Sprite {
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
