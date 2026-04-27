import cv2
import os
import numpy as np

input_path = "/Users/joshuav/.gemini/antigravity/brain/a8264400-d117-4be1-8288-8284f460b027/byd_seal_base_1777326285620.png"
output_dir = "/Users/joshuav/Desktop/CargaIA/assets/car-sequence"

os.makedirs(output_dir, exist_ok=True)

print("Loading image...")
img = cv2.imread(input_path, cv2.IMREAD_COLOR)
if img is None:
    print("Error cargando la imagen")
    exit(1)

h, w = img.shape[:2]

# Create a 1920x1080 canvas
canvas_w, canvas_h = 1920, 1080

print("Generating 60 frames...")
for i in range(60):
    progress = i / 59.0 # 0.0 to 1.0
    
    # Calculate scale: starts smaller, ends larger
    scale = 1.0 + (progress * 0.5) # 1.0 to 1.5
    
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized_img = cv2.resize(img, (new_w, new_h))
    
    # Calculate offset for a slow pan from right to left
    # and slightly upwards
    x_offset = int((canvas_w - new_w) / 2 + (canvas_w * 0.1) - (progress * canvas_w * 0.2))
    y_offset = int((canvas_h - new_h) / 2 + (canvas_h * 0.05) - (progress * canvas_h * 0.1))
    
    canvas = np.zeros((canvas_h, canvas_w, 3), dtype=np.uint8)
    
    y1, y2 = max(0, y_offset), min(canvas_h, y_offset + new_h)
    x1, x2 = max(0, x_offset), min(canvas_w, x_offset + new_w)
    
    y1o, y2o = max(0, -y_offset), new_h - max(0, y_offset + new_h - canvas_h)
    x1o, x2o = max(0, -x_offset), new_w - max(0, x_offset + new_w - canvas_w)
    
    if y1 < y2 and x1 < x2:
        canvas[y1:y2, x1:x2] = resized_img[y1o:y2o, x1o:x2o]
        
    # Save frame as PNG to preserve the standard format the site expects
    out_path = os.path.join(output_dir, f"frame_{i+1:04d}.png")
    cv2.imwrite(out_path, canvas)
    
print("Done! Sequence generated successfully.")
