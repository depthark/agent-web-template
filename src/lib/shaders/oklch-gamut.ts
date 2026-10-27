/**
 * Tab. 05 – the sRGB gamut seen through OKLCH. Every pixel is a hue (left →
 * right, 0–360°) and a lightness (bottom → top); it shows the most saturated
 * colour a standard screen can display there (binary search on chroma). A
 * contour line marks one chroma value that slowly breathes between 0.03 and
 * 0.30; where that chroma does not fit in sRGB the map is veiled in the page's
 * paper (u_color[0]) and the line is drawn in its ink (u_color[1]). The still
 * frame (u_time = 12, reduced motion) sits near the site's vermilion (~0.18).
 */
export const oklchGamut = /* glsl */ `
vec3 oklabToLinearSrgb(vec3 c) {
  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encodeSrgb(vec3 x) {
  return mix(12.92 * x, 1.055 * pow(max(x, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, x));
}

bool inGamut(vec3 lin) {
  return all(greaterThanEqual(lin, vec3(0.0))) && all(lessThanEqual(lin, vec3(1.0)));
}

// Largest chroma at (lightness, hue) that still fits in sRGB.
float maxChroma(float lightness, float hue) {
  float lo = 0.0;
  float hi = 0.37;
  for (int i = 0; i < 12; i++) {
    float mid = 0.5 * (lo + hi);
    if (inGamut(oklabToLinearSrgb(vec3(lightness, mid * cos(hue), mid * sin(hue))))) lo = mid;
    else hi = mid;
  }
  return lo;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float hue = uv.x * 6.28318530718;
  float lightness = uv.y;
  float cmax = maxChroma(lightness, hue);
  vec3 col = encodeSrgb(clamp(oklabToLinearSrgb(vec3(lightness, cmax * cos(hue), cmax * sin(hue))), 0.0, 1.0));

  float chroma = 0.03 + 0.27 * (0.5 + 0.5 * sin(u_time * 0.25));
  // Paper veil where the current chroma is out of reach.
  col = mix(col, u_color[0], step(cmax, chroma) * 0.5);
  // Contour line at cmax == chroma, ~1.5 device px wide.
  float d = abs(cmax - chroma) / max(fwidth(cmax), 1e-4);
  col = mix(col, u_color[1], (1.0 - smoothstep(0.75, 1.75, d)) * 0.9);

  fragColor = vec4(col, 1.0);
}
`;
