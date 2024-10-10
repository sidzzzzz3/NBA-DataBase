import React, { useEffect, useState } from 'react';
import { Container, Grid, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const config = require('../config.json');

export default function PlayerPage() {
    const query = useQuery();
    const [players, setPlayers] = useState([]);
    const [player, setPlayer] = useState(query.get('name') || '');
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSeason] = useState('2021');
    const [performanceData, setPerformanceData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        const playerName = query.get('playerName');
        if (playerName) {
            setPlayer(playerName);
        }
    }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/trend/get_player_names`)
            .then(response => response.json())
            .then(data => {
                setPlayers(data);
                if (data.length > 0 && !player) {
                    setPlayer(data[0].name);
                }
            })
            .catch(error => console.error('Error fetching player names:', error));
    }, []);

    useEffect(() => {
        const maxSeason = 2021;
        const firstSeason = 2003;
        const years = Array.from({ length: maxSeason - firstSeason + 1 }, (_, index) => maxSeason - index);
        setSeasons(years);
        setSeason(maxSeason);
    }, []);

    useEffect(() => {
        if (player && selectedSeason) {
            fetch(`http://${config.server_host}:${config.server_port}/players/${player}?season=${selectedSeason}`)
                .then(response => response.json())
                .then(data => {
                    setPerformanceData(data);
                })
                .catch(error => console.error('Error fetching player performance:', error));
        }
    }, [player, selectedSeason]);

    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/players/${player}?season=${selectedSeason}`)
            .then(res => res.json())
            .then(resJson => {
                setPerformanceData(resJson);
            })
            .catch(error => {
                console.error('Error fetching player data:', error);
            });
    };

    return (
        <Container>
            <h2>Player Performance Stats</h2>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        select
                        label="Player Name"
                        value={player}
                        onChange={e => setPlayer(e.target.value)}
                        fullWidth
                    >
                        {players.map(player => (
                            <MenuItem key={player.name} value={player.name}>
                                {player.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        select
                        label="Season"
                        value={selectedSeason}
                        onChange={(e) => setSeason(e.target.value)}
                        fullWidth
                    >
                        {seasons.map(year => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12}></Grid>
            </Grid>

            <div style={{ marginBottom: '20px' }}></div>
            <Link href="/appendix" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">
                    Appendix
                </Button>
            </Link>
            <div style={{ marginBottom: '30px' }}></div>

            {performanceData.length > 0 && (
                <div>
                    <h3>Performance Data:</h3>
                    <TableContainer component={Paper}>
                        <Table aria-label="player performance data table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Played For</TableCell>
                                    <TableCell>Points Average</TableCell>
                                    <TableCell>FG% Average</TableCell>
                                    <TableCell>3P% Average</TableCell>
                                    <TableCell>FT% Average</TableCell>
                                    <TableCell>Average Assists</TableCell>
                                    <TableCell>Average Rebounds</TableCell>
                                    <TableCell>Average Steals</TableCell>
                                    <TableCell>Average Blocks</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {performanceData
                                    .map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell>{data.name}</TableCell>
                                            <TableCell>{data.Team_Played_for}</TableCell>
                                            <TableCell>{data.Average_Points}</TableCell>
                                            <TableCell>{data.two_point_shot_Percentage}</TableCell>
                                            <TableCell>{data.three_point_shot_Percentage}</TableCell>
                                            <TableCell>{data.free_throw_Percentage}</TableCell>
                                            <TableCell>{data.Average_Assists}</TableCell>
                                            <TableCell>{data.Average_Rebounds}</TableCell>
                                            <TableCell>{data.Average_Steals}</TableCell>
                                            <TableCell>{data.Average_Blocks}</TableCell>
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
