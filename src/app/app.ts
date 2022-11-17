import * as PIXI from 'pixi.js';
import createShape from './utils';


export default function createApp(parent: HTMLElement) {
    const shape = createShape(parent.clientWidth, parent.clientHeight, 0.1, 5);
    const app = new PIXI.Application({
        resizeTo: parent,
        view: parent as HTMLCanvasElement, 
        autoDensity: true,
        backgroundColor: 0x30cfff
    });
    app.stage.addChild(shape);
    app.ticker.add((delta) => {});
}
