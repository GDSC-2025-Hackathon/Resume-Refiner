from flask import Flask, redirect, url_for, request
import requests
import os

from flask_wtf.csrf import CSRFProtect, CSRFError, validate_csrf, generate_csrf
from flask import Flask, render_template, jsonify
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField
from werkzeug.utils import secure_filename
from wtforms.validators import InputRequired

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = 'static/files'

resume_uploaded_flag_path = os.path.join(app.config['UPLOAD_FOLDER'], "resume_uploaded.flag")

def set_resume_uploaded():
    with open(resume_uploaded_flag_path, "w") as f:
        f.write("1")

def is_resume_uploaded():
    return os.path.exists(resume_uploaded_flag_path)


def findJob(querystring):
    url = "https://jsearch.p.rapidapi.com/search"

    #querystring = {"query":"developer jobs in chicago","page":"1","num_pages":"1","country":"us","date_posted":"all"}

    headers = {
        "x-rapidapi-key": os.getenv("x-rapidapi-key"),
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    #print(response.json())
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






class UploadFileForm(FlaskForm):
    file = FileField("File", validators=[InputRequired()])
    submit = SubmitField("Upload File")

@app.route('/', methods=['GET'])
def home():
    form = UploadFileForm()
    return render_template('index.html', form=form)


csrf = CSRFProtect(app)

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        set_resume_uploaded()  # <- Mark resume as uploaded
        return jsonify({"success": True, "filename": filename})
    return jsonify({"success": False}), 400



@app.route('/result', methods=['POST'])
@csrf.exempt
def result():
    data = request.get_json()
    job = data.get('job')
    country = data.get('country')
    city = data.get('city')
    refine = data.get('refine', False)  # default is False if not passed

    if refine and not is_resume_uploaded():
        return jsonify({"message": "<p style='color:red;'>Please upload a resume before using Compare & Refine.</p>"})

    querystring = {
        "query": f"{job} in {city}, {country}",
        "page": "1",
        "num_pages": "1",
        "country": country,
        "date_posted": "all"
    }

    job_data = findJob(querystring)

    results_html = ""
    for job in job_data.get('data', []):
        title = job.get("job_title")
        company = job.get("employer_name")
        link = job.get("job_apply_link")
        job_id = job.get("job_id")

        results_html += f"""
            <div class="job-entry">
                <p><strong>{title}</strong> at {company} - <a href="{link}" target="_blank">Apply</a></p>
                <button id="btn-{job_id}" onclick="toggleDetails('{job_id}', '{country}')">More Details</button>
                <button onclick="compareWithResume('{job_id}')">Compare & Refine</button>
                <div id="details-{job_id}" class="job-details" style="display: none;"></div>
                <div id="compare-{job_id}" class="job-compare" style="margin-top: 10px;"></div>
            </div>
        """

    if not results_html:
        return jsonify({"message": "No jobs found."})

    return jsonify({"message": results_html})


@app.route('/job-detail', methods=['POST'])
@csrf.exempt
def job_detail():
    data = request.get_json()
    job_id = data.get('job_id')
    country = data.get('country')

    url = "https://jsearch.p.rapidapi.com/job-details"
    querystring = {"job_id": job_id, "country": country}
    headers = {
        "x-rapidapi-key": os.getenv("x-rapidapi-key"),
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    job_info = response.json()

    if not job_info.get('data'):
        return jsonify({"detail": "No further details found."})

    job = job_info['data'][0]
    raw_description = job.get("job_description", "No description provided.")

    # Split into lines
    lines = raw_description.strip().split('\n')
    formatted_description = ""
    in_list = False

    for line in lines:
        stripped = line.strip()

        # Start of a bullet point
        if stripped.startswith("•"):
            if not in_list:
                formatted_description += "<ul>"
                in_list = True
            formatted_description += f"<li>{stripped[1:].strip()}</li>"

        # Regular line
        else:
            if in_list:
                formatted_description += "</ul>"
                in_list = False
            formatted_description += f"<p>{stripped}</p>"

    if in_list:
        formatted_description += "</ul>"

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



