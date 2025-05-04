from flask import Flask, redirect, url_for, request, render_template, jsonify, send_file
import requests
import os
from flask_wtf.csrf import CSRFProtect, CSRFError, validate_csrf, generate_csrf
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField
from werkzeug.utils import secure_filename
from wtforms.validators import InputRequired
from flask_cors import CORS
import fitz
import pymupdf
from google import genai
from dotenv import load_dotenv
from fpdf import FPDF
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import textwrap

load_dotenv()


app = Flask(__name__)
CORS(app)  # <-- add this right after app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = 'static/files'
csrf = CSRFProtect(app)

resume_uploaded_flag_path = os.path.join(app.config['UPLOAD_FOLDER'], "resume_uploaded.flag")

def set_resume_uploaded():
    with open(resume_uploaded_flag_path, "w") as f:
        f.write("1")

def is_resume_uploaded():
    return os.path.exists(resume_uploaded_flag_path)

def findJob(querystring):
    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "x-rapidapi-key": os.getenv("x-rapidapi-key"),
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    print(f"[DEBUG] Job search API status: {response.status_code}")
    if response.status_code != 200:
        print(f"[ERROR] Job search failed: {response.text}")
    return response.json()

def get_country_code(location):
    location = location.lower()

    # Add more mappings as needed
    country_map = {
        "canada": "ca",
        "us": "us",
        "united states": "us",
        "usa": "us",
        "uk": "gb",
        "united kingdom": "gb",
        "australia": "au",
        "india": "in",
        "germany": "de",
        "france": "fr",
        "japan": "jp",
    }

    for name, code in country_map.items():
        if name in location:
            return code
    return "ca"  # Default fallback

@app.route('/', methods=['GET'])
def ping():
    return jsonify({"message": "Flask backend is running."})

@app.route('/file-upload', methods=['POST'])
@csrf.exempt
def file_upload():
    resume_file = request.files.get('resume')

    if not resume_file:
        return jsonify({"message": "No file provided."}), 400

    filename = secure_filename(resume_file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    resume_file.save(save_path)

    print(f"[UPLOAD] Saved resume to: {save_path}")

    # Optional: mark flag
    set_resume_uploaded()

    return jsonify({"message": "File uploaded successfully."})

@app.route('/revise', methods=['POST'])
@csrf.exempt
def revise_resume():
    resume_file = request.files.get('resume')
    job_descr = request.form.get('description')

    if not resume_file or not job_descr:
        return jsonify({"error": "Missing resume or description"}), 400

    filename = secure_filename(resume_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    resume_file.save(file_path)

    revised_text = second(file_path, job_descr)  # update to return text
    return jsonify({"revisedText": revised_text})

def second(file_path, job_descr):
    try:
        resume_text = extract_text_from_pdf(file_path)

        prompt = (
            "This is a txt resume. Based on the following job description, resend this resume which I sent but make changes to make it better and look nice and add a single & symbol around the text which was changed. Don't forget to include user's name, email etc. from the original resume and try your best. Think through before you answer. Do not provide any more details or give any reference to gemini, don't add '```txt' at the beginning. \n\n"
            f"{job_descr}\n\nDESCRIPTION:{resume_text}"
        )

        client = genai.Client(api_key=os.getenv("MY_KEY"))
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt]
        )

        revised_text = response.text
        #print("Gemini Suggestions:")
        #print(revised_text)

        output_path = 'static/files/Revised_Resume.txt'
        with open(output_path, 'w') as file:
            file.write(response.text)


        return response.text 

    except Exception as e:
        print(f"Error in second(): {e}")
        return None


