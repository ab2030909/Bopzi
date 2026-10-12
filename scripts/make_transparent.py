import numpy as np
from PIL import Image
from collections import deque

def make_floodfill_transparent(image_path, output_path, bg_threshold=242, feather_radius=1):
    img = Image.open(image_path).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    
    # White background condition: all R, G, B >= bg_threshold
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    is_white = (r >= bg_threshold) & (g >= bg_threshold) & (b >= bg_threshold)
    
    # Connected component flood fill from the borders only
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    # Add borders to queue
    for x in range(w):
        if is_white[0, x]:
            queue.append((0, x))
            visited[0, x] = True
        if is_white[h - 1, x]:
            queue.append((h - 1, x))
            visited[h - 1, x] = True
    for y in range(h):
        if is_white[y, 0] and not visited[y, 0]:
            queue.append((y, 0))
            visited[y, 0] = True
        if is_white[y, w - 1] and not visited[y, w - 1]:
            queue.append((y, w - 1))
            visited[y, w - 1] = True
            
    # BFS
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in directions:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and is_white[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
                    
    # Now visited contains all connected background pixels
    # Create smooth alpha channel
    alpha = arr[:, :, 3].copy()
    alpha[visited] = 0
    
    # Let's inspect borders of visited for anti-aliasing
    # Near the edge of visited, calculate distance to white
    from scipy.ndimage import distance_transform_edt
    # distance into non-visited
    dist = distance_transform_edt(~visited)
    edge_zone = (dist > 0) & (dist <= 2.0)
    # in edge zone, if brightness is high, modulate alpha smoothly
    brightness = (r.astype(float) + g.astype(float) + b.astype(float)) / 3.0
    for y, x in zip(*np.where(edge_zone)):
        if brightness[y, x] > 220:
            # smooth alpha transition
            ratio = (255 - brightness[y, x]) / (255 - 220)
            alpha[y, x] = int(np.clip(ratio * 255, 0, 255))
            
    arr[:, :, 3] = alpha
    result = Image.fromarray(arr, "RGBA")
    result.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

try:
    make_floodfill_transparent("public/images/mascot.png", "public/images/mascot.png", bg_threshold=242)
    make_floodfill_transparent("public/images/logo.png", "public/images/logo.png", bg_threshold=242)
    print("Successfully processed mascot and logo!")
except Exception as e:
    print("Error:", e)
