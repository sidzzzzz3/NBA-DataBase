import React, { useState } from 'react';
import { Typography, TextField, Button, Container } from '@mui/material';

export default function Login() {
  const [loginSuccess, setLoginSuccess] = useState(undefined);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    // define set of valid usernames and passwords
    const validUsernames = ['Stephen', 'Eric', 'Sid', 'Vickie']
    const validPasswords = ['1234567890']

    // Simulating login success for any username/password
    if (validUsernames.includes(username) && validPasswords.includes(password)) {
      setLoginSuccess(true);
    } else {
      setLoginSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          variant="outlined"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
        >
          Login
        </Button>
      </form>
      {loginSuccess === true && (
        <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
          Login successful!
        </Typography>
      )}
      {loginSuccess === false && (
        <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
          Login failed! Please try again.
        </Typography>
      )}
    </Container>
  );
}
