import os
import shutil
import glob
import torch

def prepare_training_data(source_dir, target_dir):
    """
    Prepares training data for RVC by moving clean vocals to the model directory.
    Uses MPS (Metal Performance Shaders) for operations if applicable.
    """
    # Check for MPS availability
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("Metal Performance Shaders (MPS) is available and will be used.")
    else:
        device = torch.device("cpu")
        print("MPS is NOT available, using CPU.")

    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    # We look for wav files specifically in the htdemucs output
    # htdemucs usually creates subfolders for each track
    search_pattern = os.path.join(source_dir, "**/vocals.wav")
    vocal_files = glob.glob(search_pattern, recursive=True)

    if not vocal_files:
        # Fallback to any wav file in the source dir
        search_pattern = os.path.join(source_dir, "**/*.wav")
        vocal_files = glob.glob(search_pattern, recursive=True)

    print(f"Found {len(vocal_files)} vocal files to prepare.")

    for i, file_path in enumerate(vocal_files):
        # Create a unique name to avoid collisions
        filename = f"sample_{i}_{os.path.basename(os.path.dirname(file_path))}_{os.path.basename(file_path)}"
        dest_path = os.path.join(target_dir, filename)
        
        try:
            shutil.copy2(file_path, dest_path)
            # print(f"Copied: {filename}")
        except Exception as e:
            print(f"Error copying {file_path}: {e}")

    print(f"Preparation complete. Data stored in: {target_dir}")

if __name__ == "__main__":
    SOURCE = "voces-limpias/htdemucs"
    TARGET = "models/masculine/dataset"
    
    # Ensure source exists before running
    if os.path.exists(SOURCE):
        prepare_training_data(SOURCE, TARGET)
    else:
        print(f"Source directory {SOURCE} not found. Please ensure Demucs has been run.")
