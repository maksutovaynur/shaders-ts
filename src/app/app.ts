import * as PIXI from 'pixi.js';
import * as Ev from '@pixi/events';
import * as Diffusion from './diffusion';
import * as Grid from './grid';
import { Sprite } from 'pixi.js';
import { allowedNodeEnvironmentFlags } from 'process';

delete PIXI.Renderer.__plugins.interaction;
type N = number;


export default function createApp(parent: HTMLElement | null) {
    if (!parent) return;
    const app = new PIXI.Application({
        resizeTo: parent,
        view: parent as HTMLCanvasElement,
        backgroundColor: 0x000000
    });
    if (!('events' in app.renderer))
        app.renderer.addSystem(Ev.EventSystem, 'events');
    let { width: w, height: h } = app.screen;
    let d = 4;
    const CELL_SIZE = 10;

    let grid = Grid.Grid2D.genRandom(w / CELL_SIZE, h / CELL_SIZE, 4, (x: N, y: N , z: N) => {
        return 0.01 + 0.1 * Math.pow(Math.random(), 12);
    });
    let diff = new Diffusion.DiffusionProcess(
        grid,
        new Diffusion.DiffusionParams(50.3, 5, 0.1)
    );
    diff.build();

    let canvas = createCanvas(w, h, diff.getTexture([0]));
    let mouse = setupMouse(canvas);
    app.stage.addChild(canvas);

    console.log(`canvas=${Object.keys(canvas)}`);
    console.log(`Image shape d=${d}, h=${h}, w=${w}`);

    let i = 0;
    let start = performance.now();
    let prev = start;

    let text = createInfoText(w, h);
    app.stage.addChild(text);

    app.ticker.maxFPS = 60;
    app.ticker.add((deltaFrame: N) => {
        const deltaMs = app.ticker.deltaMS;
        const deltaS = deltaMs / 1000;
        let now = performance.now();
        if (mouse.active) {
            diff.putSubstance(
                11.1 * deltaMs, 
                Math.floor(mouse.x * grid.width / canvas.width), 
                Math.floor(mouse.y * grid.height / canvas.height), 
                mouse.color,
            );
        }
        updateInfoText(text, deltaMs);
        prev = now;
        if (i % 60 == 0)
            console.log(`
                typeof r[0]=${grid.buffer[0].constructor.name}, 
                typeof r=${grid.buffer.constructor.name},
                r[0]=${grid.buffer[0]}
                `);
        diff.update(deltaS, 55);
        canvas.texture = diff.getTexture([0, 1, 2], [1.0]);
        i += 1;
    });

}

function updateInfoText(text: PIXI.Text, deltaTime: N) {
    let fps = 1000.0 / deltaTime;
    text.text = `FPS=${fps.toFixed(0)}, dt=${deltaTime.toFixed(0)}ms`;
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

function setupMouse(sprite: PIXI.Sprite): any {
    let mouse = {active: false, x: 0, y: 0, color: 2};
    sprite.interactive = true;
    sprite.addListener('pointerdown', function(event: any) {
        mouse.active = true;
        mouse.x = event.data.x;
        mouse.y = event.data.y;
    });
    sprite.addListener('pointerup', function(event: any) {
        mouse.active = false;
    });
    sprite.addListener('pointermove', function(event: any) {
        mouse.x = event.data.x;
        mouse.y = event.data.y;
    });
    sprite.addListener('pointertap', function(event: any){
        mouse.color = (mouse.color + 1) % 3;
    });
    return mouse;
}
