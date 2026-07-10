

import subprocess
import sys

def install_requirements():
    """Install all required packages"""
    packages = [
        "torch>=2.0.0",
        "torchvision>=0.15.0",
        "opencv-python>=4.8.0",
        "ultralytics>=8.0.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "scipy>=1.11.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "python-multipart>=0.0.6",
        "matplotlib>=3.7.0",
        "pillow>=10.0.0",
        "tqdm>=4.66.0",
    ]
    
    print("Installing required packages...")
    for package in packages:
        print(f"\nInstalling {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")
    
    print("\n" + "="*50)
    print("Installation complete!")
    print("="*50)

def create_directory_structure():
    """Create necessary project directories"""
    import os
    
    directories = [
        "data/normal_videos",
        "data/test_videos",
        "checkpoints/week1",
        "checkpoints/week2",
        "checkpoints/week3",
        "uploads",
        "outputs"
    ]
    
    print("\nCreating project directories...")
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created: {directory}")
    
    print("\nDirectory structure ready!")

if __name__ == "__main__":
    print("="*50)
    print("Video Anomaly Detection - Environment Setup")
    print("="*50)
    
    install_requirements()
    create_directory_structure()
    
    print("\n" + "="*50)
    print("Setup completed successfully!")
    print("You can now proceed with training and inference.")
    print("="*50)