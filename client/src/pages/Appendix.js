import { useEffect, useState } from 'react';
import { Container, Divider, Grid, Link, TextField, Button, Checkbox, FormControlLabel, Slider, MenuItem} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');


export default function Appendix() {
    return (
        <Container>
            <h1>Appendix</h1>
            <h4>MIN: Minute</h4>
            <h4>PTS: Points</h4>
            <h4>FGM: Field Goals Made</h4>
            <h4>FGA: Field Goals Attempted</h4>
            <h4>FG_PCT: Field Goal Percentage</h4>
            <h4>FG3M: 3-Point Field Goals Made</h4>
            <h4>FG3A: 3-Point Field Goals Attempted</h4>
            <h4>FG3_PCT: 3-Point Field Goal Percentage</h4>
            <h4>FTM: Free Throws Made</h4>
            <h4>FTA: Free Throws Attempted</h4>
            <h4>FT_PCT: Free Throw Percentage</h4>
            <h4>OREB: Offensive Rebounds</h4>
            <h4>DREB: Defensive Rebounds</h4>
            <h4>REB: Rebounds</h4>
            <h4>AST: Assists</h4>
            <h4>STL: Steals</h4>
            <h4>BLK: Blocks</h4>
            <h4>TOV: Turnovers</h4>
            <h4>PF: Personal Fouls</h4>
        </Container>
    );
}
