**MyTern Recruitment Website**

*Overview*
Mytern will be a recruitment website, with the following initial functionality:

*Job Seekers/Talent*
- Account Signup
- Signin
- Skills profile setup
- Resume upload (stretch goal to read the resume and build the profile automatically)
- Account management
- Job search
- Apply to jobs
- View the application statuses

*Recruiters/Businesses*
- Signup for a company account
- Add company users on the same domain
- Manage the company users
- Create job postings and post
- Track the status of roles
- Sign up for membership to post additional jobs past the free tier

*Admin Portal (Site owner)*
- view all users - seekers and business accounts
- view all roles
- Assign API keys for businesses to integrate to other platforms (stretch)

**Stack/Technologies**
Front-end:
- Javascript/React Framework
- Material UI Components
- Tailwind CSS and Components

Back-end-1:
- Javascript/Node.js/Express

Database:
- Google CloudSQL running on Postgres15
- Google Firestore/NoSQL for job objects (TBD)

Other External Dependencies:
- Google OAuth Services for login
- Google Document AI - OCR 
- Google Vertex - Logic to move uploaded resume text into formatted objects for database storage
- Google Cloud Storage - storing resumes, images and any other blob storage requirements


## Getting Started
Getting started instructions go here

## Icebox Items
Icebox itemsare in the Jira project here: https://patrickkittle.atlassian.net/jira/software/projects/GP4/boards/4

## References
- [API Dictionary](https://docs.google.com/spreadsheets/d/1wfkbw6tjOfWev1ZcPoxbaVDZ3InfBr3GgQTUlA75zVo/edit#gid=833770197)   
- [Material UI](https://mui.com/material-ui/getting-started/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [Stripe](https://docs.stripe.com/)
- [date-fns](https://date-fns.org/v3.6.0/docs/format)
- [recharts](https://recharts.org/en-US/)
