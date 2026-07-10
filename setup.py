#!/usr/bin/env python3
"""
Rakshita Project Setup Script
Sets up the development environment for the Rakshita women's safety app.
Initializes Flask backend and React Native mobile app dependencies.
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(cmd, cwd=None, description=None):
    """Run a shell command and report results."""
    if description:
        print(f"\n{'='*60}")
        print(f"📦 {description}")
        print('='*60)
    
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=True, text=True)
        print(f"✅ Success: {description or cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {description or cmd}")
        print(f"Error: {e}")
        return False


def setup_flask_backend():
    """Set up Flask backend environment."""
    base_dir = Path(__file__).parent
    rakshita_dir = base_dir / "rakshita"
    
    print("\n🔧 Setting up Flask Backend...")
    
    # Copy .env.example to .env if .env doesn't exist
    env_file = rakshita_dir / ".env"
    env_example = base_dir / ".env.example"
    
    if not env_file.exists() and env_example.exists():
        print(f"📋 Creating .env from .env.example...")
        with open(env_example, 'r') as src:
            with open(env_file, 'w') as dst:
                dst.write(src.read())
        print(f"✅ Created {env_file}")
    
    # Install Python dependencies
    if (rakshita_dir / "requirements.txt").exists():
        run_command(
            f"{sys.executable} -m pip install -r requirements.txt",
            cwd=str(rakshita_dir),
            description="Installing Flask dependencies"
        )
    
    return True


def setup_mobile_app():
    """Set up React Native mobile app environment."""
    base_dir = Path(__file__).parent
    mobile_dir = base_dir / "rakshita-mobile"
    
    print("\n📱 Setting up React Native Mobile App...")
    
    # Install Node dependencies
    if (mobile_dir / "package.json").exists():
        run_command(
            "npm install",
            cwd=str(mobile_dir),
            description="Installing npm dependencies (this may take a few minutes)"
        )
    
    return True


def verify_installation():
    """Verify that all required tools are installed."""
    print(f"\n{'='*60}")
    print("🔍 Verifying Installation")
    print('='*60)
    
    checks = [
        ("Python", f"{sys.executable} --version"),
        ("pip", f"{sys.executable} -m pip --version"),
        ("Node.js", "node --version"),
        ("npm", "npm --version"),
    ]
    
    for tool, cmd in checks:
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            version = result.stdout.strip().split('\n')[0]
            print(f"✅ {tool}: {version}")
        except subprocess.CalledProcessError:
            print(f"❌ {tool}: Not installed or not in PATH")
            return False
    
    return True


def print_next_steps():
    """Print instructions for running the project."""
    print(f"\n{'='*60}")
    print("🚀 Next Steps")
    print('='*60)
    print("""
📱 To start the mobile app:
   cd rakshita-mobile
   npm install (if not done)
   npx expo start
   
🔧 To start the Flask backend:
   cd rakshita
   pip install -r requirements.txt (if not done)
   python app.py
   
📚 For more information, see README.md
""")


def main():
    """Main setup function."""
    print("""
╔════════════════════════════════════════════════════════════════╗
║                  RAKSHITA PROJECT SETUP                        ║
║          Women's Safety Mobile Application                     ║
╚════════════════════════════════════════════════════════════════╝
""")
    
    # Check if we have required tools
    if not verify_installation():
        print("\n❌ Required tools not found. Please install Node.js and Python 3.8+")
        sys.exit(1)
    
    # Setup backend
    if not setup_flask_backend():
        print("\n⚠️  Flask setup encountered issues, but continuing...")
    
    # Setup mobile app
    if not setup_mobile_app():
        print("\n⚠️  Mobile app setup encountered issues, but continuing...")
    
    # Print next steps
    print_next_steps()
    
    print(f"\n{'='*60}")
    print("✨ Setup Complete!")
    print('='*60)


if __name__ == "__main__":
    main()
