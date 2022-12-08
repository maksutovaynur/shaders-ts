import * as PIXI from 'pixi.js';
import * as Utils from './utils';
import * as Diffusion from './diffusion';
const initPicture = require('../assets/startingPoint.png');
type N = number;


export default function createApp(parent: HTMLElement | null) {
    // parent.clientWidth, parent.clientHeight;
    if (!parent) return;
    const app = new PIXI.Application({
        resizeTo: parent,
        view: parent as HTMLCanvasElement,
        backgroundColor: 0x30cfff
    });
    let {width: w, height: h} = app.screen;
    console.log(`screen[w=${app.screen.width}, ${app.screen.height}]`);
    let canvas = Utils.createCanvas(w, h, PIXI.Texture.from(
        initPicture,
        {width: w, height: h}
    ));

    let text = createInfoText(w, h);
    app.stage.addChild(canvas);
    app.stage.addChild(text);

    app.ticker.maxFPS = 60;
    app.ticker.add((delta) => {
        updateInfoText(text, delta);
    });

    Diffusion.DiffusionProcess.numbersFromTexture(initPicture).then(
        (image: N[][][]) => {
            let [d, h, w] = [image.length, image[0].length, image[0][0].length];
            console.log(`Image shape d=${d}, h=${h}, w=${w}`);
            let params = new Diffusion.DiffusionParams(0.01, 3);
            let diff = image.map((layer: N[][]) => 
                (new Diffusion.DiffusionProcess(layer, params))
            );
            
            let i = 0;
            app.ticker.add((delta) => {
                // diff.update(delta);
                let result: N[][][] = [];
                for(let j = 0; j < 3; j++) {
                    let x = diff[j].update(delta);
                    // if (i % 100 == 0) console.log(`arr: ${JSON.stringify(x)}`);
                    result.push(x);
                }
                let arr = new Float32Array(result.flat(3));
                console.log(`Len of array: ${arr.length}; elems: ${w * h * d}`);
                canvas.texture = PIXI.Texture.fromBuffer(arr, w, h);
                i += 1;
            });
        }
    )


}

function updateInfoText(text: PIXI.Text, deltaTime: number) {
    let fps = PIXI.Ticker.shared.FPS;
    text.text = `FPS=${fps.toFixed(1)}, dt=${deltaTime.toFixed(1)}ms`;
}

function createInfoText(w: number, h: number) {
    let text = new PIXI.Text('FPS: ');
    text.x = 0;
    text.y = 0;
    text.style = {
        fontFamily: 'Arial',
        fontSize: 36
    }
    return text;
}
