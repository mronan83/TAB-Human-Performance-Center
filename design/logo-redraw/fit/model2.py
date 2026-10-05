"""Construction model for one mark part, in symbol-crop units.
run A (outer): tip T1 -> straight line -> C1, rounded corner cubic C1->C2 (handles along the two lines) -> straight line -> tip T2
run B (inner): tip T2 -> cubic -> P -> cubic -> K -> straight line -> tip T1 (G1 at P and K)."""
import numpy as np, re
from model import raster
def U(a): return np.array([np.cos(a), np.sin(a)])
def unit(v): return v/np.linalg.norm(v)
NAMES=['t1x','t1y','t2x','t2y','a1','a2','c1','c2','h1','h2','b0a','b0h','px','py','pa','phi','pho','k','kh']
LEN={'c1','c2','h1','h2','b0h','phi','pho','k','kh'}
HND={'h1','h2','b0h','phi','pho','kh'}
FL=3.0
def segs(p):
    d=dict(zip(NAMES,p)); d={k:(max(abs(v),FL) if k in HND else abs(v) if k in LEN else v) for k,v in d.items()}; T1=np.array([d['t1x'],d['t1y']]); T2=np.array([d['t2x'],d['t2y']])
    u1=U(d['a1']); C1=T1+d['c1']*u1            # outer line 1 leaves T1 in direction a1
    u2=U(d['a2']); C2=T2+d['c2']*u2            # outer line 2 leaves T2 in direction a2
    if len(p)>len(NAMES):  # outer edges as single cubics (straight when the handles lie on the chord)
        e1a,e1h,e1k,e2a,e2h,e2k=p[len(NAMES):len(NAMES)+6]; e1h,e1k,e2h,e2k=(max(abs(v),FL) for v in (e1h,e1k,e2h,e2k))
        if len(p)>=len(NAMES)+11:  # corner split at a G1 knot Q
            qx,qy,qa,qi,qo=p[len(NAMES)+6:len(NAMES)+11]; Q=np.array([qx,qy]); qu=U(qa); qi,qo=max(abs(qi),FL),max(abs(qo),FL)
            corner=[('C',C1,C1+d['h1']*u1,Q-qi*qu,Q),('C',Q,Q+qo*qu,C2+d['h2']*u2,C2)]
        else:
            corner=[('C',C1,C1+d['h1']*u1,C2+d['h2']*u2,C2)]
        S=[('C',T1,T1+e1h*U(e1a),C1-e1k*u1,C1),*corner,('C',C2,C2-e2k*u2,T2+e2h*U(e2a),T2)]
    else:
        S=[('L',T1,C1),('C',C1,C1+d['h1']*u1,C2+d['h2']*u2,C2),('L',C2,T2)]
    ku=unit(T1-T2) if False else None
    P=np.array([d['px'],d['py']]); pu=U(d['pa'])
    # K lies on the segment ending at T1 along direction b (from K to T1); define via distance k back from T1 along direction toward P
    kb=unit(P-T1); K=T1+d['k']*kb
    S+=[('C',T2,T2+d['b0h']*U(d['b0a']),P-d['phi']*pu,P),('C',P,P+d['pho']*pu,K+d['kh']*kb,K),('L',K,T1)]
    return S
def outline(S,n=48):
    out=[]
    for s in S:
        t=np.linspace(0,1,n,endpoint=False)[:,None]
        if s[0]=='L': out.append(s[1]*(1-t)+s[2]*t)
        else:
            a,b,c,e=s[1:]; out.append((1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*e)
    return np.vstack(out)
def path_d(S,f=lambda v:f'{v:.2f}'):
    d=f'M{f(S[0][1][0])},{f(S[0][1][1])}'
    for s in S:
        if s[0]=='L': d+=f' L{f(s[2][0])},{f(s[2][1])}'
        else: d+=' C'+' '.join(f'{f(x)},{f(y)}' for x,y in s[2:])
    return d+'Z'
def parse(d):
    nums=[float(v) for v in re.findall(r'-?\d+\.?\d*',d)]
    p0=np.array(nums[:2]); rest=np.array(nums[2:]).reshape(-1,3,2)
    cs=[]; cur=p0
    for r in rest: cs.append(np.vstack([cur,r])); cur=r[2]
    return cs
