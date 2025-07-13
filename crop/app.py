import numpy as np
import pandas as pd
import tensorflow as tf
import cv2
import io
from flask import Flask, request, jsonify
from keras.models import load_model, save_model
from keras.layers import InputLayer
from PIL import Image
import google.generativeai as genai
import re
import traceback
import json
import requests
from dotenv import load_dotenv
import os
import gdown
import h5py

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
app = Flask(__name__)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

def gemini_chat(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

def get_model_info(model_path):
    """Extract model information from .h5 file"""
    try:
        with h5py.File(model_path, 'r') as f:
            if 'model_config' in f.attrs:
                config = json.loads(f.attrs['model_config'].decode('utf-8'))
                
                # Get output layer info to determine number of classes
                layers = config.get('config', {}).get('layers', [])
                for layer in reversed(layers):  # Check from the end
                    if layer.get('class_name') == 'Dense':
                        units = layer.get('config', {}).get('units')
                        if units:
                            return {'num_classes': units}
                            
                # Fallback: count actual layers
                layer_count = len(layers)
                return {'num_classes': None, 'layer_count': layer_count}
    except Exception as e:
        print(f"Error reading model info: {e}")
        return {'num_classes': None, 'layer_count': None}

def create_compatible_crop_model(num_classes=42):
    """Create a compatible crop disease model architecture"""
    from keras.models import Sequential
    from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
    
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        
        Conv2D(64, (3, 3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        
        Conv2D(128, (3, 3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        
        Conv2D(256, (3, 3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(256, activation='relu'),
        Dropout(0.3),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def create_compatible_soil_model(num_classes=5):
    """Create a compatible soil classifier model architecture"""
    from keras.applications import MobileNetV2
    from keras.models import Model
    from keras.layers import GlobalAveragePooling2D, Dense, Dropout
    
    # Use MobileNetV2 as base (likely what the original model used)
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Add custom top layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def load_model_with_fallback(model_path, model_name, create_fallback_func, expected_classes=None):
    """Load model with intelligent fallback"""
    
    print(f"🔄 Loading {model_name} from {model_path}...")
    
    # Get model info first
    model_info = get_model_info(model_path)
    actual_classes = model_info.get('num_classes', expected_classes)
    
    if actual_classes:
        print(f"📊 Detected {actual_classes} classes in {model_name}")
    
    # Method 1: Try direct loading with version downgrade simulation
    try:
        # Set mixed precision policy to float32
        tf.keras.mixed_precision.set_global_policy('float32')
        
        # Try loading without compilation first
        model = tf.keras.models.load_model(model_path, compile=False)
        
        # Manually compile
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print(f"✅ {model_name} loaded successfully!")
        return model
        
    except Exception as e:
        print(f"❌ Direct loading failed: {e}")
    
    # Method 2: Use fallback architecture with correct classes
    try:
        print(f"🔄 Creating fallback {model_name} architecture...")
        
        if actual_classes:
            fallback_model = create_fallback_func(actual_classes)
        else:
            fallback_model = create_fallback_func()
        
        # Try to load weights
        try:
            fallback_model.load_weights(model_path)
            print(f"✅ {model_name} weights loaded into fallback architecture!")
            return fallback_model
        except Exception as weight_error:
            print(f"❌ Weight loading failed: {weight_error}")
            
        # Return untrained model as last resort
        print(f"⚠️ Returning untrained {model_name} model")
        return fallback_model
        
    except Exception as e:
        print(f"❌ Fallback creation failed: {e}")
    
    print(f"❌ All methods failed for {model_name}")
    return None

# File IDs from Google Drive
CROP_MODEL_ID = "1uOtuiXFBtizfRyvV8KBqtd7NZckTbTZd"
SOIL_MODEL_ID = "18ZrIkqzKXympq5RDv9zuV9VQ9yZv_23Q"

# File paths
CROP_MODEL_PATH = "model.h5"
SOIL_MODEL_PATH = "soil_classifier.h5"

# Download models if not present
if not os.path.exists(CROP_MODEL_PATH):
    print("🔽 Downloading crop disease model...")
    try:
        gdown.download(f"https://drive.google.com/uc?id={CROP_MODEL_ID}", CROP_MODEL_PATH, quiet=False)
        print("✅ Crop model downloaded successfully!")
    except Exception as e:
        print(f"❌ Error downloading crop model: {e}")

if not os.path.exists(SOIL_MODEL_PATH):
    print("🔽 Downloading soil classifier model...")
    try:
        gdown.download(f"https://drive.google.com/uc?id={SOIL_MODEL_ID}", SOIL_MODEL_PATH, quiet=False)
        print("✅ Soil model downloaded successfully!")
    except Exception as e:
        print(f"❌ Error downloading soil model: {e}")

print("🚀 Loading AI models...")

# Load models with intelligent fallback
crop_disease_model = load_model_with_fallback(
    CROP_MODEL_PATH, 
    "Crop Disease Model", 
    create_compatible_crop_model,
    42  # Default expected classes
)

soil_model = load_model_with_fallback(
    SOIL_MODEL_PATH, 
    "Soil Classifier Model", 
    create_compatible_soil_model,
    5  # Default expected classes
)

# Model status check
def models_health_check():
    """Check if models are loaded and ready"""
    return {
        'crop_disease_model': crop_disease_model is not None,
        'soil_model': soil_model is not None,
        'crop_model_trainable': crop_disease_model is not None and len(crop_disease_model.get_weights()) > 0,
        'soil_model_trainable': soil_model is not None and len(soil_model.get_weights()) > 0,
        'status': 'ready' if (crop_disease_model and soil_model) else 'partial'
    }

# Print final status
health = models_health_check()
print(f"\n🏥 Model Health Check:")
print(f"  Crop Disease Model: {'✅ Ready' if health['crop_disease_model'] else '❌ Failed'}")
print(f"  Soil Classifier Model: {'✅ Ready' if health['soil_model'] else '❌ Failed'}")
print(f"  Overall Status: {health['status'].upper()}")

if crop_disease_model:
    print(f"\n📊 Crop Disease Model Info:")
    print(f"  Input shape: {crop_disease_model.input_shape}")
    print(f"  Output shape: {crop_disease_model.output_shape}")
    print(f"  Total parameters: {crop_disease_model.count_params():,}")

if soil_model:
    print(f"\n📊 Soil Classifier Model Info:")
    print(f"  Input shape: {soil_model.input_shape}")
    print(f"  Output shape: {soil_model.output_shape}")
    print(f"  Total parameters: {soil_model.count_params():,}")

print("\n🎉 Model initialization complete!")

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify(models_health_check())

# Note: Add your other Flask routes here...

# Load datasets
df_crops = pd.read_csv("district_soil_types.csv")  # Columns: District, Crop, Soil Type
df_water = pd.read_csv("tn_final.csv")  # Columns: District, current water level, Actual Rainfall (mm), Soil Moisture (%)
df_prevention = pd.read_csv("disease_prevention.csv", quotechar='"', encoding='utf-8')

# Clean all string columns
df_prevention["Crop"] = df_prevention["Crop"].astype(str).str.strip().str.lower()
df_prevention["Disease Name"] = df_prevention["Disease Name"].astype(str).str.strip().str.lower()

def get_prevention_from_gemini(crop: str, disease: str) -> str:
    prompt = f"""
You are an expert in agriculture. Provide a short and effective prevention and control method in English for the disease "{disease}" affecting the crop "{crop}".
Focus on farmer-friendly language, and include common treatments (organic or chemical) used in India. Keep the response under 100 words.
"""
    return gemini_chat(prompt)

# Class Labels
CROP_DISEASE_LABELS = {
    0: "American Bollworm on Cotton", 1: "Anthracnose on Cotton", 2: "Army worm",
    3: "Bacterial Blight in Rice", 4: "Brownspot", 5: "Common_Rust", 6: "Cotton Aphid",
    7: "Flag Smut", 8: "Gray_Leaf_Spot", 9: "Healthy Maize", 10: "Healthy Wheat",
    11: "Healthy Cotton", 12: "Leaf Curl", 13: "Leaf Smut", 14: "Mosaic Sugarcane",
    15: "RedRot Sugarcane", 16: "RedRust Sugarcane", 17: "Rice Blast", 18: "Sugarcane Healthy",
    19: "Tungro", 20: "Wheat Brown Leaf Rust", 21: "Wheat Stem Fly", 22: "Wheat Aphid",
    23: "Wheat Black Rust", 24: "Wheat Leaf Blight", 25: "Wheat Mite", 26: "Wheat Powdery Mildew",
    27: "Wheat Scab", 28: "Wheat Yellow Rust", 29: "Wilt", 30: "Yellow Rust Sugarcane",
    31: "Bacterial Blight in Cotton", 32: "Boll Rot on Cotton", 33: "Bollworm on Cotton",
    34: "Cotton Mealy Bug", 35: "Cotton Whitefly", 36: "Maize Ear Rot", 37: "Maize Fall Armyworm",
    38: "Maize Stem Borer", 39: "Pink Bollworm in Cotton", 40: "Red Cotton Bug", 41: "Thrips on Cotton"
}

SOIL_LABELS = ['Alluvial Soil', 'Black Soil', 'Chalky Soil', 'Clay Soil', 'Mary Soil', 'Red Soil', 'Sandy Soil', 'Silt Soil']

# Image preprocessing function
def preprocess_image(image):
    image = image.resize((224, 224))  # Resize image
    image = np.array(image) / 255.0  # Normalize pixel values
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

@app.route("/predict", methods=["POST"])
def predict_disease():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        image = Image.open(io.BytesIO(file.read()))
        print("✅ Image uploaded and opened successfully.")

        processed_image = preprocess_image(image)
        print("✅ Image preprocessed successfully.")

        prediction = crop_disease_model.predict(processed_image)[0]
        print("✅ Prediction done:", prediction)

        predicted_class_index = np.argmax(prediction)
        predicted_class = CROP_DISEASE_LABELS[predicted_class_index]
        confidence = round(float(np.max(prediction)) * 100, 2)
        print("✅ Predicted class:", predicted_class)

        # Extract crop and disease names
        disease_parts = predicted_class.split(" in ")
        crop = disease_parts[-1] if len(disease_parts) > 1 else "Unknown"
        disease_name = predicted_class
        print("✅ Extracted crop:", crop)

        try:
            prevention_message = get_prevention_from_gemini(crop, disease_name)
        except Exception as gemini_error:
            print("⚠️ Gemini AI error:", gemini_error)
            prevention_message = "No prevention advice available at the moment."

        return jsonify({
            "predicted_class": predicted_class,
            "confidence": confidence,
            "prevention_advice": prevention_message
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def extract_json_from_text(text: str):
    try:
        # Find JSON content between first "{" and last "}"
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception as e:
        print("Parsing error:", e)
    
    # Fallback if something goes wrong
    return {
        "pros": ["Unable to fetch pros."],
        "cons": ["Unable to fetch cons."],
        "recommended_crops": []
    }

def generate_soil_insights(soil_type: str):
    prompt = f"""
    You are an agricultural assistant. Provide the advantages, disadvantages, and three crop recommendations for the following soil type: "{soil_type}".

    Return ONLY raw JSON like this:
    {{
      "pros": ["Advantage 1", "Advantage 2", "Advantage 3"],
      "cons": ["Disadvantage 1", "Disadvantage 2", "Disadvantage 3"],
      "recommended_crops": ["Crop 1", "Crop 2", "Crop 3"]
    }}

    NO explanation. NO markdown. NO extra text.
    """
    
    try:
        response = gemini_chat(prompt)
        return extract_json_from_text(response)
    except Exception as e:
        print("Gemini error:", e)
        return {
            "pros": ["Unable to fetch pros."],
            "cons": ["Unable to fetch cons."],
            "recommended_crops": []
        }

@app.route("/soil-predict", methods=["POST"])
def predict_soil():
    try:
        file = request.files["image"]
        image = Image.open(file)
        processed_image = preprocess_image(image)

        predictions = soil_model.predict(processed_image)
        predicted_class_index = np.argmax(predictions)
        soil_type = SOIL_LABELS[predicted_class_index]

        insights = generate_soil_insights(soil_type)

        return jsonify({
            "soil_type": soil_type,
            "pros": insights["pros"],
            "cons": insights["cons"],
            "recommended_crops": insights["recommended_crops"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

### --- CROP RECOMMENDATION --- ###
def get_valid_crops(district, soil_type):
    district_data = df_crops[df_crops["District"].str.lower() == district.lower()]
    if district_data.empty:
        return None  # No data for district

    valid_crops = district_data[district_data["Soil Type"].str.contains(soil_type, case=False, na=False)]
    if valid_crops.empty:
        return None  # No matching crops for soil type

    return valid_crops["Crop"].unique().tolist()

def get_crop_problems(soil_type):
    problem_dict = {
        "Red Sandy Loam": "Nutrient deficiency, erosion risk",
        "Clay Loam": "Waterlogging, compaction issues",
        "Saline Coastal Alluvium": "High salinity, poor drainage",
        "Black Soil": "Poor aeration, water retention issues",
        "Sandy Soil": "Low water retention, nutrient leaching",
        "Alluvial Soil": "Fertile but prone to flooding",
    }
    
    for key in problem_dict:
        if key.lower() in soil_type.lower():
            return problem_dict[key]
    return "No major soil-related issues found."

def extract_top_crops(text):
    try:
        crop_lines = re.findall(r"\*+ +\**([^\n:]+)", text)
        top_crops = [line.strip().split('(')[0].strip() for line in crop_lines[:4]]
        return top_crops
    except Exception as e:
        print("Crop extract error:", e)
        return []

@app.route('/recommend-crops', methods=['POST'])
def recommend_crops():
    try:
        data = request.json
        district = data.get("district")
        soil_type = data.get("soil_type")

        if not district or not soil_type:
            return jsonify({"error": "District and soil type are required"}), 400

        crops = get_valid_crops(district, soil_type)
        if not crops:
            return jsonify({
                "error": f"No suitable crops found for soil type '{soil_type}' in {district}"
            }), 400

        district_info = df_water[df_water["District"].str.lower() == district.lower()]
        if district_info.empty:
            return jsonify({"error": f"No water level data found for {district}"}), 400

        water_level = district_info.iloc[0]["current water level"]
        rainfall = district_info.iloc[0]["Actual Rainfall (mm)"]
        soil_moisture = district_info.iloc[0]["Soil Moisture (%)"]
        crop_problems = get_crop_problems(soil_type)

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = (
            f"Given the {soil_type} soil in {district}, along with:\n"
            f"- Groundwater Level: {water_level}m\n"
            f"- Rainfall: {rainfall}mm\n"
            f"- Soil Moisture: {soil_moisture}%\n"
            f"Choose and list the **top 3-4 most suitable crops first** from this list: {', '.join(crops)}.\n"
            "Then explain why those crops are suitable and categorize any others if needed."
        )

        try:
            response = model.generate_content(prompt)
            recommended_crops = response.text.strip()
        except Exception as e:
            return jsonify({"error": f"Gemini API Error: {str(e)}"}), 500

        top_crops = extract_top_crops(recommended_crops)

        response_text = (
            f"🌱 Crop Recommendation for {district}\n"
            f"📍 District: {district}\n"
            f"🏔️ Selected Soil Type: {soil_type}\n"
            f"💧 Groundwater Level: {water_level}m\n"
            f"🌧️ Rainfall: {rainfall}mm\n"
            f"🌿 Soil Moisture: {soil_moisture}%\n"
            f"⚠️ Common Problems: {crop_problems}\n\n"
            f"🌾 Recommended Crops: {recommended_crops}"
        )

        return jsonify({
            "recommended_crops": response_text,
            "top_crops": top_crops
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

### --- NEW SEASONAL CALENDAR FEATURE --- ###
@app.route('/seasonal-calendar', methods=['POST'])
def seasonal_calendar():
    try:
        data = request.json
        district = data.get("district")
        soil_type = data.get("soil_type")
        crops = data.get("crops", [])  # Optional: can pass specific crops or use recommendations

        if not district or not soil_type:
            return jsonify({"error": "District and soil type are required"}), 400
            
        # If no crops provided, get recommendations
        if not crops or len(crops) == 0:
            valid_crops = get_valid_crops(district, soil_type)
            if not valid_crops:
                return jsonify({"error": f"No suitable crops found for {soil_type} in {district}"}), 400
            crops = valid_crops[:5]  # Limit to top 5 crops
        
        # Get district climate info for better calendar recommendations
        district_info = df_water[df_water["District"].str.lower() == district.lower()]
        if not district_info.empty:
            rainfall = district_info.iloc[0]["Actual Rainfall (mm)"]
            soil_moisture = district_info.iloc[0]["Soil Moisture (%)"]
        else:
            rainfall = "Unknown"
            soil_moisture = "Unknown"
            
        prompt = f"""
        You are an agricultural expert. Create a seasonal planting calendar for {district} district with {soil_type}.
        
        Include these crops: {', '.join(crops)}
        
        Additional information:
        - Average rainfall: {rainfall} mm
        - Soil moisture: {soil_moisture}%
        
        Format the response as a JSON object with the following structure:
        {{
          "calendar": [
            {{
              "season": "Season name (e.g., Kharif/Summer/etc.)",
              "months": "Month range (e.g., June-September)",
              "crops": [
                {{
                  "name": "Crop name",
                  "sowing_time": "When to sow",
                  "harvest_time": "When to harvest",
                  "water_requirements": "Low/Medium/High",
                  "key_activities": ["Activity 1", "Activity 2"]
                }}
              ]
            }}
          ]
        }}
        
        Include 3-4 seasons based on Indian agricultural seasons for {district}. Only return the JSON with no explanation.
        """
        
        try:
            response = gemini_chat(prompt)
            calendar_data = extract_json_from_text(response)
            
            # Add metadata to the response
            result = {
                "district": district,
                "soil_type": soil_type,
                "crops_analyzed": crops,
                "calendar_data": calendar_data
            }
            
            return jsonify(result)
            
        except Exception as e:
            print(f"Calendar generation error: {e}")
            return jsonify({"error": f"Failed to generate seasonal calendar: {str(e)}"}), 500
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

### --- NEW MARKET ANALYSIS FEATURE --- ###
@app.route('/market-analysis', methods=['POST'])
def market_analysis():
    try:
        data = request.json
        district = data.get("district")
        crops = data.get("crops", [])
        
        if not district or not crops or len(crops) == 0:
            return jsonify({"error": "District and at least one crop are required"}), 400
            
        # Limit to 5 crops for better response
        if len(crops) > 5:
            crops = crops[:5]
            
        prompt = f"""
        You are an agricultural market analyst in India. Provide detailed market analysis for the following crops in {district} district:
        {', '.join(crops)}
        
        Format your response as a JSON object with this structure:
        {{
          "market_analysis": [
            {{
              "crop": "Crop name",
              "current_price": "₹XX-XX per kg/quintal",
              "price_trend": "Increasing/Decreasing/Stable",
              "demand": "High/Medium/Low",
              "peak_selling_months": "Month1-Month2",
              "nearby_markets": ["Market1", "Market2", "Market3"],
              "storage_advice": "Brief storage recommendation",
              "marketing_tips": ["Tip1", "Tip2"]
            }}
          ],
          "market_overview": "Brief paragraph about the current agricultural market in {district}"
        }}
        
        Only return valid JSON with no additional text or explanation.
        """
        
        try:
            response = gemini_chat(prompt)
            market_data = extract_json_from_text(response)
            
            # Add metadata to the response
            result = {
                "district": district,
                "crops_analyzed": crops,
                "analysis_date": "April 28, 2025",  # Current date
                "market_data": market_data
            }
            
            return jsonify(result)
            
        except Exception as e:
            print(f"Market analysis error: {e}")
            return jsonify({"error": f"Failed to generate market analysis: {str(e)}"}), 500
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    user_msg = request.json.get("message", "")
    lang = request.json.get("lang", "en-IN")  # Default to English if not sent

    # Adjust system prompt based on language
    if lang == "ta-IN":
        system_prompt = """
நீங்கள் AgriBot, ஒரு புத்திசாலி விவசாய உதவியாளர்.
தமிழில் தெளிவாகவும் எளிமையாகவும் பதிலளிக்க வேண்டும்.

வழிகாட்டுதல்:
- தொழில்நுட்பம் குறைவாக உள்ள கிராமப்புற பயனாளர்களுக்கேற்ப எளிய சொற்கள் பயன்படுத்தவும்.
- பயிர் நோய், பூச்சி பிரச்சனை குறித்து கேட்கப்பட்டால், காரணங்கள், தீர்வுகள் மற்றும் இயற்கை மருந்துகளை பரிந்துரைக்கவும்.
- விவசாயத் திட்டங்கள் குறித்து கேட்கப்பட்டால், தகுதிகள், நன்மைகள் மற்றும் விண்ணப்பிக்கும் முறைகளை எளிதாக விளக்கவும்.
- சந்தேகமிருந்தால், ஊகிக்காமல் மேலும் விவரங்களை கேட்கவும்.
- ஒவ்வொரு பதிலும் "விவசாயம் வளரட்டும்!" என்ற ஊக்கமளிக்கும் சொற்களுடன் முடிக்கவும்.

நீங்கள் உதவிகரமாகவும் நட்பாகவும் பதிலளிக்க வேண்டும்.
        """.strip()
    else:
        system_prompt = """
You are AgriBot, an intelligent assistant for small-scale farmers.
Respond only in English using simple, clear language.

Guidelines:
- Use easy-to-understand words for rural users with limited technical background.
- If asked about crop diseases or pests, suggest causes, solutions, and natural treatments.
- If asked about farming schemes, explain eligibility, benefits, and how to apply.
- If unsure, ask for more information instead of guessing.
- End every response with a friendly encouragement like "Happy farming!"

Be helpful and friendly.
        """.strip()

    # Send to OpenRouter API
    openrouter_res = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "openai/gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg}
            ]
        }
    )

    ai_response = openrouter_res.json()
    reply = ai_response["choices"][0]["message"]["content"]
    return jsonify({"reply": reply})

@app.route("/", methods=["GET"])
def home():
    return "ML Server Running"
        
if __name__ == '__main__':
    app.run(debug=True)