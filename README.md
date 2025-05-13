# Project
Resume Refiner – GDSC Hackathon Project

Resume Refiner is a web app created during the GDSC Hackathon at the University of Guelph by Paul, Alex, Nikhil, and Nicholas. It helps users refine their resumes and discover job opportunities in a fast and intelligent way. The goal was to make job applications easier by using AI to handle resume tailoring and job matching all in one platform.

What It Does:
The platform allows users to upload a PDF version of their resume and input a job title and description. Our backend then uses Google’s Gemini Generative AI to rewrite key parts of the resume, like the summary and work experience sections, so they better match the requirements of the job. This makes the resume more relevant and optimized for applicant tracking systems.

At the same time, the backend connects to a job search API through RapidAPI and fetches real job postings that align with the content of the resume. The result is a smoother job application process where users get both an updated resume and a list of job openings suited to them.

The Stack:
The frontend was built using React for a clean and responsive user experience. The backend is powered by Flask, a lightweight Python framework. We used PyMuPDF to read and extract content from uploaded PDF resumes. For job listings, we integrated a job search API available on RapidAPI. Gemini’s Generative Language API handled the resume rewriting.

Technical Challenges:
One of the biggest challenges was handling PDF uploads and converting them into readable text that could be passed into our AI pipeline. We also needed to ensure the AI-generated content maintained the user’s original experience while adjusting it to meet the expectations of the job description. Balancing AI output with user readability and integrating everything smoothly into the front end took careful planning and testing.

Impact:
Resume Refiner helps job seekers save time and improve their chances of landing interviews. Instead of manually editing resumes for each job, users can rely on the AI to do the heavy lifting. The addition of job recommendations also helps reduce the time spent searching for opportunities, making Resume Refiner a practical tool for anyone in the job market.


Note:
There is currently an error with the main branch structure. All the files and folders for the working project are located inside the resume-refiner folder. Please navigate into that folder to view or run the full application.
