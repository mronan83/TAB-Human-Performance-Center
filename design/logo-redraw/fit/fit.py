"""Clean vector construction from an anti-aliased mask: sub-pixel contour, smoothing between sharp corners,
then least-squares cubic Bezier fitting (Schneider, Graphics Gems 1990) to a stated tolerance."""
import numpy as np
from scipy import ndimage as ndi
from skimage import measure

def contour(alpha, level=0.5):
    cs = measure.find_contours(alpha, level)
    c = max(cs, key=len)[:, ::-1]  # (x, y)
    # resample at uniform arc length
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]
    n = int(d[-1] / 0.5)
    t = np.linspace(0, d[-1], n, endpoint=False)
    return np.c_[np.interp(t, d, c[:, 0]), np.interp(t, d, c[:, 1])]

def turning(c, k=12):
    a = np.roll(c, k, 0) - c; b = np.roll(c, -k, 0) - c
    cos = (a * b).sum(1) / (np.linalg.norm(a, axis=1) * np.linalg.norm(b, axis=1))
    return np.degrees(np.arccos(np.clip(cos, -1, 1)))  # small angle = sharp

def corners(c, n=2, k=12, sep=80):
    ang = turning(c, k); idx = []
    for i in np.argsort(ang):
        if all(min(abs(i - j), len(c) - abs(i - j)) > sep for j in idx): idx.append(i)
        if len(idx) == n: break
    return sorted(idx), ang

def smooth_open(p, sigma):
    if sigma <= 0: return p
    q = np.c_[ndi.gaussian_filter1d(p[:, 0], sigma, mode='nearest'), ndi.gaussian_filter1d(p[:, 1], sigma, mode='nearest')]
    q[0], q[-1] = p[0], p[-1]
    w = np.minimum(np.arange(len(p)), np.arange(len(p))[::-1]) / max(1, 3 * sigma)
    w = np.clip(w, 0, 1)[:, None]
    return p * (1 - w) + q * w

# ---- Schneider fitting ----
def bez(ctrl, t):
    t = t[:, None]; return (1-t)**3*ctrl[0] + 3*(1-t)**2*t*ctrl[1] + 3*(1-t)*t**2*ctrl[2] + t**3*ctrl[3]
def bez1(ctrl, t):
    t = t[:, None]; return 3*(1-t)**2*(ctrl[1]-ctrl[0]) + 6*(1-t)*t*(ctrl[2]-ctrl[1]) + 3*t**2*(ctrl[3]-ctrl[2])
def bez2(ctrl, t):
    t = t[:, None]; return 6*(1-t)*(ctrl[2]-2*ctrl[1]+ctrl[0]) + 6*t*(ctrl[3]-2*ctrl[2]+ctrl[1])
def chord(p):
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]; return d / d[-1]
def gen(p, u, t1, t2):
    A1 = t1[None] * (3*(1-u)**2*u)[:, None]; A2 = t2[None] * (3*(1-u)*u**2)[:, None]
    C = np.array([[(A1*A1).sum(), (A1*A2).sum()], [(A1*A2).sum(), (A2*A2).sum()]])
    tmp = p - bez(np.array([p[0], p[0], p[-1], p[-1]]), u)
    X = np.array([(A1*tmp).sum(), (A2*tmp).sum()])
    det = np.linalg.det(C); seg = np.linalg.norm(p[-1]-p[0])
    if abs(det) > 1e-12:
        a1 = (X[0]*C[1,1] - C[0,1]*X[1]) / det; a2 = (C[0,0]*X[1] - C[0,1]*X[0]) / det
    else: a1 = a2 = seg / 3
    if a1 < 1e-6*seg or a2 < 1e-6*seg: a1 = a2 = seg / 3
    return np.array([p[0], p[0] + t1*a1, p[-1] + t2*a2, p[-1]])
def reparam(ctrl, p, u):
    d = bez(ctrl, u) - p; d1 = bez1(ctrl, u); d2 = bez2(ctrl, u)
    num = (d*d1).sum(1); den = (d1*d1).sum(1) + (d*d2).sum(1)
    return np.clip(u - np.where(np.abs(den) > 1e-12, num/den, 0), 0, 1)
def maxerr(ctrl, p, u):
    e = np.linalg.norm(bez(ctrl, u) - p, axis=1); i = int(np.argmax(e)); return e[i], i
