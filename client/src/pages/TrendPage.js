import { useEffect, useState } from 'react';
import { Button, Container, Grid, TextField, MenuItem } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, LabelList, CartesianGrid, Legend, Tooltip } from 'recharts';
const config = require('../config.json');

export default function TrendPage() {

  // initialization
  const [compareData, setCompareData] = useState([])
  const [playerName, setPlayerName] = useState([]);
  const [gameOverGameData, setGameOverGameData] = useState([]);

  const [name, setName] = useState('LeBron James');
  const [metric, setMetric] = useState('Total');
  const [gameCount, setGameCount] = useState([]);
  const [teamCount, setTeamCount] = useState([]);
  
  let ltone = false
  const metricsList = ['Total', 'FGA', 'FGM']
  const compareChartData = {
    game_date_est: [],
    metric: [],
    value: [],
  };
  const GameOverGameChartData = {
    game_date_est: [],
    value: [],
  };

  // query
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/trend/compare`)
    .then(res => res.json())
    .then(resJson => {
        setCompareData(resJson);
    });

    fetch(`http://${config.server_host}:${config.server_port}/trend/get_player_names`)
    .then(res => res.json())
    .then(resJson => {
        setPlayerName(resJson);
    });

    fetch(`http://${config.server_host}:${config.server_port}/trend/game`)
    .then(res => res.json())
    .then(resJson => {
        setGameOverGameData(resJson);
    });  
    
    fetch(`http://${config.server_host}:${config.server_port}/trend/games_count`)
    .then(res => res.json())
    .then(resJson => {
        setGameCount(resJson);
    });   
    
    fetch(`http://${config.server_host}:${config.server_port}/trend/teams_count`)
    .then(res => res.json())
    .then(resJson => {
        setTeamCount(resJson);
    });  
  }, []);

  // query upon search
  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/trend/compare?player_name=${name}` +
      `&metrics=${metric}`
    )
    .then(res => res.json())
    .then(resJson => {
    setCompareData(resJson);
    });

    fetch(`http://${config.server_host}:${config.server_port}/trend/game?player_name=${name}&metrics=${metric}`)
    .then(res => res.json())
    .then(resJson => {
        setGameOverGameData(resJson);
    });

    fetch(`http://${config.server_host}:${config.server_port}/trend/games_count?player_name=${name}`)
    .then(res => res.json())
    .then(resJson => {
      setGameCount(resJson);
    });

    fetch(`http://${config.server_host}:${config.server_port}/trend/teams_count?player_name=${name}`)
    .then(res => res.json())
    .then(resJson => {
        setTeamCount(resJson);
    });  
  }

  const curr_game_count = gameCount.length > 0 ? gameCount[0].games_count : '';
  const curr_team_count = teamCount.length > 0 ? teamCount[0].teams_count : '';


  // format data to extract max
  compareData.forEach(item => {
    compareChartData.game_date_est.push(item.game_date_est);
    compareChartData.metric.push(item.metric);
    compareChartData.value.push(item.rnk);
  });

  console.log(GameOverGameChartData);

  // extract max bound
  const max_metric = Math.ceil((Math.max(...compareChartData.metric) * 1.2));
  if(compareData.length === 1){
    ltone = true
  }

  // Custom formatter for YAxis tick values to display percentages
  const formatYAxisTick = (tickItem) => {
    const roundedTickItem = (tickItem * 100).toFixed(1);
    return `${roundedTickItem}%`;
  };

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // use the outline of HW3
  return (
    <Container>
      {/* search card */}
      <h2>Player's Trend In The Latest 5 Games</h2>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField select label='Player Name' value = {name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}>
            {playerName.map(option => (
              <MenuItem key={option.name} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField select label='Metric' value = {metric} onChange={(e) => setMetric(e.target.value)} style={{ width: "100%" }}>
            {metricsList.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)', fontSize: '1.2rem', padding: '10px 20px' }}>
        Search
      </Button>
      {
        ltone
            ? (
                <h2>Competed less than or equal to one race in all record, recharts can only handle graphs with greater than one datapoint</h2>
            ) : ( <>

            {/* table 1 */}
            <h2>Latest 5 Games: metric score</h2>
            <ResponsiveContainer height={400} width="100%" aspect={3}>
              <LineChart data={gameOverGameData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="category" dataKey = "GAME_DATE_EST" tickFormatter={(value) => String(value).substring(0, 10)} interval={0} />
                <YAxis domain={[0, max_metric]}>
                </YAxis>
                <Tooltip />
                <Line type = "monotone" dataKey = "metric" stroke = "#8884d8" dot={true} isAnimationActive={false}>
                  <LabelList dataKey = "metric" position = "top" />
                </Line>
              </LineChart>
            </ResponsiveContainer>
            
            {/* table 2 */}
            <h2>Latest 5 Games: metric ranking relative to other players in the same game</h2>
            <ResponsiveContainer height={400} width="100%" aspect={3}>
              <LineChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="category" dataKey = "game_date_est" />
                <YAxis domain={[0, 10]} reversed = "True" hide = "True" />
                <Tooltip />
                <Legend />
                <Line type = "monotone" dataKey = "rnk" stroke = "#8884d8" dot={true} isAnimationActive={false}>
                  <LabelList dataKey = "rnk" position = "top" />
                </Line>
              </LineChart>
            </ResponsiveContainer> 

            {/* table 3 */}
            <h2>Latest 5 Games: game over game % change</h2>
            <ResponsiveContainer height={400} width="100%" aspect={3}>
              <LineChart data={gameOverGameData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="category" dataKey = "GAME_DATE_EST" tickFormatter={(value) => String(value).substring(0, 10)} interval={0} />
                <YAxis domain={[-1, 1]} tickFormatter={formatYAxisTick}/>
                <Tooltip />
                <Legend />
                <Line type = "monotone" dataKey = "game_over_game_pct" stroke = "#8884d8" dot={true} isAnimationActive={false}>
                  <LabelList dataKey = "game_over_game_pct" position = "top" formatter={formatYAxisTick}/>
                </Line>
              </LineChart>
            </ResponsiveContainer> 
            
            {/* print values */}
            <p> Total Games Played: {curr_game_count} ; Total Teams Played In: {curr_team_count}</p>
            </>
            ) 
      }
    </Container>
  );
}
