import sys, numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd
src, out, lift = sys.argv[1], sys.argv[2], float(sys.argv[3])
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
Lr = im.max(axis=2); L = nd.gaussian_filter(Lr, 1.0)
# generous hand bound around the book (image coordinates), keeps floor highlights out
hull = np.array([(80,560),(270,385),(600,275),(700,285),(880,420),(1000,330),(1280,240),(1300,250),(1352,280),(1405,318),
                 (1455,372),(1510,425),(1545,478),(1560,560),(1600,575),(1600,600),(1410,805),(1380,812),(660,712),(625,680),(85,615)], np.int32)
bound = np.zeros((H,W), np.uint8); cv2.fillPoly(bound, [hull], 1)
core = nd.binary_erosion((L > 120) & (bound > 0), iterations=3)
gm = np.full((H,W), cv2.GC_BGD, np.uint8)
gm[bound > 0] = cv2.GC_PR_BGD
gm[(L > 70) & (bound > 0)] = cv2.GC_PR_FGD
gm[core] = cv2.GC_FGD
bright = np.clip((im/255.0)**0.5*255, 0, 255).astype(np.uint8)[..., ::-1].copy()
bgd = np.zeros((1,65)); fgd = np.zeros((1,65))
cv2.grabCut(bright, gm, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
m = (gm == cv2.GC_FGD) | (gm == cv2.GC_PR_FGD)
polyA = np.array([(560,301),(600,290),(637,281),(660,285),(700,297),(740,313),(780,335),(820,365),(850,395),(876,434),(900,408),(920,388),(940,370),(960,353),(980,338),(1000,326),(1040,307),(1080,293),(1120,281),(1160,271),(1200,264),(1240,258),(1285,253),(1285,330),(1000,420),(876,470),(700,440),(560,400)], np.int32)
polyC = np.array([(98,582),(100,601),(120,602),(200,607),(300,616),(400,628),(500,641),(580,652),(612,658),(626,668),(636,680),(645,692),(662,700),(685,698),(700,700),(800,714),(900,729),(1000,744),(1100,757),(1200,771),(1300,785),(1345,791),(1362,799),(1392,799),(1402,790),(1402,760),(1000,700),(700,670),(600,630),(300,590),(98,575)], np.int32)
extra = np.zeros((H,W), np.uint8); cv2.fillPoly(extra, [polyA, polyC], 1)
m = m | (extra > 0)
m = nd.binary_fill_holes(nd.binary_closing(m, structure=np.ones((5,5))))
lab, n = nd.label(m); m = lab == (1 + int(np.argmax(nd.sum(m, lab, range(1, n+1)))))
m = nd.binary_opening(m, structure=np.ones((3,3)))
a = nd.gaussian_filter(m.astype(np.float32), 0.9)
al = (Lr/255.0)**0.6
B = np.array([238,238,242], np.float32)
C = np.clip(im + (1-al)[...,None]*B*lift, 0, 255)
mf = m.astype(np.float32)
sh = nd.gaussian_filter(np.roll(mf, 34, axis=0), 34) * 0.26 + nd.gaussian_filter(np.roll(mf, 9, axis=0), 8) * 0.20
sa = np.clip(sh, 0, 0.42) * (1-a)
alpha = a + sa
rgb = (C*a[...,None]) / np.maximum(alpha, 1e-4)[...,None]
rgba = np.dstack([np.clip(rgb,0,255), np.clip(alpha,0,1)*255]).astype(np.uint8)
ys, xx = np.where(alpha > 0.012)
box = (max(xx.min()-10,0), max(ys.min()-10,0), min(xx.max()+10,W), min(ys.max()+10,H))
img = Image.fromarray(rgba, 'RGBA').crop(box)
img.save(out, 'WEBP', quality=84, method=6)
bg = Image.new('RGBA', img.size, (245,245,247,255)); bg.alpha_composite(img); bg.convert('RGB').save(out.replace('.webp','-preview.png'))
# outline check on brightened original
chk = bright[..., ::-1].copy(); edge = m ^ nd.binary_erosion(m, iterations=2); chk[edge] = (255,0,80)
Image.fromarray(chk).save(out.replace('.webp','-outline.png'))
print(img.size, box)
