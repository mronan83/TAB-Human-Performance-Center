import numpy as np, json, sys, time, os
from model2 import *
import cv2
def raster(pts,shape,ss=4):
    m=np.zeros((shape[0]*ss,shape[1]*ss),np.uint8)
    cv2.fillPoly(m,[np.round(pts*ss*16).astype(np.int32)],1,lineType=cv2.LINE_8,shift=4)
    return cv2.resize(m.astype(np.float32),(shape[1],shape[0]),interpolation=cv2.INTER_AREA)
from scipy import optimize
m=json.load(open('mark_v6.json'))
TIPS={'clay':(2,0),'olive':(0,3),'cream':(2,0)}  # segment index starting at T1, at T2
def bez(c,t): t=t[:,None]; return (1-t)**3*c[0]+3*(1-t)**2*t*c[1]+3*(1-t)*t*t*c[2]+t**3*c[3]
def chain(cs): return np.vstack([bez(c,np.linspace(0,1,200,endpoint=False)) for c in cs])
def at(pts,f):
    L=np.r_[0,np.cumsum(np.linalg.norm(np.diff(pts,axis=0),axis=1))]; i=np.searchsorted(L,f*L[-1]); i=min(max(i,1),len(pts)-2)
    return pts[i], unit(pts[i+1]-pts[i-1])
def init(name):
    cs=parse(m[name]); n=len(cs); i1,i2=TIPS[name]
    T1=cs[i1][0]; T2=cs[i2][0]
    outer=[cs[(i1+k)%n] for k in range((i2-i1)%n)]; inner=[cs[(i2+k)%n] for k in range((i1-i2)%n)]
    po=chain(outer); pi=chain(inner)
    tan=np.diff(po,axis=0); ang=np.unwrap(np.arctan2(tan[:,1],tan[:,0])); turn=np.abs(np.diff(ang))
    k=np.convolve(turn,np.ones(25),'same'); ic=int(np.argmax(k)); cum=np.cumsum(turn); lo=0; hi=len(cum)-1
    seg=cum[lo:hi]-cum[lo]; tot=seg[-1]
    i1=lo+int(np.searchsorted(seg,0.12*tot)); i2=lo+int(np.searchsorted(seg,0.88*tot))
    C1=po[i1]; C2=po[i2]
    a1=np.arctan2(*(C1-T1)[::-1]); a2=np.arctan2(*(C2-T2)[::-1])
    P,tp=at(pi,0.4); K,_=at(pi,0.8); b0=at(pi,0.02)[0]-T2
    p=[*T1,*T2,a1,a2,np.linalg.norm(C1-T1),np.linalg.norm(C2-T2),0.5*np.linalg.norm(C1-C2),0.5*np.linalg.norm(C1-C2),np.arctan2(b0[1],b0[0]),np.linalg.norm(P-T2)/3,*P,np.arctan2(tp[1],tp[0]),np.linalg.norm(P-T2)/3,np.linalg.norm(K-P)/3,np.linalg.norm(K-T1),np.linalg.norm(K-P)/3]
    return np.array(p,float)
