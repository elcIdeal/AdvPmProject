import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Avatar, Typography, TextField, Button, Box
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    picture: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/auth/register', formData);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
              <PersonAddAltIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">Sign Up</Typography>
            <Typography variant="body2" color="text.secondary">
              Create an account to get started with Expin.
            </Typography>
          </Box>
          <form onSubmit={handleRegister}>
            <TextField name="name" fullWidth label="Name" value={formData.name}
              onChange={handleChange} margin="normal" required />
            <TextField name="email" fullWidth label="Email" type="email" value={formData.email}
              onChange={handleChange} margin="normal" required />
            <TextField name="password" fullWidth label="Password" type="password" value={formData.password}
              onChange={handleChange} margin="normal" required />

            <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ mt: 2 }}>
              Register
            </Button>
          </form>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
