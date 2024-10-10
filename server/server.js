const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));


// Championship Page
app.get('/champion/:season', routes.champion);
// Game Page
app.get('/game/game_date/:date', routes.game_date);
// Player Page
app.get('/players/:player_name', routes.player_performance);
app.get('/compare/:player1_name/:player2_name', routes.compare_player);
// Team Page
app.get('/team/:team_name', routes.team_stats_season);
// Home Page Routes
app.get('/', (req, res) => {
  res.send('Welcome to our Project, NBA Info Application!');
});
app.get('/acknowledge/:type', routes.acknowledge);
app.get('/all_teams', routes.all_teams);
app.get('/search_players', routes.search_players);
app.get('/search_teams', routes.search_teams);
app.get('/get_team_names', routes.get_team_names);
// Trend Page Routes
app.get('/trend/get_player_names', routes.get_player_names);
app.get('/trend/compare', routes.compare);
app.get('/trend/game', routes.trend_game);
app.get('/trend/games_count', routes.games_count);
app.get('/trend/teams_count', routes.teams_count);

// Extra Routes (didn't use in Front-End)
app.get('/game/highscore', routes.highscore);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
