# Google Drive File Uploader Web App

## Overview
This project is a web application designed to simplify the process of uploading files to Google Drive. It provides a user-friendly interface for selecting and uploading files from your local machine to your Google Drive account.

## Benefits
- Easy-to-use web interface for uploading files to Google Drive
- Secure authentication using OAuth 2.0
- Supports uploading multiple file types
- Automatic local storage of uploaded files

## Features
- Web-based interface accessible from any modern browser
- OAuth 2.0 authentication for secure access to Google Drive
- File selection through browser's native file picker
- Automatic creation of an 'uploads' folder for local file storage
- Upload status and progress indication

## Prerequisites
- Node.js (version 14.0.0 or higher)
- npm (version 6.0.0 or higher)

## Setup

### Google Console Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project.
3. Navigate to the **APIs & Services** > **Dashboard**.
4. Click on **ENABLE APIS AND SERVICES** and search for "Google Drive API". Enable it.
5. Go back to **APIs & Services** > **Credentials**.
6. Click on **Create Credentials** and select **API Key**. Copy the generated API key.
7. Click on **Create Credentials** again and select **OAuth 2.0 Client IDs**.
8. Configure the consent screen if prompted.
9. Set the application type to **Web application**.
10. Add your authorized redirect URIs (e.g., http://localhost:3000 for local development).
11. Click **Create** and note down the **Client ID** and **Client Secret**.

### Update .env File
1. Create a `.env` file in the root directory of your project.
2. Add the following environment variables:
    ```env
    CLIENT_ID=your_google_client_id
    CLIENT_SECRET=your_google_client_secret
    API_KEY=your_google_api_key
    ```
3. Replace `your_google_client_id`, `your_google_client_secret`, and `your_google_api_key` with the values obtained from the Google Console.

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/yourproject.git
    ```
2. Navigate to the project directory:
    ```sh
    cd yourproject
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Running the Project
1. Start the development server:
    ```sh
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000` (or the port specified in your configuration).

## Usage
To use the Google Drive File Uploader Web App:

1. Ensure you've completed the setup and installation steps.

2. Open the web application in your browser.

3. Click on the file upload button or drag and drop files into the designated area.

4. The application will automatically create an 'uploads' folder in the project directory if it doesn't exist, and save the selected file(s) there.

5. Click the upload button to start the upload process to Google Drive.

6. Follow the prompts to authenticate with your Google account if it's your first time using the app.

7. The application will display the upload progress and a confirmation message once the upload is complete.

8. You can view the uploaded files in both your Google Drive account and the local 'uploads' folder.
