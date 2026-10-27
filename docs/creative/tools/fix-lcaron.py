"""Rebuild Anybody's lcaron (ľ) for Slovak: l + the apostrophe caron of dcaron,
placed right of l's stem, with gvar deltas so it tracks the stem on every
wdth/wght instance (the font ships l + a centred caron, the Czech/Slovak error)."""
import sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates
from fontTools.ttLib.tables.TupleVariation import TupleVariation
from fontTools.varLib.iup import iup_delta
src, dst = sys.argv[1], sys.argv[2]
f = TTFont(src, lazy=False); glyf = f["glyf"]; gvar = f["gvar"].variations

def full(name):
    g = glyf[name]; coords, ends, _ = g.getCoordinates(glyf); n = len(coords)
    out = []
    for t in gvar[name]:
        d = list(t.coordinates)
        filled = iup_delta(d, list(coords) + [(0, 0)] * 4, list(ends)) if any(p is None for p in d) else d
        out.append((t.axes, [tuple(p) for p in filled[:n]], [tuple(p) for p in filled[n:]]))
    return coords, out

lc, lvars = full("l"); dc, dvars = full("dcaron")
L_REF, D_REF = 2, 6          # stem top-right in l / dcaron
CARON = range(0, 4)          # dcaron contour 0 = the apostrophe caron
dx = lc[L_REF][0] - dc[D_REF][0]
new_coords = list(lc) + [(dc[i][0] + dx, dc[i][1]) for i in CARON]
g = Glyph(); g.numberOfContours = 2; g.coordinates = GlyphCoordinates(new_coords)
g.endPtsOfContours = [3, 7]; g.flags = bytearray([1] * 8); g.program = None
from fontTools.ttLib.tables import ttProgram
g.program = ttProgram.Program(); g.program.fromBytecode(b"")
glyf["lcaron"] = g
assert [v[0] for v in lvars] == [v[0] for v in dvars]
new_vars = []
for (axes, ld, lph), (_, dd, _) in zip(lvars, dvars):
    shift = ld[L_REF][0] - dd[D_REF][0]
    caron = [(dd[i][0] + shift, dd[i][1]) for i in CARON]
    new_vars.append(TupleVariation(axes, [(round(x), round(y)) for x, y in list(ld) + caron + list(lph)]))
gvar["lcaron"] = new_vars
f["hmtx"]["lcaron"] = f["hmtx"]["l"]
glyf["lcaron"].recalcBounds(glyf)
f.save(dst); print("lcaron rebuilt: caron at x", [p[0] for p in new_coords[4:]], "adv", f["hmtx"]["lcaron"][0])
