import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { fetchCreditCardRecommendations } from '../services/api';

function CreditCardRecommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetchCreditCardRecommendations();
        setRecommendations(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!recommendations?.suggestions?.length) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">No credit card recommendations available.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Credit Card Recommendations
      </Typography>
      <Grid container spacing={3}>
        {recommendations.suggestions.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {card["card_name"]}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {card["provider"]}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Cashback:</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {card["cashback"]}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 2 }}>
                  Annual Fee: {card["annual_fee"]}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  APR: {card["apr"]}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Benefits:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {card["benefits"].map((benefit, idx) => (
                      <Chip
                        key={idx}
                        label={benefit}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Recommendation Reason:</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {card["reason"]}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default CreditCardRecommendations;