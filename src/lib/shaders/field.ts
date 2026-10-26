/**
 * "Field" – a starting point, not a house style: domain-warped value noise
 * mapped onto the four stage colours, with fine grain so flat gradients do
 * not band. Replace it per project (the `creative-direction` brief decides
 * what the stage should express). Body only – the uniforms are declared by
 * `src/scripts/shader-stage.ts`.
 */
export const field = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * 0.04;

  // The pointer bends the field a little; scroll slowly turns it.
  vec2 bend = (u_pointer - 0.5) * 0.35;
  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.1));
  vec2 r = vec2(fbm(p * 1.8 + q * 2.2 + bend + 1.7), fbm(p * 1.8 + q * 2.2 - bend + 9.2 + u_scroll));
  float f = fbm(p * 1.2 + r * 1.6);

  vec3 col = mix(u_color[0], u_color[1], smoothstep(0.15, 0.85, f));
  col = mix(col, u_color[2], smoothstep(0.35, 1.0, length(q) * f));
  col = mix(col, u_color[3], smoothstep(0.6, 1.0, r.x) * 0.6);

  // Vignette towards the base colour, then grain (±1.5 %).
  col = mix(u_color[0], col, smoothstep(1.25, 0.2, length(uv - 0.5) * 1.6));
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.03;

  fragColor = vec4(col, 1.0);
}
`;
