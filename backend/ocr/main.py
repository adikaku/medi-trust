import sys
import json
import os
from dotenv import load_dotenv
from my_ocr_script import GenericAlternativeFinder

oad_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")

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
    MEDICINE_COLLECTION = "medicines"
    GENERIC_COLLECTION = "generic_med"

    try:
        finder = GenericAlternativeFinder(MONGODB_URI, DB_NAME, MEDICINE_COLLECTION, GENERIC_COLLECTION)
        original_medicine, generic_alternative = finder.process_image_find_generic(image_path)
        json_result = finder.get_json_results(original_medicine, generic_alternative)

     
        print(json.dumps(json_result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
