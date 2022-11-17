import * as PIXI from 'pixi.js';
import createFractal from './utils';


export default function createApp(parent: HTMLElement) {
    const frac = createFractal(parent.clientWidth, parent.clientHeight, 0.1, 256);
    const app = new PIXI.Application({
        resizeTo: parent,
        view: parent as HTMLCanvasElement, 
        // autoDensity: true,
        backgroundColor: 0x30cfff
    });
    app.stage.addChild(frac.shape);
    app.ticker.maxFPS = 60;
    app.ticker.add((delta) => {
        const minSc = 10;
        const maxSc = 10000;
        const minV = 1.0 / maxSc;
        const maxV = 1.0 / minSc;
        const period = 2;
        const seconds = new Date().valueOf() / 1000;
        const phase = Math.sin(Math.PI * seconds / period);
        frac.params.scale.x = (minV + maxV) / 2 + (maxV - minV) / 2 * phase;
        frac.params.scale.y = frac.params.scale.x;
        frac.params.center = {x: -1.235, y: 0.1}
    });
}
