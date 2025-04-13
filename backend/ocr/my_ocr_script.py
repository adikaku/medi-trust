import pandas as pd
import numpy as np
import re
from collections import defaultdict
from paddleocr import PaddleOCR
from PIL import Image
import os
import tabulate
from pymongo import MongoClient
import certifi  # Add this import

class MedicineOCR:
    def __init__(self, mongodb_uri, db_name, medicine_collection_name):
        # Initialize PaddleOCR
        self.ocr_model = PaddleOCR(use_angle_cls=True, lang='en')  # With angle correction
        
        # Connect to MongoDB Atlas with SSL certificate fix
        try:
            # Use certifi to locate the CA certificate bundle
            self.client = MongoClient(mongodb_uri, tlsCAFile=certifi.where())
            self.db = self.client[db_name]
            self.medicine_collection = self.db[medicine_collection_name]
            print("[DEBUG] MongoDB Connection Established Successfully")
            print(f"[DEBUG] Connected to database '{db_name}', collection '{medicine_collection_name}'")
        except Exception as e:
            print(f"[ERROR] Failed to connect to MongoDB: {e}")
            exit()
    
    # Utility function to normalize text
    def clean_text(self, text):
        if pd.isna(text):
            return ""
        return re.sub(r'\s+', ' ', text.replace('-', ' ')).strip()
    
    # Function to extract and clean text using PaddleOCR
    def extract_largest_text(self, image_path):
        """Extracts text from image using PaddleOCR and filters it."""
        result = self.ocr_model.ocr(image_path)
        
        if not result or not result[0]:
            print("[ERROR] OCR did not return any results.")
            return None
        
        # Collect all recognized text strings
        extracted_text = [line[1][0] for line in result[0]]
        print("[DEBUG] Extracted Text (Raw):", extracted_text)
        
        # Combine all into one string and clean
        combined_text = " ".join(extracted_text)
        extracted_words = re.findall(r'\b[a-zA-Z0-9-]+\b', combined_text.lower())
        
        # Normalize hyphens to spaces and collapse multiple spaces
        extracted_words = [self.clean_text(word) for word in extracted_words]
        
        # Filter common noise words
        stop_words = {"tablets", "mg", "p", "i", "a", "es", "seers", "cu", "lh", "ts", "sol", "r", "sere"}
        extracted_words = [word for word in extracted_words if word not in stop_words and len(word) > 3]
        
        print("[DEBUG] Extracted Words (Filtered):", extracted_words)
        return extracted_words, combined_text
    
    # Function to find best match in the database
    def find_best_match(self, extracted_words):
        """Find the best matching medicine row based on extracted words."""
        if not extracted_words:
            print("[DEBUG] No extracted words found!")
            return None
        
        # Get all medicines from MongoDB
        all_medicines = list(self.medicine_collection.find())
        
        if not all_medicines:
            print("[DEBUG] No medicines found in the database.")
            return None
        
        print("[DEBUG] Extracted Words for Matching:", extracted_words)
        
        # Create a list to store matches and their scores
        matches = []
        
        for medicine in all_medicines:
            # Get relevant fields and convert to lowercase
            name = self.clean_text(medicine.get('name', '').lower())
            salt_composition = self.clean_text(medicine.get('salt_composition', '').lower())
            manufacturer_name = self.clean_text(medicine.get('manufacturer_name', '').lower())
            
            # Check if any extracted word is in any of the fields
            match_found = False
            for word in extracted_words:
                if (word in name) or (word in salt_composition) or (word in manufacturer_name):
                    match_found = True
                    break
            
            if match_found:
                # Calculate matching score
                score = 0
                for word in extracted_words:
                    if word in name:
                        score += 3
                    elif word in salt_composition:
                        score += 2
                    elif word in manufacturer_name:
                        score += 1
                
                # Add to matches with score
                medicine['match_score'] = score
                matches.append(medicine)
        
        print("[DEBUG] Matching Rows Found:", len(matches))
        
        if not matches:
            print("[DEBUG] No match found in database.")
            return None
        
        # Sort matches by score and get the best one
        best_match = sorted(matches, key=lambda x: x['match_score'], reverse=True)[0]
        
        # Create a dictionary with required fields
        result = {
            'name': best_match.get('name', ''),
            'salt_composition': best_match.get('salt_composition', ''),
            'manufacturer_name': best_match.get('manufacturer_name', ''),
            'medicine_desc': best_match.get('medicine_desc', '')
        }
        
        # Add optional fields if they exist
        if 'side_effects' in best_match:
            result['side_effects'] = best_match['side_effects']
        if 'price(₹)' in best_match:
            result['price(₹)'] = best_match['price(₹)']
        if 'pack_size_label' in best_match:
            result['pack_size_label'] = best_match['pack_size_label']
            
        return result
    
    # Process an image and find matching medicine
    def process_image(self, image_path):
        # Print image filename for reference
        print(f"\n[INFO] Processing image: {os.path.basename(image_path)}")
        
        extracted_words, raw_text = self.extract_largest_text(image_path)
        
        if extracted_words:
            best_match = self.find_best_match(extracted_words)
            
            if best_match is not None:
                print("[RESULT] Best Matching Medicine Found")
                return best_match, raw_text
            else:
                print("[RESULT] No exact match found in the database.")
                return None, raw_text
        else:
            print("[RESULT] No text extracted from the image.")
            return None, None


