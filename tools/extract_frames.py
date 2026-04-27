#!/usr/bin/env python3
"""
BYD SEAL Frame Extractor (Apple Style)
======================================
Este script toma un video (ej. un paneo de 360 grados de un BYD Seal) y extrae 
exactamente 60 cuadros (frames), eliminando el fondo para usarlos en el 
Canvas de la landing page.

Requisitos previos:
pip install opencv-python rembg Pillow
"""

import cv2
import os
import sys
import numpy as np
from PIL import Image

try:
    from rembg import remove
except ImportError:
    print("Error: Falta instalar rembg. Ejecuta: pip install rembg")
    sys.exit(1)

def extract_and_process(video_path, output_dir="assets/car-sequence", target_frames=60):
    if not os.path.exists(video_path):
        print(f"Error: No se encontró el video en {video_path}")
        return

    # Crear directorio si no existe (relativo al root del proyecto)
    os.makedirs(output_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if total_video_frames == 0:
        print("El video está vacío o es inválido.")
        return

    # Calcular el intervalo para obtener exactamente target_frames
    step = max(1, total_video_frames // target_frames)
    
    print(f"[{total_video_frames} frames totales] Extrayendo {target_frames} frames sin fondo...")

    frame_count = 1
    current_frame = 0

    from rembg import new_session
    print("Loading rembg model...")
    session = new_session(providers=['CPUExecutionProvider'])

    while cap.isOpened() and frame_count <= target_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame)
        ret, frame = cap.read()
        
        if not ret:
            break

        # Convertir BGR (OpenCV) a RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)

        print(f"Procesando frame {frame_count:04d}/{target_frames:04d} con IA (rembg)...")
        # Remover fondo con IA usando explícitamente CPU
        transparent_image = remove(pil_image, session=session)

        # Guardar como frame_0001.png, frame_0002.png...
        output_filename = os.path.join(output_dir, f"frame_{frame_count:04d}.png")
        transparent_image.save(output_filename, "PNG")

        frame_count += 1
        current_frame += step

    cap.release()
    print("\n¡Extracción completada!")
    print(f"Revisa la carpeta '{output_dir}'. Tu Canvas ahora debería funcionar automáticamente.")

if __name__ == "__main__":
    print("--------------------------------------------------")
    print("CargaIA - Generador de Secuencia 360 para Canvas")
    print("--------------------------------------------------")
    video_file = input("Arrastra el video aquí (ej. video_byd.mp4) y presiona Enter: ").strip().strip("'\"")
    
    # Se espera que el comando se ejecute desde la raíz del proyecto
    extract_and_process(video_file)
