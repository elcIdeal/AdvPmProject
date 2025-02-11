import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
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
import { fetchSummary, uploadTransactions, fetchChallenges } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [summaryResponse, challengesResponse] = await Promise.all([
          fetchSummary(),
          fetchChallenges()
        ]);
        setSummary(summaryResponse.data);
        setChallenges(challengesResponse.data.challenges || []);
        setError(null);
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError(err.response?.data?.detail || 'Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#e8f5e9';
      case 'failed':
        return '#ffebee';
      case 'active':
        return '#fff3e0';
      default:
        return 'inherit';
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);
      
      await uploadTransactions(formData);

      const summaryResponse = await fetchSummary();
      setSummary(summaryResponse.data);
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

      const summaryResponse = await fetchSummary();
      setSummary(summaryResponse.data);
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
    <Box sx={{ width: '100%' }}>
      {!summary?.categories?.length ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <Typography variant="h6" gutterBottom>
            No transaction data available
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} alignItems="center">
            <Button
              variant="contained"
              component="label"
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
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 1 }}>
              or
            </Typography>
            <Button
              variant="outlined"
              onClick={handleSampleDataUpload}
            >
              Try with Sample Data
            </Button>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Monthly Spending Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Spending
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={summary.monthly}>
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Category-wise Spending Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={summary.categories}
                    dataKey="total"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {summary.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* Challenges Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Challenges
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Target Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {challenges.map((challenge, index) => (
                      <TableRow
                        key={index}
                        sx={{ backgroundColor: getStatusColor(challenge.status) }}
                      >
                        <TableCell>{challenge.name}</TableCell>
                        <TableCell>${challenge.target_amount}</TableCell>
                        <TableCell>{challenge.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Dashboard;