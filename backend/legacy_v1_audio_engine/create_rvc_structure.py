import os

def create_structure():
    base_path = os.getcwd()
    models_dir = os.path.join(base_path, "models")
    
    subdirs = [
        os.path.join(models_dir, "masculine"),
        os.path.join(models_dir, "feminine")
    ]
    
    for subdir in subdirs:
        if not os.path.exists(subdir):
            os.makedirs(subdir)
            print(f"Created directory: {subdir}")
        else:
            print(f"Directory already exists: {subdir}")

if __name__ == "__main__":
    create_structure()
