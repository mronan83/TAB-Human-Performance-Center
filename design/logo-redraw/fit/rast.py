import numpy as np, cv2
from fontTools.pens.basePen import BasePen
from text import layout, font
class Flat(BasePen):
    def __init__(s,gs): super().__init__(gs); s.polys=[]; s.cur=[]
    def _moveTo(s,p): s.cur=[p]
    def _lineTo(s,p): s.cur.append(p)
    def _curveToOne(s,a,b,c):
        p0=np.array(s.cur[-1]); 
        for t in np.linspace(0,1,9)[1:]:
            s.cur.append(tuple((1-t)**3*p0+3*(1-t)**2*t*np.array(a)+3*(1-t)*t*t*np.array(b)+t**3*np.array(c)))
    def _qCurveToOne(s,a,b):
        p0=np.array(s.cur[-1])
        for t in np.linspace(0,1,7)[1:]:
            s.cur.append(tuple((1-t)**2*p0+2*(1-t)*t*np.array(a)+t*t*np.array(b)))
    def _closePath(s): s.polys.append(s.cur); s.cur=[]
def polys(text,w,size,track,x0,base):
    out,sc=layout(text,w,size,track); gs=font(w).getGlyphSet(); P=[]
    for g,x in out:
        fp=Flat(gs); gs[g].draw(fp)
        for poly in fp.polys: P.append(np.array([(x0+x+px*sc, base-py*sc) for px,py in poly]))
    return P
def raster(P,shape,ox,oy,S=8):
    m=np.zeros((shape[0]*S,shape[1]*S),np.uint8)
    pts=[np.round((p-[ox,oy])*S*16).astype(np.int32) for p in P]
    cv2.fillPoly(m,pts,255,lineType=cv2.LINE_AA,shift=4)  # even-odd? fillPoly uses nonzero-ish; handle counters below
    return m
def raster_eo(P,shape,ox,oy,S=8):
    m=np.zeros((shape[0]*S,shape[1]*S),np.int32)
    for p in P:
        t=np.zeros_like(m,dtype=np.uint8)
        cv2.fillPoly(t,[np.round((p-[ox,oy])*S).astype(np.int32)],1)
        m^=t
    a=m.astype(float).reshape(shape[0],S,shape[1],S).mean((1,3))
    return a
