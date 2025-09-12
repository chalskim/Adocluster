import requests
import os

# Create test files
def create_test_files():
    # Create a test text file
    with open("test.txt", "w") as f:
        f.write("This is a test text file.")
    
    # Create a test doc file
    with open("test.doc", "w") as f:
        f.write("This is a test doc file.")
    
    # Create a test hwp file
    with open("test.hwp", "w") as f:
        f.write("This is a test hwp file.")
    
    # Create a test image file
    with open("test.jpg", "w") as f:
        f.write("This is a test jpg file.")

def test_file_upload():
    # Create test files
    create_test_files()
    
    # Test uploading different file types
    files_to_upload = ["test.txt", "test.doc", "test.hwp", "test.jpg"]
    
    for filename in files_to_upload:
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "application/octet-stream")}
            response = requests.post("http://localhost:8000/api/upload", files=files)
            print(f"Uploaded {filename}: {response.status_code}")
            print(f"Response: {response.json()}")
            print("---")

if __name__ == "__main__":
    test_file_upload()