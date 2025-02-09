import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { fetchInsights } from '../services/api';

function TransactionInsights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response = await fetchInsights();
        setInsights(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transaction insights:', err);
        setError(err.response?.data?.detail || 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Financial Insights
      </Typography>
      <Grid container spacing={3}>
        {/* Unnecessary Spending */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Unnecessary Spending
              </Typography>
              <List>
                {insights?.unnecessary_spending?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${item.category || 'Uncategorized'}`}
                      secondary={`Amount: $${item.amount}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Recommendations
              </Typography>
              <List>
                {insights?.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cash Flow Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Cash Flow Analysis
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>
                  Monthly Income: ${insights?.cash_flow_analysis?.monthly_income}
                </Typography>
                <Typography>
                  Total Spent: ${insights?.cash_flow_analysis?.total_spent}
                </Typography>
                <Typography>
                  Savings Potential: ${insights?.cash_flow_analysis?.savings_potential}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Trends:</Typography>
                <List>
                  {insights?.cash_flow_analysis?.cash_flow_trends?.map((trend, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={trend} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Anomalies */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Spending Anomalies
              </Typography>
              <List>
                {insights?.anomalies?.map((anomaly, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={anomaly.description}
                      secondary={`Category: ${anomaly.category}, Amount: $${anomaly.amount}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TransactionInsights;