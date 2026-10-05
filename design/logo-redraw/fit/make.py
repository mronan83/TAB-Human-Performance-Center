import numpy as np, json, os
from build import *
from fit2 import init
M=load_mark()
for n in M:
    if M[n] is None: M[n]=init(n).tolist(); print('WARNING interim init params for',n)
I=np.eye(2); Z=np.zeros(2)
TITLE='TAB Human Performance Center'
def write(name,vb,body,pad=0):
    x0,y0,x1,y1=vb; vb=(x0-pad,y0-pad,x1-x0+2*pad,y1-y0+2*pad)
    open(f'{OUT}/{name}.svg','w').write(svg(tuple(round(v,2) for v in vb),body,TITLE))
def text_body(color,tag=True,tagcolor=None,tagop='0.8'):
    b=f'<path fill="{color}" d="{r2(td(TAB))}"/>'
    b+=f'<rect fill="{color}" x="{DIV[0]}" y="{DIV[1]}" width="{DIV[2]}" height="{DIV[3]}"/>'
    b+=f'<path fill="{color}" d="{r2("".join(td(t) for t in DESC))}"/>'
    if tag: b+=f'<path fill="{tagcolor or color}" fill-opacity="{tagop}" d="{r2(td(TAG))}"/>'
    return b
mb=mark_bbox(M,R,np.array([tx,ty]))
tb=union(*(text_bbox(t) for t in [TAB,*DESC])); tgb=text_bbox(TAG)
H=union(mb,tb,tgb); H0=union(mb,tb)
B=np.array([tx,ty])
variants={
 'horizontal':            (FLAT,C['graphite'],True),
 'horizontal-notag':      (FLAT,C['graphite'],False),
 'horizontal-graphite':   (mono(C['graphite']),C['graphite'],True),
 'horizontal-graphite-notag':(mono(C['graphite']),C['graphite'],False),
 'horizontal-white':      (mono(C['white']),C['white'],True),
 'horizontal-white-notag':(mono(C['white']),C['white'],False),
}
for name,(fills,tc,tag) in variants.items():
    write(f'tab-hpc-{name}',H if tag else H0, mark_paths(M,R,B,fills)+text_body(tc,tag,tagop='1' if tc==C['white'] else '0.8'))
d,f=sheen_defs(R,B,'s'); write('tab-hpc-horizontal-sheen',H,d+mark_paths(M,R,B,f)+text_body(C['graphite'],True))
# symbol (crop units)
sb=mark_bbox(M,I,Z)
write('tab-hpc-symbol',sb,mark_paths(M,I,Z,FLAT))
d,f=sheen_defs(I,Z,'s'); write('tab-hpc-symbol-sheen',sb,d+mark_paths(M,I,Z,f))
write('tab-hpc-symbol-graphite',sb,mark_paths(M,I,Z,mono(C['graphite'])))
write('tab-hpc-symbol-white',sb,mark_paths(M,I,Z,mono(C['white'])))
write('tab-hpc-symbol-dark',sb,mark_paths(M,I,Z,DARKAPP))
# stacked: symbol centred above TAB; descriptor on one line beneath, set to 1.12x the TAB width; tagline matched to it
tabb=text_bbox(TAB); capH=tabb[3]-tabb[1]; tabw=tabb[2]-tabb[0]; tcx=(tabb[0]+tabb[2])/2
sc=1.12*tabw/(sb[2]-sb[0])  # mark as wide as TAB
mw=(sb[2]-sb[0])*sc
A2=I*sc; B2=np.array([tcx-mw/2-sb[0]*sc, tabb[1]-0.45*capH-(sb[3])*sc])
def fit_size(t,ratio,target):
    lo,hi=2.0,80.0
    for _ in range(50):
        mid=(lo+hi)/2; b=text_bbox({**t,'x0':0,'base':0,'size':mid,'track':ratio*mid})
        lo,hi=(mid,hi) if b[2]-b[0]<target else (lo,mid)
    return {**t,'size':lo,'track':ratio*lo}
r_desc=DESC[1]['track']/DESC[1]['size']; r_tag=TAG['track']/TAG['size']
one=fit_size(dict(text='HUMAN PERFORMANCE CENTER',w=600,x0=0,base=0),r_desc,1.45*tabw)
ob=text_bbox({**one,'x0':0,'base':0}); one['x0']=tcx-(ob[0]+ob[2])/2; one['base']=tabb[3]+0.40*capH+(ob[3]-ob[1])
tg=fit_size(dict(text=TAG['text'],w=400,x0=0,base=0),r_tag,1.45*tabw)
tgb0=text_bbox({**tg,'x0':0,'base':0}); tg['x0']=tcx-(tgb0[0]+tgb0[2])/2; tg['base']=one['base']+0.30*capH+(tgb0[3]-tgb0[1])
print('stacked desc size %.2f tag size %.2f'%(one['size'],tg['size']))
def stacked(fills,col,tag,defs=''):
    b=defs+mark_paths(M,A2,B2,fills)+f'<path fill="{col}" d="{r2(td(TAB))}"/><path fill="{col}" d="{r2(td(one))}"/>'
    if tag: b+=f'<path fill="{col}" fill-opacity="{"1" if col==C["white"] else "0.8"}" d="{r2(td(tg))}"/>'
    bb=union(mark_bbox(M,A2,B2),tabb,text_bbox(one),*( [text_bbox(tg)] if tag else []))
    return bb,b
for name,(fills,col,tag) in {'stacked':(FLAT,C['graphite'],True),'stacked-notag':(FLAT,C['graphite'],False),'stacked-graphite':(mono(C['graphite']),C['graphite'],True),'stacked-white':(mono(C['white']),C['white'],True)}.items():
    bb,b=stacked(fills,col,tag); write(f'tab-hpc-{name}',bb,b)
json.dump({'mark':M,'symbol_bbox':sb},open(f'{OUT}/mark_params.json','w'))
print('ok', 'horizontal bbox',np.round(H,1),'symbol bbox',np.round(sb,1))
# app icons (square, full bleed; the OS applies its own corner mask)
def app(name,bg,fills,frac=0.64,dy=0.0):
    w=sb[2]-sb[0]; h=sb[3]-sb[1]; S=1024; sc=S*frac/max(w,h)
    A=I*sc; Bv=np.array([S/2-(sb[0]+w/2)*sc, S/2-(sb[1]+h/2)*sc+dy*S])
    body=f'<rect width="{S}" height="{S}" fill="{bg}"/>'+mark_paths(M,A,Bv,fills)
    open(f'{OUT}/{name}.svg','w').write(svg((0,0,S,S),body,TITLE))
app('tab-hpc-app-light',C['linen'],FLAT)
app('tab-hpc-app-dark',C['graphite'],DARKAPP)
app('tab-hpc-app-maskable',C['linen'],FLAT,frac=0.52)
# favicon: the symbol on a transparent square
w=sb[2]-sb[0]; h=sb[3]-sb[1]; m=max(w,h)*1.04
open(f'{OUT}/favicon.svg','w').write(svg((round(sb[0]+w/2-m/2,2),round(sb[1]+h/2-m/2,2),round(m,2),round(m,2)),mark_paths(M,I,Z,FLAT),TITLE))
