import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { UploadFile as UploadIcon } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Dashboard() {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryResponse, insightsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/transactions/summary', { headers }),
          axios.get('http://localhost:8000/api/analysis/insights', { headers }),
        ]);

        setSummary(summaryResponse.data);
        setInsights(insightsResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [getAccessTokenSilently]);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      await axios.post('http://localhost:8000/api/transactions/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchData();
    } catch (err) {
      setError('Failed to upload file. Please try again.');
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

  if (!summary?.categories?.length && !loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <Typography variant="h6" gutterBottom>
          No transactions found. Upload your first statement to get started!
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          Upload Statement
          <input
            type="file"
            hidden
            accept=".pdf"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Monthly Spending Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Spending Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary?.monthly || []}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total Spending" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary?.categories || []}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {summary?.categories?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Insights and Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Insights
            </Typography>
            {insights?.recommendations?.map((recommendation, index) => (
              <Typography key={index} paragraph>
                • {recommendation}
              </Typography>
            ))}
          </Paper>
        </Grid>

        {/* Upload New Statement */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload New Statement
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;