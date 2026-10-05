import numpy as np, json
from scipy import optimize
from scipy.spatial import cKDTree
def cub(p,n=60):
    p=np.asarray(p).reshape(4,2); t=np.linspace(0,1,n)[:,None]
    return (1-t)**3*p[0]+3*(1-t)**2*t*p[1]+3*(1-t)*t*t*p[2]+t**3*p[3]
def line(p,n=40): p=np.asarray(p).reshape(2,2); t=np.linspace(0,1,n)[:,None]; return p[0]*(1-t)+p[1]*t
def circ(p,n=120): cx,cy,r=p; a=np.linspace(0,2*np.pi,n); return np.c_[cx+r*np.cos(a),cy+r*np.sin(a)]
def arc(p,a0,a1,n=60): cx,cy,r=p; a=np.linspace(a0,a1,n); return np.c_[cx+r*np.cos(a),cy+r*np.sin(a)]
def poly(p): p=np.asarray(p).reshape(-1,2); return np.vstack([line(np.r_[p[i],p[i+1]]) for i in range(len(p)-1)])
def fit(Q, elems, iters=2):
    """elems: list of (kind, params); returns fitted params. Q: skeleton points (icon units) excluding ring."""
    T=cKDTree(Q); kinds=[k for k,_ in elems]; sizes=[len(p) for _,p in elems]
    x0=np.concatenate([np.ravel(p) for _,p in elems])
    def split(x):
        out=[];i=0
        for s in sizes: out.append(x[i:i+s]); i+=s
        return out
    def sample(x): return [ {'cub':cub,'line':line,'circ':circ,'poly':poly}[k](p) for k,p in zip(kinds,split(x))]
    def loss(x):
        S=sample(x); A=np.vstack(S)
        d1=cKDTree(A).query(Q)[0]; d1=np.minimum(d1,3.0)
        d2=np.concatenate([T.query(s)[0] for s in S]); d2=np.minimum(d2,3.0)
        return (d1**2).mean()+ (d2**2).mean()
    x=x0
    for _ in range(iters): x=optimize.minimize(loss,x,method='Powell',options={'xtol':1e-3,'maxfev':60000}).x
    S=sample(x); A=np.vstack(S)
    return split(x), float(np.sqrt((np.minimum(cKDTree(A).query(Q)[0],3)**2).mean()))
def skeleton(k):
    Q=np.load(f'icon{k}_q.npy')
    r=np.hypot(Q[:,0]-50,Q[:,1]-50)
    Q=Q[r<43.5]
    # drop the ring residue: top-left artefact cluster found in every icon (x<46,y<36 and near ring)
    return Q
