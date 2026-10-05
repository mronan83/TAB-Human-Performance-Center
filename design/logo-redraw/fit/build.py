"""Assemble TAB Human Performance Center logo SVGs from the fitted mark and Montserrat outlines (board coordinates)."""
import numpy as np, json, os, re
from text import path as tpath
from model2 import segs, path_d
OUT='out'; os.makedirs(OUT,exist_ok=True)
C=dict(graphite='#2E2E2E',olive='#4A5A44',sage='#A7B39F',clay='#C46A4A',ochre='#D4A574',linen='#E8E3D9',bone='#FBF6F1',white='#FFFFFF')
def load_mark():
    m={}
    for n in ('clay','olive','cream'):
        f=f'mark_d_{n}.json'
        m[n]=json.load(open(f))[n]['p'] if os.path.exists(f) else None
    return m
s,th,tx,ty=np.load('lockup_xform.npy')
R=np.array([[np.cos(th),-np.sin(th)],[np.sin(th),np.cos(th)]])*s
def xf(seglist, A, b):
    out=[]
    for sg in seglist: out.append((sg[0],*[A@p+b for p in sg[1:]]))
    return out
def mark_d(p, A=np.eye(2), b=np.zeros(2)): return path_d(xf(segs(np.array(p)),A,b))
# text parameters fitted to the board (see fit notes)
TAB=dict(text='TAB',w=800,size=108.82,track=-3.40,x0=208.37,base=175.07)
dsz,t1,t2,t3,dx,b1,b2,b3=np.load('desc_final.npy')
DESC=[dict(text='HUMAN',w=600,size=dsz,track=t1,x0=dx,base=b1),dict(text='PERFORMANCE',w=600,size=dsz,track=t2,x0=dx,base=b2),dict(text='CENTER',w=600,size=dsz,track=t3,x0=dx,base=b3)]
tsz,ttr,tx0,tb,_=np.load('tag_400.npy')
TAG=dict(text='TRANSFORM. ADAPT. BALANCE.',w=400,size=tsz,track=ttr,x0=tx0,base=tb)
DIV=(454.85,96.5,2.8,81.0)
def td(t): return tpath(t['text'],t['w'],t['size'],t['track'],t['x0'],t['base'])
def svg(vb, body, title, w=None):
    x,y,W,H=vb; return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:g} {y:g} {W:g} {H:g}" role="img" aria-labelledby="t">'
        f'<title id="t">{title}</title>{body}</svg>\n')
def r2(d): return re.sub(r'(\d+\.\d\d)\d+',r'\1',d)

from model2 import outline
from text import layout, font
from fontTools.pens.boundsPen import BoundsPen
SHEEN=json.load(open('sheen.json'))
def text_bbox(t):
    out,sc=layout(t['text'],t['w'],t['size'],t['track']); gs=font(t['w']).getGlyphSet(); xs=[];ys=[]
    for g,x in out:
        bp=BoundsPen(gs); gs[g].draw(bp)
        if bp.bounds: a,b,c,d=bp.bounds; xs+= [t['x0']+x+a*sc,t['x0']+x+c*sc]; ys+=[t['base']-d*sc,t['base']-b*sc]
    return min(xs),min(ys),max(xs),max(ys)
def mark_bbox(M,A,b):
    P=np.vstack([outline(xf(segs(np.array(M[n])),A,b)) for n in M]); return (*P.min(0),*P.max(0))
def union(*bs): return (min(b[0] for b in bs),min(b[1] for b in bs),max(b[2] for b in bs),max(b[3] for b in bs))
PARTS=('olive','clay','cream')
def mark_paths(M,A,b,fills,gid=''):
    return ''.join(f'<path fill="{fills[n]}" d="{r2(mark_d(M[n],A,b))}"/>' for n in PARTS)
def sheen_defs(A,b,gid):
    d=''; fills={}
    for n in PARTS:
        s=SHEEN[n]; p0=A@np.array(s['p0'])+b; p1=A@np.array(s['p1'])+b
        d+=(f'<linearGradient id="{gid}{n}" gradientUnits="userSpaceOnUse" x1="{p0[0]:.2f}" y1="{p0[1]:.2f}" x2="{p1[0]:.2f}" y2="{p1[1]:.2f}">'
            f'<stop offset="0" stop-color="{s["c0"]}"/><stop offset="1" stop-color="{s["c1"]}"/></linearGradient>')
        fills[n]=f'url(#{gid}{n})'
    return f'<defs>{d}</defs>',fills
FLAT={'olive':C['olive'],'clay':C['clay'],'cream':C['sage']}
DARKAPP={'olive':C['olive'],'clay':C['clay'],'cream':C['linen']}
def mono(c): return {n:c for n in PARTS}
