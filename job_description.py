from flask import Flask, render_template, request
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField, StringField
from werkzeug.utils import secure_filename
from wtforms.validators import InputRequired
import os
from google import genai
import fitz  # PyMuPDF to handle PDF extraction

app = Flask(__name__)
app.config['SECRET_KEY'] = 'keyhere'
app.config['UPLOAD_FOLDER'] = 'static'


# Form with file upload and job description
class uploadFileForm(FlaskForm):
    file = FileField("Upload Resume PDF", validators=[InputRequired()])
    job_description = StringField("Enter Job Description", validators=[InputRequired()])
    submit = SubmitField("Upload and Analyze")


@app.route('/', methods=['GET', 'POST'])
def home():
    form = uploadFileForm()
    if form.validate_on_submit():
        file = form.file.data
        job_descr = form.job_description.data  # Get job description input

        filename = secure_filename(file.filename)
        file_path = os.path.join(os.path.abspath(os.path.dirname(__file__)),
                                 app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Call function to analyze both PDF and job description
        second(file_path, job_descr)

        return "FILE UPLOADED AND PROCESSED"
    return render_template('index.html', form=form)


def second(file_path, job_descr):
    try:
        # Extract text from the PDF
        resume_text = extract_text_from_pdf(file_path)

        # Combine resume text + job description into one prompt
        prompt = (
            "This is a resume. Based on the following job description, "
            "Resend this resume which I sent but make changes to make it better and add the & symbol around the text which was changed. Do not provide any more details or give any reference to gemini. \n\n"
            f"{job_descr}\n\n{resume_text}"
        )

        # Initialize the GenAI client
        client = genai.Client(api_key=os.getenv("MY_KEY"))

        # Use an available model (e.g., gemini-2.0-flash or another)
        response = client.models.generate_content(
            model="gemini-2.0-flash",  # Ensure this is an available model
            contents=[prompt]
        )

        print("Gemini Suggestions:")
        print(response.text)
        with open('output.txt', 'w') as file:
            file.write(response.text)

    except Exception as e:
        print(f"Error: {e}")


def extract_text_from_pdf(file_path):
    """Extracts text from a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""


if __name__ == '__main__':
    app.run(debug=True)
