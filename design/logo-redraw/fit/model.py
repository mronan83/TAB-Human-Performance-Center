"""Constructive mark: each part is a closed path of cubic Beziers, smooth (G1) everywhere except at its two sharp
tips. Knots carry a position, a tangent angle and two handle lengths, so smoothness holds for any parameter values.
Parameters are optimised so the filled shape matches the board's anti-aliased mask."""
import numpy as np
from scipy import ndimage as ndi, optimize
from skimage.draw import polygon
from fit import contour, corners, smooth_open, fit, unit, bez

def init_from_board(alpha, S=8, sigma=32, tol=14.0, trim=14, tan_k=10):
    c = contour(alpha); idx, _ = corners(c, 2)
    runs = [smooth_open(np.r_[c, c][a:b+1], sigma)[trim:-trim] for a, b in zip(idx, idx[1:] + [idx[0] + len(c)])]
    from fit import line_intersect
    tips = []
    for i in range(2):
        A = runs[i]; B = runs[(i + 1) % 2]
        tips.append(line_intersect(A[-1], unit(A[-1] - A[-1 - tan_k]), B[0], unit(B[0] - B[tan_k])))
    knots = []  # per run: list of (point, angle_in, h_in, h_out) for interior knots + endpoint tangents
    model = []
    for i, r in enumerate(runs):
        pts = np.r_[tips[i - 1][None], r, tips[i][None]]
        segs = fit(pts, unit(r[tan_k] - r[0]), unit(r[-1 - tan_k] - r[-1]), tol)
        model.append(segs)
    return model, tips

def pack(model, tips):
    """Vector: tips (2x2); for each run: start tangent angle + start handle; interior knots (x,y,angle,hin,hout); end angle + end handle."""
    v = [tips[0], tips[1]]; spec = []
    for segs in model:
        n = len(segs); spec.append(n)
        s0 = segs[0]; d = s0[1] - s0[0]; v.append([np.arctan2(d[1], d[0]), np.hypot(*d)])
        for k in range(n - 1):
            a, b = segs[k], segs[k + 1]; p = b[0]; dout = b[1] - p; din = p - a[2]
            ang = np.arctan2(dout[1] + din[1], dout[0] + din[0])
            v.append([p[0], p[1], ang, np.hypot(*din), np.hypot(*dout)])
        e = segs[-1]; d = e[2] - e[3]; v.append([np.arctan2(d[1], d[0]), np.hypot(*d)])
    return np.concatenate([np.ravel(x) for x in v]), spec

def unpack(x, spec):
    i = 0; tips = [x[0:2], x[2:4]]; i = 4; runs = []
    for r, n in enumerate(spec):
        start = tips[r - 1] if r == 0 else tips[0]
        start, end = (tips[1], tips[0]) if r == 0 else (tips[0], tips[1])
        a0, h0 = x[i:i+2]; i += 2
        knots = []
        for k in range(n - 1): knots.append(x[i:i+5]); i += 5
        a1, h1 = x[i:i+2]; i += 2
        P = [start] + [k[:2] for k in knots] + [end]
        segs = []
        for k in range(n):
            p0, p1 = P[k], P[k + 1]
            c1 = p0 + h0 * np.array([np.cos(a0), np.sin(a0)]) if k == 0 else p0 + knots[k-1][4] * np.array([np.cos(knots[k-1][2]), np.sin(knots[k-1][2])])
            c2 = p1 + h1 * np.array([np.cos(a1), np.sin(a1)]) if k == n - 1 else p1 - knots[k][3] * np.array([np.cos(knots[k][2]), np.sin(knots[k][2])])
            segs.append(np.array([p0, c1, c2, p1]))
        runs.append(segs)
    return runs

def outline(runs, n=40):
    return np.vstack([bez(s, np.linspace(0, 1, n, endpoint=False)) for segs in runs for s in segs])

def raster(pts, shape, ss):
    m = np.zeros((shape[0] * ss, shape[1] * ss), np.float32)
    rr, cc = polygon(pts[:, 1] * ss, pts[:, 0] * ss, m.shape); m[rr, cc] = 1
    return m.reshape(shape[0], ss, shape[1], ss).mean((1, 3))

def path_d(runs, S=8):
    p0 = runs[0][0][0]; d = f"M{p0[0]/S:.2f},{p0[1]/S:.2f}"
    for segs in runs:
        for s in segs: d += " C" + " ".join(f"{x/S:.2f},{y/S:.2f}" for x, y in s[1:])
    return d + "Z"
