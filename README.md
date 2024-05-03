**MyTern Recruitment Website**

Wireframes: 

*Overview*
Mytern will be a recruitment website, with the following initial functionality:

*Job Seekers/Talent*
- Account Signup
- Signin 0- local and Goolge OAuth
- Skills profile setup
- Resume upload (stretch goal to read the resume and build the profile automatically)
- Account management - update username, password, address etc
- Job match based on skills
- View the progress of matches/job "applicaitons"
- STRETCH - chat with posters of roles that you are matched with 

*Recruiters/Businesses*
- Signup for a company account
- Add company users on the same domain to the company account
- Manage the company users
- Create job postings and post
- Track the status of roles
- Sign up for membership to post additional jobs past the free tier

*Admin Portal (Site owner)*
- view all users - seekers and business accounts
- view all roles
- Assign API keys for businesses to integrate to other platforms (stretch)
- review new skills and reationalise and update all dependencies.

**Stack/Technologies**
Front-end:
- Javascript/React Framework
- Material UI Components
- Tailwind CSS and Components

Back-end-1:
- Javascript/Node.js/Express
- STRETCH - Migrate the backend to Java

Database:
- Google CloudSQL running on Postgresql@latest
- Google Firestore/NoSQL for job objects and the chat system messages

Other External Dependencies:
- Google OAuth Services for login
- Google Document AI - OCR (Updated to us CVPareser Pro due to inconsistent results with Document AI)
- Google Vertex - Logic to move uploaded resume text into formatted objects for database storage (As above - configured but not in use)
- Google Cloud Storage - storing resumes, images and any other blob storage requirements.


## Getting Started
Company user can sign up in the comapy signup page for the main company account - other users on the same domain can no longer then signup using that domain. The root user must add new users form the adcmin panel.

A job seeker type user can signup ad also loginn using username/password. If they use a gmail email ID they also have the option to login with google. This also checks that they are using a validated email in google - if not then they are rejected and would nedd to revert to username/password login.

## SQL Create Scripts
A SQL Build file/dump: https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/sql-dump.sql

## Icebox Items
Icebox itemsare in the Jira project here: https://patrickkittle.atlassian.net/jira/software/projects/GP4/boards/4

## References
- Wireframes:
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/LandingPage.png
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/RecruiterAdmin.png
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/RecruiterDashboard.png
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/RecruiterSignupStepper.png
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/TalentHome.png
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/TalentProfile.png
-  https://github.com/p-at-rick-sg/ga4-BE-NEW/blob/master/Wireframes/TalentSignup.png

- [API Dictionary](https://docs.google.com/spreadsheets/d/1-1C4dwu0u8UdyS8bFdTsCXUZ12Le0A2fmYiHbFyU4Js/edit?usp=sharing)   
- [Material UI](https://mui.com/material-ui/getting-started/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [Stripe](https://docs.stripe.com/)
- [date-fns](https://date-fns.org/v3.6.0/docs/format)
