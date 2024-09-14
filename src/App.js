import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Container, Snackbar, CircularProgress, IconButton } from '@material-ui/core';
import { CloudUpload, FileCopy } from '@material-ui/icons';
import { gapi } from 'gapi-script';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

function App() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/config')
      .then(response => response.json())
      .then(data => {
        setConfig(data);
        initClient(data);
      })
      .catch(error => {
        console.error('Error fetching config:', error);
        setMessage('Error initializing application');
      });
  }, []);

  const initClient = async (config) => {
    try {
      await gapi.load('client:auth2', async () => {
        await gapi.client.init({
          apiKey: config.GOOGLE_API_KEY,
          clientId: config.GOOGLE_CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        console.log('Google API client initialized');
      });
    } catch (error) {
      console.error('Error initializing Google API client:', error);
      setMessage('Error initializing Google API client');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setIsLoading(true);
    console.log('Starting file upload process');
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);

    try {
      const auth = gapi.auth2.getAuthInstance();
      if (!auth.isSignedIn.get()) {
        await auth.signIn();
      }

      const uploadsFolder = await getOrCreateUploadsFolder();
      console.log('Uploading file:', file.name, 'to folder:', uploadsFolder);
      const response = await uploadToGoogleDrive(file, uploadsFolder);
      console.log('File upload response:', response);
      setFileUrl(response.webViewLink);
      setMessage('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage(`Error uploading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateUploadsFolder = async () => {
    try {
      const response = await gapi.client.drive.files.list({
        q: "name='uploads' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id)',
      });

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      } else {
        const folderMetadata = {
          name: 'uploads',
          mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await gapi.client.drive.files.create({ resource: folderMetadata });
        return folder.result.id;
      }
    } catch (error) {
      console.error('Error getting or creating uploads folder:', error);
      throw new Error('Failed to get or create uploads folder');
    }
  };

  const uploadToGoogleDrive = async (file, folderId) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        try {
          // Start resumable upload session
          const sessionResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${gapi.auth.getToken().access_token}`,
              'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
              name: file.name,
              parents: [folderId],
            }),
          });

          if (!sessionResponse.ok) {
            throw new Error(`Failed to start upload session: ${sessionResponse.statusText}`);
          }

          const sessionUrl = sessionResponse.headers.get('Location');
          console.log('Upload session URL:', sessionUrl);

          // Upload the file content
          const uploadResponse = await fetch(sessionUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: fileContent,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
          }

          console.log('Upload response status:', uploadResponse.status);

          const uploadResult = await uploadResponse.json();
          console.log('Upload result:', uploadResult);

          // Fetch file details to get the webViewLink
          const fileDetails = await gapi.client.drive.files.get({
            fileId: uploadResult.id,
            fields: 'id,name,webViewLink',
          });

          console.log('File details:', fileDetails.result);

          resolve(fileDetails.result);
        } catch (error) {
          console.error('Error during file upload:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileUrl);
    setMessage('URL copied to clipboard');
  };

  if (!config) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Google Drive File Uploader
      </Typography>
      <TextField
        type="file"
        onChange={handleFileChange}
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: <CloudUpload />,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={uploadFile}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Upload to Google Drive'}
      </Button>
      {fileUrl && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="subtitle1">File URL:</Typography>
          <TextField
            value={fileUrl}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={copyToClipboard}>
                  <FileCopy />
                </IconButton>
              ),
            }}
          />
        </div>
      )}
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage('')}
        message={message}
      />
    </Container>
  );
}

export default App;