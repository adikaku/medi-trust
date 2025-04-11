import sys
import json
import os
from my_ocr_script import GenericAlternativeFinder

if __name__ == "__main__":
    print(f"[DEBUG] CLI arguments: {sys.argv}", file=sys.stderr)

    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(f"[ERROR] File not found: {image_path}")
        exit()

    # MongoDB connection settings
    MONGODB_URI = "mongodb+srv://anusharawat04:Anuwho27%21%3F@cluster0.7g7qd1j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    DB_NAME = "meditrust"
    MEDICINE_COLLECTION = "medicines"
    GENERIC_COLLECTION = "generic_med"

    try:
        finder = GenericAlternativeFinder(MONGODB_URI, DB_NAME, MEDICINE_COLLECTION, GENERIC_COLLECTION)
        original_medicine, generic_alternative = finder.process_image_find_generic(image_path)
        json_result = finder.get_json_results(original_medicine, generic_alternative)

        # 👇 Only this will be captured by Node.js
        print(json.dumps(json_result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)