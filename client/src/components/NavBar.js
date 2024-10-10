import React, { useState } from 'react';
import { AppBar, Container, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { NavLink } from 'react-router-dom';
import Login from './Login';

function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontFamily: 'monospace',
        fontWeight: 800,
        letterSpacing: '.3rem',
        color: 'white'
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  );
}

export default function NavBar() {
  const [openLogin, setOpenLogin] = useState(false); // State for showing login dialog
  const [loginSuccess, setLoginSuccess] = useState(false); // State for tracking login success

  const handleClose = () => {
    setOpenLogin(false);
  };

  const handleLoginSuccess = () => {
    setLoginSuccess(true);
    setOpenLogin(false);
  }

  return (
    <AppBar position='static' style={{ backgroundColor: 'purple' }}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
            <NavText href='/' text='NBA' isMain />
            <NavText href='/team' text='TEAMS' />
            <NavText href='/players' text='PLAYERS' />
            <NavText href='/game' text='GAMES' />
            <NavText href='/champion' text='CHAMPIONSHIP' />
            <NavText href='/trend' text='TREND' />
            <NavText href='/appendix' text='APPENDIX' />
          </div>
          <Button color="inherit" style={{ fontWeight: 'bold', border: '3px solid white' }} onClick={() => setOpenLogin(true)}>Log in</Button>
        </Toolbar>
      </Container>
      <Dialog open={openLogin} onClose={handleClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Login onSuccess={handleLoginSuccess} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      {loginSuccess && (
        <Dialog open={loginSuccess} onClose={() => setLoginSuccess(false)}>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <Typography variant="body1">Login successful!</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoginSuccess(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </AppBar>
  );
}
