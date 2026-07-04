import os
import shutil

print("Copying scaffolded Vite project files...")

# Move package.json, config, index.html
if os.path.exists("temp-vite/package.json"):
    shutil.copy("temp-vite/package.json", "package.json")
if os.path.exists("temp-vite/vite.config.js"):
    shutil.copy("temp-vite/vite.config.js", "vite.config.js")
if os.path.exists("temp-vite/index.html"):
    shutil.copy("temp-vite/index.html", "index.html")

# Copy src directory
if os.path.exists("temp-vite/src"):
    if os.path.exists("src"):
        shutil.rmtree("src")
    shutil.copytree("temp-vite/src", "src")

# Copy public contents safely
if os.path.exists("temp-vite/public"):
    for item in os.listdir("temp-vite/public"):
        s = os.path.join("temp-vite/public", item)
        d = os.path.join("public", item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)

# Remove temp-vite
if os.path.exists("temp-vite"):
    shutil.rmtree("temp-vite")

print("Vite project copy complete. Cleaned up temp-vite.")
