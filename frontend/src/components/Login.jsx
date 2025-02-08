import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            SpendWise
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            AI-Powered Financial Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => loginWithRedirect()}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In / Sign Up
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;