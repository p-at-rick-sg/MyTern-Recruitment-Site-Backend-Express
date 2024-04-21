# ga3-grp10-BE

GA Project 3 Group 10

Members: Benjamin Foo, Kristian Nielsen, Patrick Kittle

**Overview:**
We have build a localised model of Kickstarter. Our high level functionality is:

**User Interaction:**
Home page showcasing the live projects in cards.
Signup for an account
Signin to your account
Manage your account/ugrade to a contributor
Project details page- the images and text about trhe project.
Ask questions about the prject to the owner
Full purchase workflow - allow users to make payment to the project

**Contributor Interaction**
Sigmup for an account
Manage account 
Member homw page listing all the projects 
Add projects page
Manage project page - add images, update text, answer questions


**Admin Interactions**
View all active users
Delete users
Shows graphs for signups and activity
TODO: Add project funding details/revenue

# Draft begins here

# SingStarter 

A Singapore-based crowd funding app where users can pledge their money to help fund your next big idea

## Screenshots
Screenshots go here

## Technologies Used
- React
- Tailwind
- Material UI
- express
- MongoDB w/ mongoose

## .env variables
```
_Frontend .env:_
TE_SERVER=http://localhost:7001
VITE_FE_PORT=5173
#GCP Storage Info
VITE_GCP_ASSETS_URI=https://storage.googleapis.com/ga-project-3-assets/
#Stripe Publishable Key
VITE_STRIPE_PUB_KEY=

_Backend .env:_
PORT=7001
FE_PORT=5173
MONGO_URI=mongodb+srv://user:password@cluster0.for7dn9.mongodb.net/development
ACCESS_SECRET=
REFRESH_SECRET=
STRIPE_TEST=
PROJECT_ID=winter-jet-212808
BUCKET_NAME=ga-project-3-assets
GOOGLE_APPLICATION_CREDENTIALS=winter-jet-212808-fc4a3206d0d7.json
IMAGE_BASE_URI=https://storage.googleapis.com/ga-project-3-assets/

_Google_JSON_Creds_file_name
winter-jet-212808-fc4a3206d0d7.json stored in root of backend
```

## Getting Started
Getting started instructions go here

## Icebox Items
Icebox items go here

## References
- [API Dictionary](https://docs.google.com/spreadsheets/d/1wfkbw6tjOfWev1ZcPoxbaVDZ3InfBr3GgQTUlA75zVo/edit#gid=833770197)   
- [Material UI](https://mui.com/material-ui/getting-started/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [Stripe](https://docs.stripe.com/)
- [date-fns](https://date-fns.org/v3.6.0/docs/format)
- [recharts](https://recharts.org/en-US/)
