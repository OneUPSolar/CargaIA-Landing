import cv2
import os

video_path = "byd_seal.mp4"
output_dir = "assets/car-sequence"
target_frames = 60

os.makedirs(output_dir, exist_ok=True)
cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

if total_frames == 0:
    print("Video is empty")
    exit(1)

step = max(1, total_frames // target_frames)
print(f"Extracting {target_frames} frames directly from video...")

frame_count = 1
current_frame = 0

while cap.isOpened() and frame_count <= target_frames:
    cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame)
    ret, frame = cap.read()
    if not ret:
        break
        
    out_path = os.path.join(output_dir, f"frame_{frame_count:04d}.png")
    cv2.imwrite(out_path, frame)
    
    frame_count += 1
    current_frame += step

cap.release()
print("Done extracting raw frames!")
