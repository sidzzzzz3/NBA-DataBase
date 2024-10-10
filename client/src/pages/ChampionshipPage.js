import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination} from '@mui/material';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

const config = require('../config.json');
  
// Get the team name from the full team name

  
  export default function TeamPage() {
    const query = useQuery();

    const [seasons, setSeasons] = useState([]);
    const [selected_season, setSeason] = useState('2021');
    const [gameData, setGameData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // const handleChangePage = (event, newPage) => {
    //     setPage(newPage);
    // };
      
    // const handleChangeRowsPerPage = (event) => {
    //     setRowsPerPage(+event.target.value);
    //     setPage(0);
    // };

    
    useEffect(() => {
        const maxSeason = 2021;
        const firstSeason = 2003;
        const years = Array.from({ length: maxSeason - firstSeason + 1 }, (_, index) => maxSeason - index);
        setSeasons(years);
        setSeason(maxSeason); // Set the default season to the max season
    }, []);


   
    // Fetch game data for a selected team and season
    useEffect(() => {
        if (selected_season) {
        fetch(`http://${config.server_host}:${config.server_port}/champion/${selected_season}`)
            .then(response => response.json())
            .then(data => {
            setGameData(data);
            });
        }
    }, [selected_season]);

    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/champion/${selected_season}`)
          .then(res => res.json())
          .then(resJson => {
            setGameData(resJson);
          })
          .catch(error => {
            console.error('Error fetching game data:', error);
          });
      };
      
    return (
        <Container>
            <h2>Championship Stats</h2>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        select
                        label="Season"
                        value={selected_season}
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
                <Grid item xs={12}>
                </Grid>
            </Grid>


            {gameData.length > 0 && (
                <div>
                    <h3>Championship Data:</h3>
                    <TableContainer component={Paper}>
                        <Table aria-label="game data table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>TeamName</TableCell>
                                    <TableCell>Season</TableCell>
                                    <TableCell>Conference</TableCell>
                                    <TableCell>Win</TableCell>
                                    <TableCell>Loss</TableCell>
                                    <TableCell>Home_Record</TableCell>
                                    <TableCell>Away_Record</TableCell>
                                    <TableCell>AVG_Away_Score</TableCell>
                                    <TableCell>AVG_Home_Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {gameData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((game) => (
                                        <TableRow key={game.id}>
                                            <TableCell>{game.abbreviation}</TableCell>
                                            <TableCell>{game.Season}</TableCell>
                                            <TableCell>{game.CONFERENCE}</TableCell>
                                            <TableCell>{game.W}</TableCell>
                                            <TableCell>{game.L}</TableCell>
                                            <TableCell>{game.HOME_RECORD}</TableCell>
                                            <TableCell>{game.ROAD_RECORD}</TableCell>
                                            <TableCell>{game.AVG_Away_Score}</TableCell>
                                            <TableCell>{game.AVG_Home_Score}</TableCell>
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
