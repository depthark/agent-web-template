import sys, os
from fontTools.ttLib import TTFont
from fontTools import subset
src, dst = sys.argv[1], sys.argv[2]
chars = ("".join(chr(c) for c in range(0x20, 0x7F)) + " ©«·»" + "ÁÄÉÍÓÔÖÚÜÝáäéíóôöúüý"
  + "ČčĎďĚěĹĺĽľŇňŔŕŘřŠšŤťŮůŽž" + "–—‘’‚“”„…•→")
f = TTFont(src, lazy=False)
o = subset.Options(); o.flavor = "woff2"; o.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "lnum"]; o.name_IDs = ["*"]; o.notdef_outline = True; o.hinting = False
s = subset.Subsetter(o); s.populate(unicodes=[ord(c) for c in chars]); s.subset(f)
f.flavor = "woff2"; f.save(dst)
print(os.path.basename(dst), os.path.getsize(dst), [(a.axisTag, a.minValue, a.maxValue) for a in f["fvar"].axes])
