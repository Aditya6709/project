from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import fitz  # PyMuPDF for PDF processing
import spacy
import pandas as pd
from io import BytesIO
import json

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development, specify later for production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Connect to Supabase
SUPABASE_URL = "https://oewyazfmpcfoxwjunwpp.supabase.co/"
SUPABASE_KEY = "your-supabase-key"  # Update with actual Supabase key
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize spaCy
nlp = spacy.load('en_core_web_sm')

# Define the bucket and folder path
bucket_name = "pdf"
folder_path = "public"

# Define skills (simplified for brevity)
skills = {
    "data-scientist": {"python": 1.3, "tensorflow": 1.5, "machine learning": 1.5},
    "database-management": {"sql": 1.3, "mysql": 1.5},
    "web-designing": {"html": 1.3, "css": 1.3, "javascript": 1.5},
}

# Function to list subfolders in Supabase storage
def list_subfolders(bucket_name, folder_path):
    response = supabase.storage.from_(bucket_name).list(path=folder_path)
    subfolders = [item['name'] for item in response if item['name'] != '.emptyfolderplaceholder']
    return subfolders

# Function to list files in a specific subfolder
def list_files_in_subfolder(bucket_name, folder_path):
    response = supabase.storage.from_(bucket_name).list(path=folder_path)
    return [item['name'] for item in response]

# Function to create a DataFrame from the subfolders and files
def create_dataframe_from_subfolders(bucket_name, folder_path):
    subfolders = list_subfolders(bucket_name, folder_path)
    data = []
    for subfolder in subfolders:
        subfolder_path = f"{folder_path}/{subfolder}"
        files = [file for file in list_files_in_subfolder(bucket_name, subfolder_path) if file != '.emptyfolderplaceholder']
        for file in files:
            data.append([file, "", subfolder])  # The third column is the subfolder name
    df = pd.DataFrame(data, columns=["File Name", "Keywords", "Subfolder"])
    return df

# Function to process PDFs and extract text
def process_file_in_memory(bucket_name, file_path):
    try:
        response = supabase.storage.from_(bucket_name).download(file_path)
        pdf_content = BytesIO(response)
        doc = fitz.open(stream=pdf_content, filetype="pdf")
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text("text")
        return extracted_text
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
        return None

# Function to clean text using spaCy
def clean_text_with_spacy(text):
    doc = nlp(text)
    cleaned_text = ' '.join([token.lemma_ for token in doc if not token.is_stop and token.is_alpha])
    return cleaned_text

# Function to preprocess the data
def preprocessing(dataframe, bucket_name, main_folder="public"):
    structured_data = {"data-scientist": [], "database-management": [], "web-designing": []}

    for _, row in dataframe.iterrows():
        file_name = row['File Name']
        subfolder = row['Subfolder']
        
        if pd.notna(file_name) and pd.notna(subfolder):
            file_path = f"{main_folder}/{subfolder}/{file_name}"
            extracted_text = process_file_in_memory(bucket_name, file_path)
            if extracted_text:
                cleaned_text = clean_text_with_spacy(extracted_text)
                matched_keywords = {}
                total_score = 0
                for skill, weight in skills[subfolder].items():
                    if skill.lower() in cleaned_text.lower():
                        matched_keywords[skill] = weight
                        total_score += weight
                
                structured_data[subfolder].append({
                    "File Name": file_name,
                    "Keywords": matched_keywords,
                    "Score": int(total_score)
                })
    
    return structured_data

# Function to save data to JSON and upload to Supabase
def save_data_to_json_and_upload(data, subfolder):
    data_sorted = sorted(data, key=lambda x: x['Score'], reverse=True)
    for index, resume in enumerate(data_sorted, start=1):
        resume['Rank'] = index
    file_name = f"{subfolder}_structured_data.json"
    with open(file_name, 'w') as json_file:
        json.dump(data_sorted, json_file, indent=4)

    try:
        existing_files = supabase.storage.from_(bucket_name).list("json")
        if file_name in [file['name'] for file in existing_files]:
            supabase.storage.from_(bucket_name).remove([f'json/{file_name}'])
        with open(file_name, 'rb') as file:
            supabase.storage.from_(bucket_name).upload(f'json/{file_name}', file)
    except Exception as e:
        print(f"Error uploading {file_name}: {e}")

# Main function to run the entire script logic
def run_my_script():
    df = create_dataframe_from_subfolders(bucket_name, folder_path)
    structured_data = preprocessing(df, bucket_name, folder_path)
    
    for subfolder, data in structured_data.items():
        save_data_to_json_and_upload(data, subfolder)
    
    return {"message": "Script executed successfully"}

# API endpoint to run the script
@app.post("/api/runscript")
async def run_full_script():
    try:
        result = run_my_script()
        return {"message": result["message"]}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