def unit(v): return v / np.linalg.norm(v)
def fit(p, t1, t2, tol):
    if len(p) == 2:
        d = np.linalg.norm(p[1]-p[0]) / 3; return [np.array([p[0], p[0]+t1*d, p[1]+t2*d, p[1]])]
    u = chord(p); ctrl = gen(p, u, t1, t2); err, split = maxerr(ctrl, p, u)
    if err < tol: return [ctrl]
    if err < tol * 4:
        for _ in range(20):
            u = reparam(ctrl, p, u); ctrl = gen(p, u, t1, t2); err, split = maxerr(ctrl, p, u)
            if err < tol: return [ctrl]
    split = min(max(split, 2), len(p) - 3)
    tc = unit(p[split-2] - p[split+2])
    return fit(p[:split+1], t1, tc, tol) + fit(p[split:], -tc, t2, tol)
def fit_curve(p, tol, k=6):
    t1 = unit(p[min(k, len(p)-1)] - p[0]); t2 = unit(p[-1-min(k, len(p)-1)] - p[-1])
    return fit(p, t1, t2, tol)

def build(alpha, ncorners=2, sigma_px=6, tol_px=2.4, S=8):
    """alpha at S x board scale; sigma and tolerance in upscaled pixels. Returns SVG path d (board units)."""
    c = contour(alpha)
    idx, ang = corners(c, ncorners)
    runs = []
    for a, b in zip(idx, idx[1:] + [idx[0] + len(c)]):
        run = np.r_[c, c][a:b+1]
        runs.append(smooth_open(run, sigma_px))
    segs = []
    for run in runs: segs += fit_curve(run, tol_px)
    d = f"M{segs[0][0][0]/S:.2f},{segs[0][0][1]/S:.2f}"
    for s in segs: d += " C" + " ".join(f"{x/S:.2f},{y/S:.2f}" for x, y in s[1:])
    return d + "Z", segs, c, idx

def sample_segs(segs, n=60):
    return np.vstack([bez(s, np.linspace(0, 1, n)) for s in segs])
def deviation(segs, c, S=8):
    from scipy.spatial import cKDTree
    pts = sample_segs(segs); d1, _ = cKDTree(c).query(pts); d2, _ = cKDTree(pts).query(c)
    d = np.r_[d1, d2] / S; return d.mean(), np.percentile(d, 99), d.max()

# ---- v3: straight edges as true lines, curves joined tangentially ----
def curvature(p, sigma):
    x = ndi.gaussian_filter1d(p[:, 0], sigma, mode='nearest'); y = ndi.gaussian_filter1d(p[:, 1], sigma, mode='nearest')
    dx, dy = np.gradient(x), np.gradient(y); ddx, ddy = np.gradient(dx), np.gradient(dy)
    return (dx * ddy - dy * ddx) / np.power(dx * dx + dy * dy, 1.5)

def line_fit(p):
    c = p.mean(0); u, s, vt = np.linalg.svd(p - c); d = vt[0]
    t = (p - c) @ d; return c, d, t.min(), t.max(), np.abs((p - c) @ np.array([-d[1], d[0]])).max()

def straight_spans(p, kthr, minlen, sigma):
    k = np.abs(curvature(p, sigma)); flat = k < kthr
    spans = []; i = 0
    while i < len(p):
        if flat[i]:
            j = i
            while j < len(p) and flat[j]: j += 1
            if j - i >= minlen: spans.append((i, j - 1))
            i = j
        else: i += 1
    return spans

def build3(alpha, S=8, sigma=12, tol=3.2, kthr=0.0018, minlen=60, line_tol=2.0):
    c = contour(alpha); idx, _ = corners(c, 2)
    pieces = []  # list of ('L', p0, p1) or ('C', ctrl)
    for a, b in zip(idx, idx[1:] + [idx[0] + len(c)]):
        run = smooth_open(np.r_[c, c][a:b+1], sigma)
        spans = [s for s in straight_spans(run, kthr, minlen, 6)]
        # trim spans away from run ends a little and keep those that are straight within line_tol
        keep = []
        for s0, s1 in spans:
            s0, s1 = max(s0, 4), min(s1, len(run) - 5)
            if s1 - s0 < minlen: continue
            cc, d, t0, t1, err = line_fit(run[s0:s1+1])
            if err <= line_tol: keep.append((s0, s1, cc, d))
        # assemble: curve(start..s0) line(s0..s1) curve(s1..next s0) ...
        cur = 0; t_in = unit(run[min(6, len(run)-1)] - run[0])
        for s0, s1, cc, d in keep:
            A = cc + d * ((run[s0] - cc) @ d); B = cc + d * ((run[s1] - cc) @ d)
            if (B - A) @ d < 0: d = -d
            seg = np.r_[run[cur:s0], A[None]]
            pieces += [('C', x) for x in fit(seg, t_in, -d, tol)] if len(seg) > 2 else [('L', run[cur], A)]
            pieces.append(('L', A, B)); run[s1] = B; cur = s1; t_in = d
        seg = run[cur:]
        t_out = unit(run[-1 - min(6, len(run)-1)] - run[-1])
        pieces += [('C', x) for x in fit(seg, t_in, t_out, tol)]
    p0 = pieces[0][1][0] if pieces[0][0] == 'C' else pieces[0][1]
    d = f"M{p0[0]/S:.2f},{p0[1]/S:.2f}"; samples = []
    for kind, *v in pieces:
        if kind == 'L':
            d += f" L{v[1][0]/S:.2f},{v[1][1]/S:.2f}"; samples.append(np.linspace(v[0], v[1], 60))
        else:
            ctrl = v[0]; d += " C" + " ".join(f"{x/S:.2f},{y/S:.2f}" for x, y in ctrl[1:]); samples.append(bez(ctrl, np.linspace(0, 1, 60)))
    return d + "Z", np.vstack(samples), c, pieces

