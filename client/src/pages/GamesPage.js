import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link} from '@mui/material';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const config = require('../config.json');

// Get the team name from the full team name


export default function TeamPage() {
    const [gameData, setGameData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [game_date_start, setGameDateStart] = useState('');

    useEffect(() => {
        if (game_date_start) {
            fetch(`http://${config.server_host}:${config.server_port}/game/game_date/${game_date_start}`)
                .then(response => response.json())
                .then(data => {
                    setGameData(data);
                });
        }
    }, [game_date_start]);


    return (
        <Container>
            <h2>Games Stats</h2>
            <Grid container spacing={2}>
            </Grid>
            <Grid item xs={4}>
                <TextField
                    label='Game Date Start'
                    type='date'
                    value={game_date_start}
                    onChange={(e) => setGameDateStart(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                        style: { position: 'static', top: '0' }
                    }}
                />
            </Grid>

            <div style={{ marginBottom: '30px' }}></div>
            <Link href="/appendix" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">
                    Appendix
                </Button>
            </Link>
            <div style={{ marginBottom: '30px' }}></div>


            {gameData.length > 0 && (
                <div>
                    <h3>Games Data:</h3>
                    <TableContainer component={Paper}>
                        <Table aria-label="game data table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Season</TableCell>
                                    <TableCell>Home</TableCell>
                                    <TableCell>Away</TableCell>
                                    <TableCell>Result</TableCell>
                                    <TableCell>PTS_home</TableCell>
                                    <TableCell>PTS_away</TableCell>
                                    <TableCell>FG_PCT_home</TableCell>
                                    <TableCell>FG3_PCT_away</TableCell>
                                    <TableCell>AST_home</TableCell>
                                    <TableCell>AST_away</TableCell>
                                    <TableCell>FG_PCT_away</TableCell>
                                    <TableCell>FT_PCT_home</TableCell>
                                    <TableCell>FT_PCT_away</TableCell>
                                    <TableCell>REB_home</TableCell>
                                    <TableCell>REB_away</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {gameData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((game) => (
                                        <TableRow key={game.id}>
                                            <TableCell>{game.date}</TableCell>
                                            <TableCell>{game.SEASON}</TableCell>
                                            <TableCell>{game.Home}</TableCell>
                                            <TableCell>{game.Away}</TableCell>
                                            <TableCell>{game.Result}</TableCell>
                                            <TableCell>{game.PTS_home}</TableCell>
                                            <TableCell>{game.PTS_away}</TableCell>
                                            <TableCell>{game.FG_PCT_home}</TableCell>
                                            <TableCell>{game.FG3_PCT_away}</TableCell>
                                            <TableCell>{game.AST_home}</TableCell>
                                            <TableCell>{game.AST_away}</TableCell>
                                            <TableCell>{game.FG_PCT_away}</TableCell>
                                            <TableCell>{game.FT_PCT_home}</TableCell>
                                            <TableCell>{game.FT_PCT_away}</TableCell>
                                            <TableCell>{game.REB_home}</TableCell>
                                            <TableCell>{game.REB_away}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}

        </Container>
    );
}