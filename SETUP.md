## What You Need
*   A [Google Account](https://firebase.google.com/)

## Step 1: Set up your App in Firebase
Start by [remixing the example project](https://glitch.com/edit/#!/remix/community-building-starter), so that you have your own copy of the code. Then create a new project from the [Firebase Console](https://console.firebase.google.com/) by selecting 'Create new project' and setting your project name and region. You can then create a Service Account by clicking on the Settings cog icon and selecting Permissions > Service Accounts > Create Service Account. This will default to a Firebase-Admin service account.  Click the button shown to generate and download a JSON key file containing your credentials.

## Step 2: Add your App credentials to .env
Using the details in that JSON file, we can now enter our Firebase app credentials into the `.env` file. If you have and are going to use a Gmail account to send notification emails, then add your details for `GMAIL_ADDRESS` and `GMAIL_PASSWORD` into the `.env` file too. GMAIL also requires you <a href="https://myaccount.google.com/lesssecureapps?pli=1" no-opener no-referrer>"Allow Less Secure Web Apps"</a>, specifically apps that won't trigger verification questions. Now you need to paste the initialization snippet (Select 'Add Firebase to your web app' from your app's homepage in Firebase) into the head of `public/index.html`, replacing `lines 17-29`.

## Step 3: Configure Your App
Lastly, since this example uses Google Auth, we need to enable Google Auth from the Auth > Sign-in Method tab in Firebase. Then add your project's publish URL to the list of 'OAuth redirect domains' further down the page. Your project's publish URL is the URL shown when you click 'Show' and will have the format project-name.glitch.me. So in our example, we entered 'firebase-quickstart.glitch.me' after selecting 'Add Domain', and then we click 'Add' to finish.

## Code Overview
The important parts of the code are mainly split between two files. Both are well commented, so I'll avoid duplicating their comments here. But essentially:

*   `server.js` implements the back-end components for sending notification emails, updating project metadata and listening out for in-app events and HTTP requests.

*   `public/main.js` uses the [Firebase JavaScript API](https://www.firebase.com/docs/web/api/) for creating posts, stars, and comments as well as handling user-input.

If you now go to your app you should be able to login with Google Auth, then create posts with messages, and add comments. When you star a post you should also receive a notification email too. 

## Getting Help
You can see other example projects on our [Community Projects](https://glitch.com/) page. And if you get stuck, let us know on the [forum](http://support.glitch.com/) and we can help you out.