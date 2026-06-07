import os

backup_dir = r"C:\Users\고석준\Desktop\temp_backup"
target_dir = r"C:\Users\고석준\Desktop\my_portpolio_web"

files_to_restore = [
    "about.html", "as.html", "board.html", "contact.html", "faq.html", 
    "index.html", "service.html", "solution.html", "support.html", 
    "vtx-drs.html", "vtx-srs.html"
]

for f in files_to_restore:
    src = os.path.join(backup_dir, f)
    dst = os.path.join(target_dir, f)
    if os.path.exists(src):
        with open(src, 'r', encoding='utf-8') as file:
            content = file.read()
        
        content = content.replace('href="solution.html"', 'href="vtx-irs.html"')
        
        with open(dst, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Restored and updated {f}")
