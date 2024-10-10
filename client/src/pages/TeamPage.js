import React, { useEffect, useState } from 'react';
import { Button, Container, Typography, Grid, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Link} from '@mui/material';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

const config = require('../config.json');
  
// Get the team name from the full team name
function extractTeamName(fullName) {
    if (!fullName) return ''; 
    const parts = fullName.split(' ');
    return parts[parts.length - 1];
  }
  
  export default function TeamPage() {
    const query = useQuery();
    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState(query.get('name') || '');
    const [seasons, setSeasons] = useState([]);
    const [selected_season, setSeason] = useState('2021');
    const [gameData, setGameData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [teamDetails, setTeamDetails] = useState(null);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
      
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        const teamName = query.get('teamName');
        if (teamName) {
          setTeam(teamName);
        }
      }, []); 

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/all_teams`)
          .then(response => response.json())
          .then(data => {
            const processedTeams = data.map(team => ({
              fullName: team.Name,
              teamName: extractTeamName(team.Name),
              TeamLogo: team.TeamLogo,
              Name: team.Name,
              Abbreviation: team.Abbreviation,
              FoundedYear: team.FoundedYear,
              Conference: team.Conference,
              Arena: team.Arena
            }));
            setTeams(processedTeams);
          })
          .catch(error => console.error('Error fetching teams:', error));
    }, []);
    

    useEffect(() => {
        const selectedTeamDetails = teams.find(t => t.teamName === team);
        if (selectedTeamDetails) {
            setTeamDetails(selectedTeamDetails);
            console.log("Selected team details: ", selectedTeamDetails);
        } else {
            console.error("No matching team found for ", team);
        }

    }, [teams, team, query, teamDetails]);
    
    
    
    // Generate season options dynamically based on current year
    useEffect(() => {
        const maxSeason = 2021;
        const firstSeason = 2003;
        const years = Array.from({ length: maxSeason - firstSeason + 1 }, (_, index) => maxSeason - index);
        setSeasons(years);
        setSeason(maxSeason);
    }, []);

    // Fetch game data for a selected team and season
    useEffect(() => {
        if (team && selected_season) {
        fetch(`http://${config.server_host}:${config.server_port}/team/${team}?season=${selected_season}`)
            .then(response => response.json())
            .then(data => {
            setGameData(data);
            });
        }
    }, [team, selected_season]);
    
    const TeamInfoSection = ({ details }) => {
        if (!details) return null;
    
        return (
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <img src={details.TeamLogo} alt={`${details.Name} logo`} style={{ width: '250px' }} />
                </Grid>
                <Grid item xs>
                    <Typography variant="h4">{details.Name}</Typography>
                    <Typography variant="body1">Abbreviation: {details.Abbreviation}</Typography>
                    <Typography variant="body1">Founded: {details.FoundedYear}</Typography>
                    <Typography variant="body1">Conference: {details.Conference}</Typography>
                    <Typography variant="body1">Arena: {details.Arena}</Typography>
                </Grid>
            </Grid>
        );
    };

    return (
        <Container>
            <h2>Team Information</h2>
            <TeamInfoSection key={teamDetails?.Name} details={teamDetails} />

            <h2>Regular Season Game Stats</h2>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        select
                        label="Team Name"
                        value={team}
                        onChange={e => {
                            const selectedName = e.target.value;
                            setTeam(selectedName);
                        }}
                        fullWidth
                    >
                        {teams.map(({ teamName, fullName }) => (
                            <MenuItem key={teamName} value={teamName}>
                                {fullName}
                            </MenuItem>
                        ))}
                    </TextField>

                </Grid>
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

            <div style={{ marginBottom: '20px' }}></div>
            <Link href="/appendix" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">
                    Appendix
                </Button>
            </Link>
            <div style={{ marginBottom: '30px' }}></div>

            {gameData.length > 0 && (
                <div>
                    <h3>Game Data:</h3>
                    <TableContainer component={Paper}>
                        <Table aria-label="game data table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Home Team</TableCell>
                                    <TableCell>Away Team</TableCell>
                                    <TableCell>Points Home</TableCell>
                                    <TableCell>FG% Home</TableCell>
                                    <TableCell>FG3% Home</TableCell>
                                    <TableCell>FT% Home</TableCell>
                                    <TableCell>Assists Home</TableCell>
                                    <TableCell>Rebounds Home</TableCell>
                                    <TableCell>Points Away</TableCell>
                                    <TableCell>FG% Away</TableCell>
                                    <TableCell>FG3% Away</TableCell>
                                    <TableCell>FT% Away</TableCell>
                                    <TableCell>Assists Away</TableCell>
                                    <TableCell>Rebounds Away</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {gameData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((game) => (
                                        <TableRow key={game.id}>
                                            <TableCell>{game.Date}</TableCell>
                                            <TableCell>{game.Home_team}</TableCell>
                                            <TableCell>{game.Away_team}</TableCell>
                                            <TableCell>{game.PTS_home}</TableCell>
                                            <TableCell>{game.FG_PCT_home}</TableCell>
                                            <TableCell>{game.FG3_PCT_home}</TableCell>
                                            <TableCell>{game.FT_PCT_home}</TableCell>
                                            <TableCell>{game.AST_home}</TableCell>
                                            <TableCell>{game.REB_home}</TableCell>
                                            <TableCell>{game.PTS_away}</TableCell>
                                            <TableCell>{game.FG_PCT_away}</TableCell>
                                            <TableCell>{game.FG3_PCT_away}</TableCell>
                                            <TableCell>{game.FT_PCT_away}</TableCell>
                                            <TableCell>{game.AST_away}</TableCell>
                                            <TableCell>{game.REB_away}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 40]}
                            component="div"
                            count={gameData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                </div>
            )}

        </Container>
    );
}
