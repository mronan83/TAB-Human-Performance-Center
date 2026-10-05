"""Lay out caps text with Montserrat (advances + GPOS kerning) and return glyph outlines / ink boxes."""
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import functools
FD='../fonts'
@functools.lru_cache(None)
def font(w):
    f=TTFont(f'{FD}/Montserrat-{w}.ttf')
    return f
@functools.lru_cache(None)
def kern_table(w):
    f=font(w); gpos=f['GPOS'].table; K={}
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag!='kern': continue
        for li in fr.Feature.LookupListIndex:
            lk=gpos.LookupList.Lookup[li]
            for st in lk.SubTable:
                if lk.LookupType==9: st=st.ExtSubTable
                if getattr(st,'LookupType',2)!=2 and lk.LookupType not in (2,9): continue
                if st.Format==1:
                    cov=st.Coverage.glyphs
                    for i,ps in enumerate(st.PairSet):
                        for pv in ps.PairValueRecord:
                            v=getattr(pv.Value1,'XAdvance',0) or 0
                            K.setdefault((cov[i],pv.SecondGlyph),v)
                elif st.Format==2:
                    c1=st.ClassDef1.classDefs; c2=st.ClassDef2.classDefs
                    cov=st.Coverage.glyphs
                    seconds={}
                    for g,c in c2.items(): seconds.setdefault(c,[]).append(g)
                    for g in cov:
                        r=st.Class1Record[c1.get(g,0)]
                        for ci,rec in enumerate(r.Class2Record):
                            v=getattr(rec.Value1,'XAdvance',0) or 0
                            if v and ci in seconds:
                                for g2 in seconds[ci]: K.setdefault((g,g2),v)
    return K
def layout(text,w,size,track,kern=True):
    """track in px at this size. Returns list of (glyph, x) and font scale; x in px from origin."""
    f=font(w); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm; s=size/upm
    hm=f['hmtx']; K=kern_table(w) if kern else {}
    x=0; out=[]
    names=[cmap[ord(ch)] for ch in text]
    for i,g in enumerate(names):
        out.append((g,x))
        x+=hm[g][0]*s+track
        if i+1<len(names): x+=K.get((g,names[i+1]),0)*s
    return out,s
def ink_boxes(text,w,size,track,kern=True):
    out,s=layout(text,w,size,track,kern); gs=font(w).getGlyphSet(); res=[]
    for g,x in out:
        bp=BoundsPen(gs); gs[g].draw(bp)
        if bp.bounds: res.append((x+bp.bounds[0]*s, x+bp.bounds[2]*s))
    return res
def cap(w):
    return font(w)['OS/2'].sCapHeight/font(w)['head'].unitsPerEm
def path(text,w,size,track,x0,base,kern=True):
    out,s=layout(text,w,size,track,kern); gs=font(w).getGlyphSet(); ds=[]
    for g,x in out:
        p=SVGPathPen(gs, lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
        tp=TransformPen(p,(s,0,0,-s,x0+x,base)); gs[g].draw(tp); ds.append(p.getCommands())
    return ''.join(ds)