def deviation_pts(pts, c, S=8):
    from scipy.spatial import cKDTree
    d1, _ = cKDTree(c).query(pts); d2, _ = cKDTree(pts).query(c); d = np.r_[d1, d2] / S
    return d.mean(), np.percentile(d, 99), d.max()

# ---- v4: sharp tips from crossing tangents; wide smoothing; few curves ----
from skimage.draw import polygon as _poly
def line_intersect(p, d, q, e):
    A = np.array([d, -e]).T
    try: s, t = np.linalg.solve(A, q - p)
    except np.linalg.LinAlgError: return (p + q) / 2
    return p + s * d

def build4(alpha, S=8, sigma=24, trim=14, tol=7.0, kthr=0.0012, minlen=80, line_tol=3.0, tan_k=10):
    c = contour(alpha); idx, _ = corners(c, 2)
    runs = []
    for a, b in zip(idx, idx[1:] + [idx[0] + len(c)]):
        r = np.r_[c, c][a:b+1]
        r = smooth_open(r, sigma)[trim:-trim]
        runs.append(r)
    # tips: run i ends at corner i+1, run i+1 starts there
    tips = []
    for i in range(len(runs)):
        A = runs[i]; B = runs[(i + 1) % len(runs)]
        dA = unit(A[-1] - A[-1 - tan_k]); dB = unit(B[0] - B[tan_k])
        tips.append(line_intersect(A[-1], dA, B[0], dB))
    pieces = []
    for i, r in enumerate(runs):
        start = tips[i - 1]; end = tips[i]
        pts = np.r_[start[None], r, end[None]]
        t1 = unit(r[tan_k] - r[0]); t2 = unit(r[-1 - tan_k] - r[-1])
        # straight spans inside the run
        spans = straight_spans(pts, kthr, minlen, 8)
        cur = 0; t_in = t1; keep = []
        for s0, s1 in spans:
            s0, s1 = max(s0, 3), min(s1, len(pts) - 4)
            if s1 - s0 < minlen: continue
            cc, d, *_r, err = line_fit(pts[s0:s1+1])
            if err <= line_tol: keep.append((s0, s1, cc, d))
        for s0, s1, cc, d in keep:
            A2 = cc + d * ((pts[s0] - cc) @ d); B2 = cc + d * ((pts[s1] - cc) @ d)
            if (B2 - A2) @ d < 0: d = -d
            seg = np.r_[pts[cur:s0], A2[None]]
            pieces += [('C', x) for x in fit(seg, t_in, -d, tol)]
            pieces.append(('L', A2, B2)); pts[s1] = B2; cur = s1; t_in = d
        pieces += [('C', x) for x in fit(pts[cur:], t_in, t2, tol)]
    p0 = pieces[0][1][0] if pieces[0][0] == 'C' else pieces[0][1]
    d = f"M{p0[0]/S:.2f},{p0[1]/S:.2f}"; samples = []
    for kind, *v in pieces:
        if kind == 'L':
            d += f" L{v[1][0]/S:.2f},{v[1][1]/S:.2f}"; samples.append(np.linspace(v[0], v[1], 80))
        else:
            ctrl = v[0]; d += " C" + " ".join(f"{x/S:.2f},{y/S:.2f}" for x, y in ctrl[1:]); samples.append(bez(ctrl, np.linspace(0, 1, 80)))
    return d + "Z", np.vstack(samples), c, pieces, tips

def iou_vs(alpha, pts):
    m = np.zeros(alpha.shape, bool); rr, cc = _poly(pts[:, 1], pts[:, 0], alpha.shape); m[rr, cc] = True
    b = alpha > 0.5; return (m & b).sum() / (m | b).sum()
