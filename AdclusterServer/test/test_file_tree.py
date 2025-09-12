import os

UPLOAD_BASE_DIR = "uploads"

def build_file_tree(base_path):
    tree = {}
    for root, dirs, files in os.walk(base_path):
        # Get relative path from base_path
        rel_path = os.path.relpath(root, base_path)
        if rel_path == ".":
            rel_path = ""
        
        # Navigate to the correct position in the tree
        current = tree
        if rel_path:
            for part in rel_path.split(os.sep):
                if part not in current:
                    current[part] = {}
                current = current[part]
        
        # Add files to current directory
        current_files = []
        for filename in files:
            if filename != "README.md":  # Skip the README file
                file_path = os.path.join(root, filename)
                file_stat = os.stat(file_path)
                current_files.append({
                    "filename": filename,
                    "path": file_path,
                    "size": file_stat.st_size,
                    "modified": file_stat.st_mtime
                })
        current["_files"] = current_files
    return tree

def convert_tree_to_list(tree, path=""):
    result = []
    for key, value in tree.items():
        if key == "_files":
            # Add files directly to the result
            result.extend(value)
        else:
            # This is a folder
            folder_path = os.path.join(path, key) if path else key
            folder_contents = convert_tree_to_list(value, folder_path)
            result.append({
                "type": "folder",
                "name": key,
                "path": folder_path,
                "contents": folder_contents
            })
    return result

# Test the function
file_tree = build_file_tree(UPLOAD_BASE_DIR)
files = convert_tree_to_list(file_tree)

print("File tree structure:")
print(files)