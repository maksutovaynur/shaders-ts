import * as PIXI from 'pixi.js';


export default function createApp(parent: HTMLElement) {
    // parent.clientWidth, parent.clientHeight;
    const app = new PIXI.Application({
        resizeTo: parent,
        view: parent as HTMLCanvasElement, 
        // autoDensity: true,
        backgroundColor: 0x30cfff
    });
    // app.stage.addChild(frac.shape);
    app.ticker.maxFPS = 60;
    app.ticker.add((delta) => {
    });
}
