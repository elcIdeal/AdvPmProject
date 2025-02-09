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

function parseRecommendations(suggestions) {
  if (!suggestions) return [];
  
  const cards = suggestions.split('\n\n')
    .filter(card => card.startsWith('1.') || card.startsWith('2.') || card.startsWith('3.') || card.startsWith('4.'))
    .map(card => {
      const [cardInfo, reasonInfo] = card.split('**Reason:**');
      
      // Parse card details
      const name = cardInfo.match(/\*\*Card Name:\*\* ([^,]+)/)?.[1]?.trim();
      const provider = cardInfo.match(/\*\*Provider:\*\* ([^,]+)/)?.[1]?.trim();
      const cashback = cardInfo.match(/\*\*Cashback:\*\* ([^,]+)/)?.[1]?.trim();
      const annualFee = cardInfo.match(/\*\*Annual Fee:\*\* ([^,]+)/)?.[1]?.trim();
      const apr = cardInfo.match(/\*\*APR:\*\* ([^,]+)/)?.[1]?.trim();
      const benefits = cardInfo.match(/\*\*Benefits:\*\* \[([^\]]+)\]/)?.[1]?.split(', ') || [];
      const reason = reasonInfo?.trim();
      
      return {
        name,
        provider,
        cashback: { general: cashback }, // Simplified cashback structure
        annual_fee: annualFee,
        APR: apr,
        benefits,
        reason
      };
    });
  
  return { cards };
}

function CreditCardRecommendations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await fetchCreditCardRecommendations();
        const parsedRecommendations = parseRecommendations(response.data.suggestions);
        setRecommendations(parsedRecommendations);
        setError(null);
      } catch (err) {
        console.error('Error fetching credit card recommendations:', err);
        setError(err.response?.data?.detail || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
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
        Credit Card Recommendations
      </Typography>
      <Grid container spacing={3}>
        {recommendations?.cards?.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {card.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {card.provider}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Cashback:</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {card.cashback.general}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 2 }}>
                  Annual Fee: {card.annual_fee}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  APR: {card.APR}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Benefits:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {card.benefits.map((benefit, idx) => (
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
                    {card.reason}
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