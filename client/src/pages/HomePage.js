import { useEffect, useState } from 'react';
import { Container, Divider, Grid, Link, TextField, Button, Checkbox, FormControlLabel, Slider, MenuItem} from '@mui/material';
// import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

function extractTeamName(fullName) {
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

export default function HomePage() {

  // Section 1: Acknowledgements - Authors, Motivation, Description
 const [authors, setAuthors] = useState('');
 const [motivation, setMotivation] = useState('');
 const [description, setDescription] = useState('');
 const [selectedSection, setSelectedSection] = useState('authors');
 const [teams, setTeams] = useState([]);

 useEffect(() => {
  fetch(`http://${config.server_host}:${config.server_port}/acknowledge/authors`)
    .then(res => res.json())
    .then(resJson => setAuthors(resJson.authors));

  fetch(`http://${config.server_host}:${config.server_port}/acknowledge/motivation`)
    .then(res => res.json())
    .then(resJson => setMotivation(resJson.motivation));

  fetch(`http://${config.server_host}:${config.server_port}/acknowledge/description`)
    .then(res => res.json())
    .then(resJson => setDescription(resJson.description));

  fetch(`http://${config.server_host}:${config.server_port}/all_teams`)
  .then(response => response.json())
  .then(data => {
      const modifiedData = data.map((team, index) => ({
        ...team,
        id: team.Abbreviation || index
      }));
      setTeams(modifiedData);
  });
  
}, []);

 // Section 2: All Teams
 const allTeamsColumns = [
  // { field: 'TeamLogo', headerName: ''},
  {
    field: 'TeamLogo',
    headerName: '',
    flex: 0.5,
    renderCell: (params) => (
      params.value ? <img src={params.value} alt="team logo" style={{ display: 'block', margin: '0 auto', height: '50px'}} /> : ''
    ),
  },
  {
    field: 'Name',
    headerName: 'Team Name',
    flex: 0.5,
    renderCell: (params) => {
      if (params && params.value) {
        console.log(params);
        return (
          <NavLink
            to={`/team?teamName=${encodeURIComponent(extractTeamName(params.value))}`}
            style={{ textDecoration: 'underline', color: 'blue' }}
          >
            {params.value}
          </NavLink>
        );
      } else {
        console.log('params.value is undefined:', params);
        return 'No team name';
      }
    }
  },
  { field: 'Abbreviation', headerName: 'Abbreviation', flex: 0.5},
  { field: 'FoundedYear', headerName: 'Founded Year', flex: 0.5},
  { field: 'Conference', headerName: 'Conference' , flex: 0.5},
  { field: 'Arena', headerName: 'Arena', flex: 0.75}
  ];

 // Section 3: Search Players
  const [pageSize, setPageSize] = useState(10);
  const [player_name, setPlayerName] = useState([]);
  const [name, setName] = useState('LeBron James');
  const [game_date_start, setGameDateStart] = useState('');
  const [game_date_end, setGameDateEnd] = useState('');
  const [result, setResult] = useState('Win');
  const [game_season, setGameSeason] = useState(2019);
  const [pts, setPts] = useState(0);
  const [fg_pct, setFgPct] = useState(0);
  const [fg3_pct, setFg3Pct] = useState(0);
  const [ft_pct, setFtPct] = useState(0);
  const [reb, setReb] = useState(0);
  const [ast, setAst] = useState(0);
  const [stl, setStl] = useState(0);
  const [blk, setBlk] = useState(0);
  const [tov, setTov] = useState(0);
  const [pf, setPf] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_players?player_name=${name}&result=${result}&game_season=${game_season}`)
      .then(res => res.json())
      .then(resJson => {
        setData(resJson);
      });

    fetch(`http://${config.server_host}:${config.server_port}/trend/get_player_names`)
      .then(res => res.json())
      .then(resJson => {
          setPlayerName(resJson);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search_players?player_name=${name}` +
      `&game_date_start=${game_date_start}&game_date_end=${game_date_end}&result=${result}` +
      `&game_season=${game_season}&pts=${pts}&fg_pct=${fg_pct}&fg3_pct=${fg3_pct}` +
      `&ft_pct=${ft_pct}&reb=${reb}&ast=${ast}&stl=${stl}&blk=${blk}&tov=${tov}&pf=${pf}`
    )
      .then(res => res.json())
      .then(resJson => {
        setData(resJson);
      });
  };

  const columns = [
    { field: 'Player_Name', headerName: 'Player Name', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Player_Team', headerName: 'Player Team', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Game_season', headerName: 'Game Season', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Game_Date', headerName: 'Game Date', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'MatchUp', headerName: 'Match Up', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Home_Away', headerName: 'Home/Away', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'WinningTeam', headerName: 'Winning Team', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Result', headerName: 'Result', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'MIN', headerName: 'MIN'},
    { field: 'PTS', headerName: 'PTS'},
    { field: 'FGM', headerName: 'FGM'},
    { field: 'FGA', headerName: 'FGA'},
    { field: 'FG_PCT', headerName: 'FG_PCT'},
    { field: 'FG3M', headerName: 'FG3M'},
    { field: 'FG3A', headerName: 'FG3A'},
    { field: 'FG3_PCT', headerName: 'FG3_PCT'},
    { field: 'FTM', headerName: 'FTM'},
    { field: 'FTA', headerName: 'FTA'},
    { field: 'FT_PCT', headerName: 'FT_PCT'},
    { field: 'OREB', headerName: 'OREB'},
    { field: 'DREB', headerName: 'DREB'},
    { field: 'REB', headerName: 'REB'},
    { field: 'AST', headerName: 'AST'},
    { field: 'STL', headerName: 'STL'},
    { field: 'BLK', headerName: 'BLK'},
    { field: 'TOV', headerName: 'TOV'},
    { field: 'PF', headerName: 'PF'}
];

  // Section 4: Search Teams
  const [team_name, setTeamName] = useState([]);
  const [team, setTeam] = useState('Philadelphia 76ers');
  const [game_date_start_team, setGameDateStartTeam] = useState('');
  const [game_date_end_team, setGameDateEndTeam] = useState('');
  const [result_team, setResultTeam] = useState('Win');
  const [game_season_team, setGameSeasonTeam] = useState(2019);
  const [pts_team, setPtsTeam] = useState(0);
  const [fg_pct_team, setFgPctTeam] = useState(0);
  const [fg3_pct_team, setFg3PctTeam] = useState(0);
  const [ft_pct_team, setFtPctTeam] = useState(0);
  const [reb_team, setRebTeam] = useState(0);
  const [ast_team, setAstTeam] = useState(0);
  const [team_data, setTeamData] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_teams?team=${team}&result=${result_team}&game_season=${game_season_team}`)
      .then(res => res.json())
      .then(resJson => {
        setTeamData(resJson);
      });
  
    fetch(`http://${config.server_host}:${config.server_port}/get_team_names`)
      .then(res => res.json())
      .then(resJson => {
          setTeamName(resJson);
      });
  }, []);

  const search_team = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search_teams?team=${team}` +
      `&game_date_start=${game_date_start_team}&game_date_end=${game_date_end_team}&result=${result_team}` +
      `&game_season=${game_season_team}&pts=${pts_team}&fg_pct=${fg_pct_team}&fg3_pct=${fg3_pct_team}` +
      `&ft_pct=${ft_pct_team}&reb=${reb_team}&ast=${ast_team}`
    )
      .then(res => res.json())
      .then(resJson => {
        setTeamData(resJson);
      });
  }

  const team_columns = [
    { field: 'Game_Season', headerName: 'Season'},
    { field: 'Game_Date', headerName: 'Game Date', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'MatchUp', headerName: 'Match Up', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Home_Team', headerName: 'Home Team', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Away_Team', headerName: 'Away Team', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'Result', headerName: 'Result', renderCell: (params) => (<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{params.value}</div>) },
    { field: 'HomePTS', headerName: 'HomePTS'},
    { field: 'AwayPTS', headerName: 'AwayPTS'},
    { field: 'HomeFG_PCT', headerName: 'HomeFG_PCT'},
    { field: 'AwayFG_PCT', headerName: 'AwayFG_PCT'},
    { field: 'HomeFG3_PCT', headerName: 'HomeFG3_PCT'},
    { field: 'AwayFG3_PCT', headerName: 'AwayFG3_PCT'},
    { field: 'HomeFT_PCT', headerName: 'HomeFT_PCT'},
    { field: 'AwayFT_PCT', headerName: 'AwayFT_PCT'},
    { field: 'Home_REB', headerName: 'HomeREB'},
    { field: 'Away_REB', headerName: 'AwayREB'},
    { field: 'Home_AST', headerName: 'HomeAST'},
    { field: 'Away_AST', headerName: 'AwayAST'}
  ];

  return (
    <Container>
      <h1>Welcome to NBA Central!</h1>

      <div>
        <button onClick={() => setSelectedSection('authors')}>Authors</button>
        <button onClick={() => setSelectedSection('motivation')}>Motivation</button>
        <button onClick={() => setSelectedSection('description')}>Description</button>
      </div>

      <div>
        {selectedSection === 'authors' && (
          <>
            <h2>Authors</h2>
            <p>{authors}</p>
          </>
        )}
        {selectedSection === 'motivation' && (
          <>
            <h2>Motivation</h2>
            <p>{motivation}</p>
          </>
        )}
        {selectedSection === 'description' && (
          <>
            <h2>Description</h2>
            <p>{description}</p>
          </>
        )}
      </div>
      <Divider />

      <h2> All Teams</h2>
      {/* <LazyTable route={`http://${config.server_host}:${config.server_port}/all_teams`} columns={allTeamsColumns} /> */}
      <div style={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={teams}
          columns={allTeamsColumns.map(column => ({ ...column, headerName: <b>{column.headerName}</b> }))}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 30]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowHeight={70}
          getRowId={(row) => row.Abbreviation}
          disableSelectionOnClick
          // components={{
          //   Pagination: CustomPaginationComponent, // Custom pagination component if needed
          // }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
          }
        />
      </div>
      <Divider />

      <h2>Past Games</h2>
      <h3>Player Search</h3>
      <Link href="/appendix" style={{ textDecoration: 'none' }}>
        <Button variant="contained" color="primary">
          Appendix
        </Button>
      </Link>
      <div style={{ marginBottom: '30px' }}></div>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TextField
            select
            label='Player Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%' }}
          >
             {player_name.map(option => (
              <MenuItem key={option.name} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
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
        <Grid item xs={4}>
          <TextField
            label='Game Date End'
            type='date'
            value={game_date_end}
            onChange={(e) => setGameDateEnd(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { position: 'static', top: '0' }
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            label="Result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { position: 'static', top: '0' }
            }}
            style={{ width: "100%" }}
          >
            <MenuItem value="Win">Win</MenuItem>
            <MenuItem value="Loss">Loss</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <p>Game Season</p>
          <Slider
            value={game_season}
            min={2003}
            max={2021}
            step={1}
            onChange={(e, newValue) => setGameSeason(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Points</p>
          <Slider
            value={pts}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => setPts(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Field Goal Percentage</p>
          <Slider
            value={fg_pct}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setFgPct(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>3-Point Field Goal Percentage</p>
          <Slider
            value={fg3_pct}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setFg3Pct(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Free Throw Percentage</p>
          <Slider
            value={ft_pct}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setFtPct(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Rebounds</p>
          <Slider
            value={reb}
            min={0}
            max={20}
            step={1}
            onChange={(e, newValue) => setReb(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Assists</p>
          <Slider
            value={ast}
            min={0}
            max={20}
            step={1}
            onChange={(e, newValue) => setAst(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Steals</p>
          <Slider
            value={stl}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setStl(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Blocks</p>
          <Slider
            value={blk}
            min={0}
            max={20}
            step={1}
            onChange={(e, newValue) => setBlk(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Turnovers</p>
          <Slider
            value={tov}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setTov(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Personal Fouls</p>
          <Slider
            value={pf}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setPf(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search()} style={{ left: '50%', transform: 'translateX(-50%)', fontSize: '1.2rem', padding: '10px 20px' }}>
        Search
      </Button>
      <div style={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns.map(column => ({ ...column, headerName: <b>{column.headerName}</b> }))}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 30]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowHeight={70}
          autoWidth
          disableSelectionOnClick
          getRowId={(row) => row.GAME_ID}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
          }
        />
      </div>
      <div style={{ marginBottom: '30px' }}></div>
      <Divider />

      <h3>Team Search</h3>
      <Link href="/appendix" style={{ textDecoration: 'none' }}>
        <Button variant="contained" color="primary">
          Appendix
        </Button>
      </Link>
      <div style={{ marginBottom: '30px' }}></div>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TextField
            select
            label='Team Name'
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            style={{ width: '100%' }}
          >
             {team_name.map(option => (
              <MenuItem key={option.name} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label='Game Date Start'
            type='date'
            value={game_date_start_team}
            onChange={(e) => setGameDateStartTeam(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { position: 'static', top: '0' }
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label='Game Date End'
            type='date'
            value={game_date_end_team}
            onChange={(e) => setGameDateEndTeam(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { position: 'static', top: '0' }
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            label="Result"
            value={result_team}
            onChange={(e) => setResultTeam(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { position: 'static', top: '0' }
            }}
            style={{ width: "100%" }}
          >
            <MenuItem value="Win">Win</MenuItem>
            <MenuItem value="Loss">Loss</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <p>Game Season</p>
          <Slider
            value={game_season_team}
            min={2003}
            max={2021}
            step={1}
            onChange={(e, newValue) => setGameSeasonTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Points</p>
          <Slider
            value={pts_team}
            min={0}
            max={150}
            step={1}
            onChange={(e, newValue) => setPtsTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Field Goal Percentage</p>
          <Slider
            value={fg_pct_team}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setFgPctTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>3-Point Field Goal Percentage</p>
          <Slider
            value={fg3_pct_team}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setFg3PctTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Free Throw Percentage</p>
          <Slider
            value={ft_pct_team}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setFtPctTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Rebounds</p>
          <Slider
            value={reb_team}
            min={0}
            max={50}
            step={1}
            onChange={(e, newValue) => setRebTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Assists</p>
          <Slider
            value={ast_team}
            min={0}
            max={50}
            step={1}
            onChange={(e, newValue) => setAstTeam(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search_team()} style={{ left: '50%', transform: 'translateX(-50%)', fontSize: '1.2rem', padding: '10px 20px' }}>
        Search
      </Button>
      <div style={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={team_data}
          columns={team_columns.map(column => ({ ...column, headerName: <b>{column.headerName}</b> }))}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 30]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowHeight={70}
          autoWidth
          disableSelectionOnClick
          getRowId={(row) => row.GAME_ID}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
          }
        />
      </div>
      <div style={{ marginBottom: '30px' }}></div>
      <Divider />
      <Divider />
      <section>
      <h3><i>All Rights Reserved! © 2024 NBA Central</i></h3>
      </section>
    </Container>
  );
};
