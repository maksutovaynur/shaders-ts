<script lang="ts">
import * as PIXI from 'pixi.js';

let _global_uid = 0;

export default {
    data(){return {
        uid: '',
        app: null as PIXI.Application | null,
    }},
    beforeCreate() {
        this.uid = _global_uid.toString();
        _global_uid += 1;
    },
    computed: {
        nodeId() { return 'game-canvas-' + this.uid }
    },
    mounted(){
        if (this.app) {
            // this.app.destroy();
            return;
        }
        this.app = new PIXI.Application({
            resizeTo: this.$el,
            view: document.getElementById(this.nodeId) as HTMLCanvasElement,
            backgroundColor: '#010258'
        });
        console.log(`PIXI app created with screen size: ${this.app.screen.width} ${this.app.screen.height}`);
    },
    beforeUnmount() {
        console.log(`PIXI app will be destroyed`);
        this.app?.destroy();
    }
}
</script>

<template>
<div class="game-canvas">
    <canvas :id="nodeId"/>
</div>
</template>

<style scoped lang="sass">
.game-canvas
    border: 2px solid red

canvas
    position: absolute
    left: 0
    top: 0
    right: 0
    bottom: 0
</style>