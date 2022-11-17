precision highp float;

uniform vec2 scale;
uniform sampler2D tex;
uniform vec2 center;
varying vec3 vColor;
varying vec2 vUvs;

void main() {
    vec2 z, c;
    int i = 0;
    const int iter = {iter};

    c.x = center.x + vUvs.x * scale.x;
    c.y = center.y + vUvs.y * scale.y;

    z = c;
    for ( int it = 0; it < iter; it++ ) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.y * z.x + z.x * z.y) + c.y;

        if((x * x + y * y) > 4.0) break;
        z.x = x;
        z.y = y;
        i = it;
    }
    vec4 mand = texture2D(tex, vec2(float(i) / float(iter), 0));
    gl_FragColor = mand;
}