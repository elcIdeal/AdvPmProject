import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { UploadFile as UploadIcon } from '@mui/icons-material';
import { uploadTransactions } from '../services/api';

function Upload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);
      
      await uploadTransactions(formData);
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleDataUpload = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/sample_transactions.csv');
      const blob = await response.blob();
      const file = new File([blob], 'sample_transactions.csv', { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadTransactions(formData);
      setError(null);
    } catch (err) {
      console.error('Sample data upload error:', err);
      setError(err.response?.data?.detail || 'Failed to load sample data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload Statement
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={3}
        >
          <Typography variant="body1" textAlign="center" color="text.secondary" gutterBottom>
            Upload your transaction statement to analyze your spending patterns and get personalized insights.
          </Typography>

          <Button
            variant="contained"
            component="label"
            size="large"
            startIcon={<UploadIcon />}
          >
            Upload Statement
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileUpload}
            />
          </Button>

          <Typography variant="body2" color="text.secondary">
            or
          </Typography>

          <Button
            variant="outlined"
            onClick={handleSampleDataUpload}
            size="large"
          >
            Try with Sample Data
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Supported format: CSV
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Upload;