if __name__=='__main__':
    res={}
    for name in sys.argv[1:]:
        al=np.load(f'alpha_{name}.npy'); tgt=np.clip(al.reshape(al.shape[0]//4,4,al.shape[1]//4,4).mean((1,3))/0.7,0,1)  # 2x crop, interior saturated
        def score(p): return raster(outline(segs(p))*2,tgt.shape,4)
        from scipy import ndimage as _ndi
        DT=_ndi.distance_transform_edt(al<float(os.environ.get('TIPA','0.3')))/8.0
        def tipd(p,i): x,y=p[2*i]*8,p[2*i+1]*8; xi,yi=int(np.clip(x,0,al.shape[1]-1)),int(np.clip(y,0,al.shape[0]-1)); return DT[yi,xi]
        def tipa(p,i): x,y=p[2*i]*8,p[2*i+1]*8; xi,yi=int(np.clip(x,0,al.shape[1]-1)),int(np.clip(y,0,al.shape[0]-1)); return al[yi,xi]
        def kap(sg,end):
            if sg[0]=='L': return 0.0
            a,b,c,e=sg[1:]
            if end==0: d1=b-a; d2=c-b; n=np.linalg.norm(b-a)
            else: d1=c-b; d2=e-c; n=np.linalg.norm(e-c)
            if n<1e-6: return 0.0
            return (2/3)*(d1[0]*d2[1]-d1[1]*d2[0])/n**3
        def g2(p):
            S=segs(p); tot=0.0
            for i in range(len(S)):
                a,b=S[i],S[(i+1)%len(S)]
                if i in (len(S)-4,len(S)-1): continue   # tips (end of outer run, end of inner run)
                tot+=min((20*(kap(a,1)-kap(b,0)))**2,25.0)
            return tot
        LAM=float(os.environ.get('LAM','50'))
        def fold(p):
            tot=0.0
            for sg in segs(p):
                if sg[0]!='C': continue
                a,b,c,e=sg[1:]; ch=e-a; L=np.linalg.norm(ch)
                if L<1e-6: continue
                u=ch/L; pr=(b-a)@u+(e-c)@u
                tot+=max(0.0,pr-0.95*L)+max(0.0,-(b-a)@u)+max(0.0,-(e-c)@u)
            return tot
        TS=np.linspace(0.0,1.0,21)
        def convex(p):
            S=segs(p); tot=0.0
            for i in (0,len(S)-4):
                sg=S[i]
                if sg[0]!='C': continue
                a,b,c,e=sg[1:]
                for t in TS:
                    d=3*((1-t)**2*(b-a)+2*(1-t)*t*(c-b)+t*t*(e-c)); dd=6*((1-t)*(c-2*b+a)+t*(e-2*c+b))
                    n=np.linalg.norm(d)
                    if n>1e-9: tot+=max(0.0,-(d[0]*dd[1]-d[1]*dd[0])/n**3-0.0005)
            return tot
        def loss(p): return ((score(p)-tgt)**2).sum()+LAM*g2(p)+300*fold(p)+3000*convex(p)+400*sum(tipd(p,i)**2 for i in (0,1))
        p=np.array(json.load(open(f'mark_c_{name}.json'))[name]['p']) if os.path.exists(f'mark_c_{name}.json') else init(name)
        if len(p)==19:
            d=dict(zip(NAMES,p)); 
            p=np.r_[p,d['a1'],d['c1']/3,d['c1']/3,d['a2'],d['c2']/3,d['c2']/3]
        if os.environ.get('SPLIT') and len(p)==25:
            S=segs(p); c=S[1]; a_,b_,c_,e_=c[1:]
            # de Casteljau split at t=0.5
            ab=(a_+b_)/2; bc=(b_+c_)/2; cd=(c_+e_)/2; abc=(ab+bc)/2; bcd=(bc+cd)/2; m=(abc+bcd)/2
            tq=bcd-abc; p=np.r_[p,m,np.arctan2(tq[1],tq[0]),np.linalg.norm(m-abc),np.linalg.norm(bcd-m)]
            d=dict(zip(NAMES,p)); p[NAMES.index('h1')]=np.linalg.norm(ab-a_); p[NAMES.index('h2')]=np.linalg.norm(cd-e_)
        t=time.time(); print(name,'init loss %.1f'%loss(p),flush=True)
        for it in range(3):
            r=optimize.minimize(loss,p,method='Powell',options={'xtol':1e-3,'ftol':1e-6,'maxfev':40000}); p=r.x
            print('  pass',it,'loss %.1f'%r.fun,flush=True)
        a=score(p)>0.5; b=tgt>0.5; iou=(a&b).sum()/(a|b).sum()
        print(name,'G2 resid %.5f fold %.3f convex %.4f'%(g2(p),fold(p),convex(p))); print(name,'IoU %.4f'%iou,'%.0fs'%(time.time()-t),flush=True)
        res[name]={'p':[float(v) for v in p],'d':path_d(segs(p)),'iou':float(iou)}
        json.dump(res,open(f'mark_d_{"_".join(sys.argv[1:])}.json','w'))