def extract_text_from_pdf(file_path):
    """Extracts and returns text from a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(file_path)
        full_text = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            full_text += page.get_text()
        doc.close()
        print(full_text)
        return full_text.strip()
    except Exception as e:
        print(f"[ERROR] Failed to extract PDF text: {e}")
        return ""




@app.route('/result', methods=['POST'])
@csrf.exempt
def result():
    job = request.form.get('job')
    city = request.form.get('city')
    country = request.form.get('country', 'us')
    description = request.form.get('description')
    resume_file = request.files.get('resume')

    print("[DEBUG] Received:")
    print(f"Job: {job}")
    print(f"City: {city}")
    print(f"Country: {country}")
    print(f"Description: {description[:100]}...")
    print(f"Resume uploaded? {'Yes' if resume_file else 'No'}")

    # Save resume
    if resume_file:
        filename = secure_filename(resume_file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(save_path)
        print(f"Saved resume to: {save_path}")

    # Query jobs
    querystring = {
        "query": f"{job} in {city}, {country}",
        "page": "1",
        "num_pages": "1",
        "country": country,
        "date_posted": "all"
    }

    job_data = findJob(querystring)
    print(f"[DEBUG] API returned: {len(job_data.get('data', []))} jobs")

    results = []
    for job in job_data.get('data', []):
        results.append({
            "title": job.get("job_title"),
            "company": job.get("employer_name"),
            "applyLink": job.get("job_apply_link"),
            "jobId": job.get("job_id"),
            "country": country
        })

    return jsonify({
        "resumeContent": f"Job Title: {job.get('job_title', 'Unknown')}\nLocation: {city}\n\nJob Description:\n{description}",
        "jobSuggestions": results
    })

@app.route('/job-detail', methods=['POST'])
@csrf.exempt
def job_detail():
    data = request.get_json()
    print("[DEBUG] Received in /job-detail:", data)

    job_id = data.get('job_id')
    country = data.get('country')

    if not job_id or not country:
        return jsonify({"detail": "Missing job_id or country"}), 400

    url = "https://jsearch.p.rapidapi.com/job-details"
    querystring = {"job_id": job_id, "country": country}
    headers = {
        "x-rapidapi-key": os.getenv("x-rapidapi-key"),
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    print(f"[DEBUG] Job detail API status: {response.status_code}")

    if response.status_code != 200:
        return jsonify({"detail": "Failed to fetch job detail."}), 500

    job_info = response.json()

    if not job_info.get('data'):
        return jsonify({"detail": "No further details found."})

    job = job_info['data'][0]
    raw_description = job.get("job_description", "No description provided.")

    # Format description
    lines = raw_description.strip().split('\n')
    formatted_description = ""
    list_buffer = []

    def flush_list():
        nonlocal formatted_description, list_buffer
        if list_buffer:
            formatted_description += '<div class="bullet-box"><ul>'
            for item in list_buffer:
                formatted_description += f'<li>{item}</li>'
            formatted_description += '</ul></div>'
            list_buffer = []


    for line in lines:
        stripped = line.strip()

        # Line is a bullet or dash
        if stripped.startswith("•") or stripped.startswith("-"):
            list_buffer.append(stripped[1:].strip())
        else:
            flush_list()  # if we're exiting a list group
            if stripped:  # only add non-empty paragraphs
                formatted_description += f"<p>{stripped}</p>"

    # Flush final group if file ends on a list
    flush_list()



    # Optional highlights
    qualifications = job.get("job_highlights", {}).get("Qualifications", [])
    responsibilities = job.get("job_highlights", {}).get("Responsibilities", [])

    detail_html = f"<div><p><strong>Description:</strong></p>{formatted_description}"

    if qualifications:
        detail_html += "<p><strong>Qualifications:</strong></p><ul>"
        for q in qualifications:
            detail_html += f"<li>{q}</li>"
        detail_html += "</ul>"

    if responsibilities:
        detail_html += "<p><strong>Responsibilities:</strong></p><ul>"
        for r in responsibilities:
            detail_html += f"<li>{r}</li>"
        detail_html += "</ul>"

    detail_html += "</div>"

    return jsonify({"detail": detail_html}) 


if __name__ == '__main__':
    app.run(debug=True)