class GenericAlternativeFinder(MedicineOCR):
    def __init__(self, mongodb_uri, db_name, medicine_collection_name, generic_collection_name):
        # Initialize the parent class
        super().__init__(mongodb_uri, db_name, medicine_collection_name)
        
        # Connect to generic collection
        try:
            self.generic_collection = self.db[generic_collection_name]
            print(f"[DEBUG] Connected to generic collection '{generic_collection_name}'")
        except Exception as e:
            print(f"[ERROR] Failed to connect to generic collection: {e}")
            exit()
    
    # Function to normalize generic_medicine text and extract structured information
    def normalize_medicine_text(self, text):
        if pd.isna(text):
            return "", {}
        
        # Convert to lowercase and remove extra spaces
        text = text.lower().strip()
        
        # Remove common stop words and irrelevant terms
        stop_words = ['ip', 'tablet', 'tablets', 'capsule', 'capsules', 'oral', 'solution', 'injection', 'syrup']
        for word in stop_words:
            text = re.sub(r'\b' + word + r'\b', '', text, flags=re.IGNORECASE)
        
        # Remove special characters except for spaces and numbers
        clean_text = re.sub(r'[^a-z0-9\s]', '', text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Extract medicine name and dosage information
        ingredients = {}
        
        # Look for ingredients with dosages
        matches = re.findall(r'([a-z]+)\s*(\d+\.?\d*)\s*(mg|ml|g|mcg)?', text)
        for match in matches:
            ingredient = match[0].strip()
            dosage = float(match[1])
            unit = match[2] if match[2] else 'mg'  # Default unit
            
            # Normalize to mg for comparison
            if unit == 'g':
                dosage *= 1000
            elif unit == 'mcg':
                dosage /= 1000
            
            ingredients[ingredient] = dosage
        
        return clean_text, ingredients
    
    # Function to calculate similarity between medicines
    def medicine_similarity(self, med1, med2):
        # Normalize and extract information
        clean1, ingredients1 = self.normalize_medicine_text(med1)
        clean2, ingredients2 = self.normalize_medicine_text(med2)
        
        # Text-based similarity (for when ingredient extraction might fail)
        words1 = set(clean1.split())
        words2 = set(clean2.split())
        
        # Remove numbers from word sets for name-only comparison
        words1_no_numbers = {word for word in words1 if not re.match(r'^\d+$', word)}
        words2_no_numbers = {word for word in words2 if not re.match(r'^\d+$', word)}
        
        # Calculate text similarity using Jaccard
        if words1_no_numbers and words2_no_numbers:
            name_similarity = len(words1_no_numbers & words2_no_numbers) / len(words1_no_numbers | words2_no_numbers)
        else:
            name_similarity = 0
        
        # Ingredient-based similarity
        if ingredients1 and ingredients2:
            # Common ingredients
            common_ingredients = set(ingredients1.keys()) & set(ingredients2.keys())
            all_ingredients = set(ingredients1.keys()) | set(ingredients2.keys())
            
            if common_ingredients:
                # Ingredient match score
                ingredient_match = len(common_ingredients) / len(all_ingredients)
                
                # Dosage similarity for common ingredients
                dosage_similarity = 0
                for ingredient in common_ingredients:
                    dose1 = ingredients1[ingredient]
                    dose2 = ingredients2[ingredient]
                    
                    # Calculate relative difference with tolerance
                    max_dose = max(dose1, dose2)
                    if max_dose > 0:
                        relative_diff = abs(dose1 - dose2) / max_dose
                        # Accept up to 20% variation in dosage
                        sim = max(0, 1 - min(relative_diff, 1))
                        dosage_similarity += sim
                
                # Average dosage similarity
                avg_dosage_similarity = dosage_similarity / len(common_ingredients)
                
                # Combined ingredient-based score
                ingredient_similarity = 0.7 * ingredient_match + 0.3 * avg_dosage_similarity
            else:
                ingredient_similarity = 0
        else:
            ingredient_similarity = 0
        
        # Combine text-based and ingredient-based similarity
        # Weight ingredient-based higher when available
        if ingredient_similarity > 0:
            return 0.3 * name_similarity + 0.7 * ingredient_similarity
        else:
            return name_similarity
    
    # Function to find the best generic alternative
    def find_best_generic(self, detected_text, threshold=0.5):
        # Get all generic medicines from MongoDB
        all_generics = list(self.generic_collection.find())
        
        if not all_generics:
            print("[DEBUG] No generic medicines found in the database.")
            return None
        
        # Calculate similarity for each generic medicine
        generic_matches = []
        for generic in all_generics:
            if 'generic_name' in generic and generic['generic_name']:
                similarity = self.medicine_similarity(detected_text, generic['generic_name'])
                generic['similarity_score'] = similarity
                generic_matches.append(generic)
        
        # Sort by similarity score
        sorted_matches = sorted(generic_matches, key=lambda x: x.get('similarity_score', 0), reverse=True)
        
        # Get the best match if it meets the threshold
        if sorted_matches and sorted_matches[0]['similarity_score'] >= threshold:
            return sorted_matches[0]
        else:
            return None

    # Process an image end-to-end
    def process_image_find_generic(self, image_path, threshold=0.5):
        # First, find the medicine using OCR and database matching
        medicine_match, raw_text = self.process_image(image_path)
        
        if medicine_match is not None:
            # Use salt_composition to find generic alternatives
            salt_composition = medicine_match['salt_composition']
            print(f"[INFO] Searching for generic alternatives for: {salt_composition}")
            salt_composition= salt_composition.replace("+", " ")
            salt_composition = salt_composition.replace("(", "").replace(")", "")
            # Find the best generic match
            generic_match = self.find_best_generic(salt_composition, threshold)
            
            if generic_match is not None:
                print("[RESULT] Best Generic Alternative Found")
                return medicine_match, generic_match
            else:
                print("[RESULT] No suitable generic alternatives found.")
                return medicine_match, None
        else:
            print("[RESULT] Cannot find generic alternatives without identifying the medicine first.")
            return None, None
    def get_json_results(self, original_medicine, generic_alternative):
        """
        Returns a structured JSON object with medicine and generic alternative details
        """
        result = {}
        
        # Add original medicine data
        if original_medicine is not None:
            result["name"] = original_medicine.get('name', '')
            result["salt_composition"] = original_medicine.get('salt_composition', '')
            result["manufacturer"] = original_medicine.get('manufacturer_name', '')
            result["description"] = original_medicine.get('medicine_desc', '')
            result["side_effects"] = original_medicine.get('side_effects', '')
            
            # Handle price - convert to number
            price_str = original_medicine.get('price(₹)', '')
            try:
                result["price"] = float(price_str)
            except (ValueError, TypeError):
                result["price"] = 0
                
            result["pack_size"] = original_medicine.get('pack_size_label', '')
            
            # Add generic alternative if available
            if generic_alternative is not None:
                
                   result[ "generic_name"]= generic_alternative.get('generic_name', '')
                   result["unit_size"] =generic_alternative.get('unit_size', '')
                   result["mrp"]= float(generic_alternative.get('mrp', 0))
                
        
        return result        
    # Display formatted results
    def display_results(self, original_medicine, generic_alternative, raw_text=None):
        # Get JSON structured result
        json_result = self.get_json_results(original_medicine, generic_alternative)
        
        # Import json for pretty printing
        import json
        
       
        # Display OCR raw text if available
        if raw_text:
            print("\n[OCR EXTRACTED TEXT]")
            print(f"{raw_text}")
            print("-"*80)
        
        # Display JSON result
        print("\n[JSON RESULT]")
        print(json.dumps(json_result, indent=2))
        
        
# Main execution example - Updated with security and error handling
if __name__ == "__main__":
    # MongoDB Atlas connection details
    # Consider using environment variables for these credentials
    MONGODB_URI = "mongodb+srv://anusharawat04:Anuwho27%21%3F@cluster0.7g7qd1j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    DB_NAME = "meditrust"
    MEDICINE_COLLECTION = "medicines"
    GENERIC_COLLECTION = "generic_med"
    
    # Path to image
    image_path = "/Users/aggarwaladi123/Downloads/meditrustapp/backend/3.jpg"
    
    # Create finder object
    finder = GenericAlternativeFinder(MONGODB_URI, DB_NAME, MEDICINE_COLLECTION, GENERIC_COLLECTION)
    
    # Process the image end-to-end
    original_medicine, generic_alternative = finder.process_image_find_generic(image_path)
    
    # Display formatted results
    finder.display_results(original_medicine, generic_alternative)
    
    # Get JSON result
    json_result = finder.get_json_results(original_medicine, generic_alternative)
    
    # For API usage, you can return this json_result directly
    # print(json.dumps(json_result))