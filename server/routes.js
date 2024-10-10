const mysql = require('mysql')
const config = require('./config.json');
const e = require('express');

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));


/******************
 * Home Page Routes *
 ******************/
const acknowledge = async function(req, res) {
  const authors = 'Runqi Vickie Liu, Weichen Eric Song, Ziyang Sid Zhang, Chenkang Stephen Zhang';
  const motivation = 'The motivation behind the project is to create a dynamic and user-friendly website application serving as a centralized platform for accessing NBA data from season 2003 to season 2021. The goal is to provide basketball enthusiasts with an interactive platform where they can explore comprehensive player profiles, team information, and detailed game statistics.';
  const description = 'The NBA Info Application is a web application that provides users with access to NBA data from the 2003 season to the 2021 season. By offering interactive interfaces, users will have the ability to delve into per-game statistics, player highlights, championship wins, and team performance metrics. Additionally, the website will offer detailed insights into every NBA game played during the specified timeframe, allowing users to analyze scores, player performances, team statistics, and game summaries. We hope our application can deliver an engaging and informative experience, empowering basketball enthusiasts to approach the NBA with comprehensive numerical support!';

  if (req.params.type === 'authors') {
    res.json({ authors: authors });
  } else if (req.params.type === 'motivation') {
    res.json({ motivation: motivation });
  } else if (req.params.type === 'description') {
    res.json({ description: description });
  } else {
    res.status(404).json({});
  }
}

const all_teams = async function(req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      WITH TeamName AS (
        SELECT TEAM_ID, CONCAT(Team.city, ' ', Team.nickname) AS name
        FROM Team
      ),

      Conference AS (
          SELECT DISTINCT Ranking.team_id AS TEAM_ID, Ranking.conference AS conference
          FROM Ranking
          WHERE NOT (Ranking.team_id = 1610612740 AND Ranking.conference = 'East')
      )

      SELECT
          TN.name AS Name,
          T.abbreviation AS Abbreviation,
          T.year_founded AS FoundedYear,
          C.conference AS Conference,
          T.arena AS Arena,
          T.thumbnail_url AS TeamLogo
      FROM Team T
      JOIN TeamName TN ON T.TEAM_ID = TN.TEAM_ID
      JOIN Conference C ON T.TEAM_ID = C.TEAM_ID
      ORDER BY Conference, Name;
      `, (err, data) => {
        if (err || data.length === 0) {
          console.log(err);
          res.json([]);
        } else if (data.length > 0) {
          res.json(data);
        } else {
          res.status(404).json({});
        }
      });
    } else {
      connection.query(`
        WITH TeamName AS (
          SELECT TEAM_ID, CONCAT(Team.city, ' ', Team.nickname) AS name
          FROM Team
        ),

        Conference AS (
            SELECT DISTINCT Ranking.team_id AS TEAM_ID, Ranking.conference AS conference
            FROM Ranking
            WHERE NOT (Ranking.team_id = 1610612740 AND Ranking.conference = 'East')
        )

        SELECT
            TN.name AS Name,
            T.abbreviation AS Abbreviation,
            T.year_founded AS FoundedYear,
            C.conference AS Conference,
            T.arena AS Arena,
            T.thumbnail_url AS TeamLogo
        FROM Team T
        JOIN TeamName TN ON T.TEAM_ID = TN.TEAM_ID
        JOIN Conference C ON T.TEAM_ID = C.TEAM_ID
        ORDER BY Conference, Name;
        LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)};
        `, (err, data) => {
          if (err || data.length === 0) {
            console.log(err);
            res.json([]);
          } else if (data.length > 0) {
            res.json(data);
          } else {
            res.status(404).json({});
          }
        });
    }
}

const search_players = async function(req, res) {
  const player_name = req.query.player_name ?? '';
  const game_season = req.query.game_season ?? 2021;
  const result = req.query.result ?? 'Win';
  const pts = req.query.pts ?? 0;
  const fg_pct = req.query.fg_pct ?? 0;
  const fg3_pct = req.query.fg3_pct ?? 0;
  const ft_pct = req.query.ft_pct ?? 0;
  const reb = req.query.reb ?? 0;
  const ast = req.query.ast ?? 0;
  const stl = req.query.stl ?? 0;
  const blk = req.query.blk ?? 0;
  const tov = req.query.tov ?? 0;
  const pf = req.query.pf ?? 0;
  const game_date_start = req.query.game_date_start ?? '';
  const game_date_end = req.query.game_date_end ?? '';

  let query = `
    SELECT *
    FROM Wrapper
    WHERE Game_season = ${game_season} AND
          Result = '${result}' AND PTS >= ${pts} AND
          FG_PCT >= ${fg_pct} AND FG3_PCT >= ${fg3_pct} AND
          FT_PCT >= ${ft_pct} AND REB >= ${reb} AND
          AST >= ${ast} AND STL >= ${stl} AND
          BLK >= ${blk} AND TOV >= ${tov} AND
          PF >= ${pf}
  `;

  if (player_name !== '') {
    query += ` AND Player_Name LIKE '%${player_name}%'`;
  }

  if (game_date_start !== '' && game_date_end !== '') {
    query += ` AND Game_Date BETWEEN '${game_date_start}' AND '${game_date_end}'`;
  }

  if (game_date_start !== '' && game_date_end === '') {
    query += ` AND Game_Date >= '${game_date_start}'`;
  }

  if (game_date_start === '' && game_date_end !== '') {
    query += ` AND Game_Date <= '${game_date_end}'`;
  }

  query += ` ORDER BY Game_Date ASC`;
  // query += ` LIMIT 200000`;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else if (data.length != 0) {
      res.json(data);
    } else {
      res.status(404).json({});
    }
  });
}

const search_teams = async function(req, res) {
  const team = req.query.team ?? 'Philadelphia 76ers';
  const pts = req.query.pts ?? 0;
  const fg_pct = req.query.fg_pct ?? 0;
  const ft_pct = req.query.ft_pct ?? 0;
  const fg3_pct = req.query.fg3_pct ?? 0;
  const ast = req.query.ast ?? 0;
  const reb = req.query.reb ?? 0;
  const game_season = req.query.game_season ?? 2021;
  const game_date_start = req.query.game_date_start ?? '';
  const game_date_end = req.query.game_date_end ?? '';
  const result = req.query.result ?? 'Win';

  let query = `
    WITH 
  `;

  if (game_date_start === '' && game_date_end === '') {
    if (result === 'Win') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season})
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season})
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    } else if (result === 'Loss') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season})
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season})
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    }
  } else if (game_date_start !== '' && game_date_end !== '') {
    if (result === 'Win') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season} AND Game_Date BETWEEN '${game_date_start}' AND '${game_date_end}')
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season} AND Game_Date BETWEEN '${game_date_start}' AND '${game_date_end}')
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    } else if (result === 'Loss') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season} AND Game_Date BETWEEN '${game_date_start}' AND '${game_date_end}')
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season} AND Game_Date BETWEEN '${game_date_start}' AND '${game_date_end}')
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    }
  } else if (game_date_start !== '' && game_date_end === '') {
    if (result === 'Win') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season} AND Game_Date >= '${game_date_start}')
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season} AND Game_Date >= '${game_date_start}')
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    } else if (result === 'Loss') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season} AND Game_Date >= '${game_date_start}')
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season} AND Game_Date >= '${game_date_start}')
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    }
  } else if (game_date_start === '' && game_date_end !== '') {
    if (result === 'Win') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season} AND Game_Date <= '${game_date_end}')
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season} AND Game_Date <= '${game_date_end}')
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    } else if (result === 'Loss') {
      query += `
        ordered AS (
          (SELECT
              GAME_ID,
              Home_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Home_Team = '${team}' AND HomePTS >= ${pts} AND
                HomeFG_PCT >= ${fg_pct} AND HomeFT_PCT >= ${ft_pct} AND HomeFG3_PCT >= ${fg3_pct}
                AND Home_AST >= ${ast} AND Home_REB >= ${reb} AND Result = 'AwayWin'
                AND Game_Season = ${game_season} AND Game_Date <= '${game_date_end}')
          UNION
          (SELECT
              GAME_ID,
              Away_Team AS Team,
              Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
          FROM Wrapper_Team
          WHERE Away_Team = '${team}' AND AwayPTS >= ${pts} AND
                AwayFG_PCT >= ${fg_pct} AND AwayFT_PCT >= ${ft_pct} AND AwayFG3_PCT >= ${fg3_pct}
                AND Away_AST >= ${ast} AND Away_REB >= ${reb} AND Result = 'HomeWin'
                AND Game_Season = ${game_season} AND Game_Date <= '${game_date_end}')
        )

        SELECT * FROM ordered ORDER BY Game_Date ASC;
      `;
    }
  }

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else if (data.length != 0) {
      res.json(data);
    } else {
      res.status(404).json({});
    }
  });
}

const get_team_names = async function(req, res) {
  connection.query(`
    SELECT DISTINCT CONCAT(city, ' ', nickname) AS name
    FROM Team
    ORDER BY name;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

/******************
 * Championship Queries *
 ******************/
// Route 1: GET /champions
const champion = async function(req, res) {
  // implement a route that returns championship information  given a season
  
  connection.query(`
  with cte1 AS (
    Select STR_TO_DATE(GAME_DATE_EST,'%m/%d/%Y') as date,
           Game.SEASON
    FROM Game
),
    cte2 as(
        Select TEAM_ID,
               STR_TO_DATE(Ranking.STANDINGSDATE,'%Y-%m-%d') as date,
               Ranking.CONFERENCE, W,L,
               Ranking.HOME_RECORD,Ranking.ROAD_RECORD
               From Ranking
    ),
    west as(
        Select TEAM_ID, cte1.SEASON, cte2.date, CONFERENCE,W,L,
               HOME_RECORD,ROAD_RECORD
        From cte2 join cte1 on cte2.date=cte1.date
        where SEASON='${req.params.season}' and CONFERENCE='West'
        order by W desc limit 1
    ),
    east as(
        Select TEAM_ID, cte1.SEASON, cte2.date, CONFERENCE,W,L,
               HOME_RECORD,ROAD_RECORD
        From cte2 join cte1 on cte2.date=cte1.date
        where SEASON='${req.params.season}' and CONFERENCE='East'
        order by W desc limit 1
    ),
    westaway as (
        SELECT Game_Stats_Team.TEAM_ID_away,
               Round(avg(PTS_away),2) as AVG_Away_Score
        From Game_Stats_Team
        Join Game
        on Game_Stats_Team.GAME_ID = Game.GAME_ID
        WHERE TEAM_ID_away = (SELECT west.TEAM_ID from west) and SEASON='${req.params.season}'
        GROUP BY TEAM_ID_away
    ),
    westhome as (
        SELECT Game_Stats_Team.TEAM_ID_home,
               Round(avg(PTS_home),2) as AVG_Home_Score
        From Game_Stats_Team
        Join Game
        on Game_Stats_Team.GAME_ID = Game.GAME_ID
        WHERE TEAM_ID_home = (SELECT west.TEAM_ID from west) and SEASON='${req.params.season}'
        GROUP BY TEAM_ID_home
    ),
    eastaway as (
        SELECT Game_Stats_Team.TEAM_ID_away,
               Round(avg(PTS_away),2) as AVG_Away_Score
        From Game_Stats_Team
        Join Game
        on Game_Stats_Team.GAME_ID = Game.GAME_ID
        WHERE TEAM_ID_away = (SELECT east.TEAM_ID from east) and SEASON='${req.params.season}'
        GROUP BY TEAM_ID_away
    ),
    easthome as (
        SELECT Game_Stats_Team.TEAM_ID_home,
               Round(avg(PTS_home),2) as AVG_Home_Score
        From Game_Stats_Team
        Join Game
        on Game_Stats_Team.GAME_ID = Game.GAME_ID
        WHERE TEAM_ID_home = (SELECT east.TEAM_ID from east) and SEASON='${req.params.season}'
        GROUP BY TEAM_ID_home
    )
SELECT CONCAT(Team.city, ' ', Team.nickname) as abbreviation, Season, CONFERENCE,W,L,HOME_RECORD,ROAD_RECORD,
       AVG_Away_Score,AVG_Home_Score
From west join westaway on west.TEAM_ID = westaway.TEAM_ID_away
          join westhome on west.TEAM_ID = westhome.TEAM_ID_home
          join Team on west.TEAM_ID = Team.TEAM_ID
union
SELECT CONCAT(Team.city, ' ', Team.nickname) as abbreviation, Season, CONFERENCE,W,L,HOME_RECORD,ROAD_RECORD,
       AVG_Away_Score,AVG_Home_Score
From east join eastaway on east.TEAM_ID = eastaway.TEAM_ID_away
          join easthome on east.TEAM_ID = easthome.TEAM_ID_home
          join Team on east.TEAM_ID = Team.TEAM_ID
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


/******************
 * Game Queries *
 ******************/
// Route 1: Get /highscore

const highscore = async function(req, res) {
  connection.query(`
  with cte1 as(
    select  GAME_ID,abbreviation as Home,TEAM_ID_away ,PTS_home,FG_PCT_home,FT_PCT_home,FG3_PCT_home,
            AST_home,REB_home,PTS_away,FG_PCT_away,FT_PCT_away,FG3_PCT_away,AST_away,
            REB_away
            from Game_Stats_Team
join Team on Game_Stats_Team.TEAM_ID_Home =Team.Team_ID
Order By PTS_home desc limit 10
),
    cte2 as(
        select GAME_ID,Home, Team.abbreviation as Away ,PTS_home,FG_PCT_home,FT_PCT_home,FG3_PCT_home,
            AST_home,REB_home,PTS_away,FG_PCT_away,FT_PCT_away,FG3_PCT_away,AST_away,
            REB_away
        from cte1
        join Team on cte1.TEAM_ID_Away =Team.Team_ID
    )
Select Game.GAME_ID,Season,GAME_DATE_EST,Home, Away ,PTS_home,FG_PCT_home,FT_PCT_home,FG3_PCT_home,
            AST_home,REB_home,PTS_away,FG_PCT_away,FT_PCT_away,FG3_PCT_away,AST_away,
            REB_away
FROM cte2
join Game on cte2.GAME_ID=Game.GAME_ID
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// Route 2: GET /game_date
const game_date = async function(req, res) {
  // implement a route that returns championship information  given a season
  connection.query(`
  With cte1 AS(
    SELECT *, CASE
              WHEN Game_Stats_Team.PTS_home>Game_Stats_Team.PTS_away THEN 'HomeWin'
              ELSE 'AwayWin' END AS Result
   FROM Game_Stats_Team
   ),
      cte2 as(
          select Game_Stats_Team.GAME_ID, TEAM_ID_home, TEAM_ID_away,
          CONCAT(Team.city, ' ', Team.nickname) as Home
          FROM Game_Stats_Team JOIN Team on Game_Stats_Team.TEAM_ID_home = Team.TEAM_ID
      ),
      teamnames as(
          select cte2.GAME_ID,cte2.Home, CONCAT(Team.city, ' ', Team.nickname) as Away
          FROM cte2 JOIN Team on cte2.TEAM_ID_away=Team.TEAM_ID
          order by GAME_ID
      ),
      gamesummary as(
          Select teamnames.Home, teamnames.Away,cte1.GAME_ID,
                 cte1.Result, cte1.PTS_home,cte1.PTS_away,
                 cte1.FG3_PCT_home,cte1.FG3_PCT_away,
                 cte1.AST_home,cte1.AST_away,
                 cte1.FG_PCT_home,cte1.FG_PCT_away,
                 cte1.FT_PCT_home,cte1.FT_PCT_away,
                 cte1.REB_home,cte1.REB_away
                 FROM cte1
                 left join teamnames
                 on cte1.Game_ID = teamnames.GAME_ID
      )
   select  LEFT(str_to_date(GAME_DATE_EST,'%m/%d/%Y'),10) as date, SEASON, Home, Away,Result,PTS_home,PTS_away,
          FG_PCT_home,FG3_PCT_away,AST_home,AST_away,FG_PCT_home,FG_PCT_away,
          FT_PCT_home,FT_PCT_away,REB_home,REB_away
      from gamesummary
   join Game on gamesummary.GAME_ID = Game.GAME_ID
   where str_to_date(GAME_DATE_EST,'%m/%d/%Y')='${req.params.date}'
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


/******************
 * Trend Page Queries *
 ******************/

// [Simple]: GET /trend/games_count
const games_count = async function(req, res) {

  const player_name = req.query.player_name ?? 'Lebron James';
  
  let query = 
  `
    SELECT count(*) as games_count
    FROM Game_Stats_Player g_s JOIN 
        (SELECT player_id FROM Player WHERE name = '${player_name}') p
        ON g_s.player_id = p.PLAYER_ID
    WHERE FGA IS NOT NULL
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// [Simple]: GET /trend/teams_count
const teams_count = async function(req, res) {

  const player_name = req.query.player_name ?? 'Lebron James';
  
  let query = 
  `
    SELECT count(distinct team_id) as teams_count
    FROM Roster r JOIN 
        (SELECT player_id FROM Player WHERE name = '${player_name}') p
        ON r.player_id = p.PLAYER_ID
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// [Simple]: GET /trend/games_count
const get_player_names = async function(req, res) {
  
  // before optimization
  // let query = 
  // `
  //   SELECT name 
  //   FROM Player p JOIN Game_Stats_Player g_s
  //     ON p.player_id = g_s.player_id
  //   WHERE FGM IS NOT NULL
  //   GROUP BY name
  //   HAVING count(*) > 1
  // `;

  // optimization by creating materialized view
  let query = 
  `
    SELECT * FROM Player_gtone_game;
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// [Complex] Route 1: GET /trend/compare
const compare = async function(req, res) {

  const player_name = req.query.player_name ?? 'LeBron James';
  const metric_name = req.query.metrics ?? 'Total';

  let query = 
  `
    WITH Game_Stats_Player_with_Total AS (
      SELECT *,( 3 * FG3M + 2 * (FGM - FG3M) + 1 * FTM) AS Total
      FROM Game_Stats_Player
    ), latest_5_games AS (
        SELECT g.GAME_ID
        FROM Game_Stats_Player g_s JOIN Player p
                ON g_s.player_id = p.PLAYER_ID
            JOIN Game g
                ON g_s.game_id = g.GAME_ID
        WHERE
            p.name = '${player_name}'
            AND g_s.FTA IS NOT NULL
        ORDER BY str_to_date(g.GAME_DATE_EST, '%m/%d/%y') DESC
        LIMIT 5
    ), latest_5_game_all_player AS (
        SELECT 
            g.GAME_ID
            , g.GAME_DATE_EST
            , p.PLAYER_ID
            , p.name
            , ${metric_name} as metric
        FROM Game_Stats_Player_with_Total g_s JOIN Player p
                ON g_s.player_id = p.PLAYER_ID
            JOIN Game g
                ON g_s.game_id = g.GAME_ID
        WHERE g_s.FTA IS NOT NULL
            AND g_s.game_id IN (SELECT GAME_ID FROM latest_5_games)
    ), metric_rank AS (
        SELECT
            game_id,
            GAME_DATE_EST,
            player_id,
            name,
            metric,
            rank() over(partition by game_id order by metric DESC) as rnk
        FROM latest_5_game_all_player
        ORDER BY game_id, rnk
        )

    SELECT game_date_est, name, metric, rnk
    FROM metric_rank
    WHERE name = '${player_name}'
    ORDER BY str_to_date(game_date_est, '%m/%d/%y'); 
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// [Complex] Route 2: GET /trend/game
const trend_game = async function(req, res) {

  const player_name = req.query.player_name ?? 'Lebron James';
  const metric_name = req.query.metrics ?? 'Total';

  let query = 
  ` WITH Game_Stats_Player_with_Total AS (
    SELECT *,( 3 * FG3M + 2 * (FGM - FG3M) + 1 * FTM) AS Total
    FROM Game_Stats_Player
    )
    
    SELECT * 
      FROM (
        SELECT
          GAME_DATE_EST
          , metric
          , round((CASE WHEN prev_game_metric = 0 AND metric > 0 THEN 1
                  WHEN prev_game_metric = 0 AND metric = 0 THEN 0
              ELSE ((metric - prev_game_metric) / prev_game_metric) END), 3) as game_over_game_pct
        FROM
          (SELECT
              str_to_date(g.GAME_DATE_EST, '%m/%d/%y') as GAME_DATE_EST
                , metric
                , lag(metric, 1) over(order by str_to_date(g.GAME_DATE_EST, '%m/%d/%y')) as prev_game_metric
          FROM
              (
                  SELECT 
                      g_s.game_id
                      , ${metric_name} as metric
                  FROM
                      (SELECT * FROM Game_Stats_Player_with_Total WHERE FTA IS NOT NULL) g_s JOIN
                      (SELECT * FROM Player WHERE name = '${player_name}') p 
                      ON g_s.player_id = p.PLAYER_ID
              ) a
              JOIN Game g
                  ON a.game_id = g.GAME_ID
          ) b
        ORDER BY GAME_DATE_EST DESC
        LIMIT 5
      ) c
  ORDER BY GAME_DATE_EST;
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

/******************
 * PLAYER PAGE ROUTES *
 ******************/

// Route 1: GET /players/:player_name
const player_performance = async function(req, res) {

  const season = req.query.season ?? 2012;
  
  let query = 
  `
  SELECT p.name, g.SEASON, t.nickname AS Team_Played_for, (SUM(FGM*2) + SUM(FTM) + SUM(FG3M*3))/COUNT(*) AS Average_Points,
    SUM(FGM)/SUM(FGA) AS two_point_shot_Percentage,
    SUM(FG3M)/SUM(FG3A) AS three_point_shot_Percentage,
    SUM(FTM)/SUM(FTA) AS free_throw_Percentage,
    SUM(AST)/COUNT(*) AS Average_Assists,
    SUM(OREB + DREB)/COUNT(*) AS Average_Rebounds,
    SUM(STL)/COUNT(*) AS Average_Steals,
    SUM(BLK)/COUNT(*) AS Average_Blocks
  FROM Game g
  JOIN Game_Stats_Player gp ON g.GAME_ID = gp.game_id
  JOIN Player p ON gp.player_id = p.player_id
  JOIN Roster r ON p.player_id = r.player_id
  JOIN Team t ON r.team_id = t.team_id
  WHERE p.name LIKE '${req.params.player_name}'
  AND g.SEASON = ${season}
  AND r.SEASON = ${season}
  AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') <=
        (SELECT STR_TO_DATE(temp1.STANDINGSDATE, '%Y-%m-%d') AS Date1
          FROM (SELECT STANDINGSDATE
                FROM Ranking
                WHERE is_post_season = 1
                  AND YEAR(STR_TO_DATE(STANDINGSDATE, '%Y-%m-%d')) = ${season} + 1) temp1
          ORDER BY Date1
          LIMIT 1)
  AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') >=
        (SELECT STR_TO_DATE(temp2.STANDINGSDATE, '%Y-%m-%d') AS Date2
          FROM (SELECT STANDINGSDATE
                FROM Ranking
                WHERE is_post_season = 0
                  AND YEAR(STR_TO_DATE(STANDINGSDATE, '%Y-%m-%d')) = ${season}) temp2
          ORDER BY Date2
          LIMIT 1)
  GROUP BY name, SEASON;
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};


// Route 2: GET /compare/:player1_name/:player2_name
const compare_player = async function(req, res) {

  const season_start = req.query.season_start ?? 2021;
  const season_end = req.query.season_end ?? 2022;
  
  let query = 
  `
  WITH Player1 AS (
      SELECT g.SEASON as season,
              p.name,
              AVG(gp.FGM * 2 + gp.FG3M * 3 + gp.FTM) as average_points
      FROM Game_Stats_Player gp
      JOIN Game g ON gp.GAME_ID = g.GAME_ID
      JOIN Player p ON gp.player_id = p.PLAYER_ID
      WHERE p.name LIKE '${req.params.player1_name}'
          AND g.SEASON BETWEEN ${season_start} AND ${season_end}
      GROUP BY g.SEASON
  ),
  Player2 AS (
      SELECT g.SEASON as season,
              p.name,
              AVG(gp.FGM * 2 + gp.FG3M * 3 + gp.FTM) as average_points
      FROM Game_Stats_Player gp
      JOIN Game g ON gp.GAME_ID = g.GAME_ID
      JOIN Player p ON gp.player_id = p.PLAYER_ID
      WHERE p.name LIKE '${req.params.player2_name}'
          AND g.SEASON BETWEEN ${season_start} AND ${season_end}
      GROUP BY g.SEASON
  )
  SELECT p1.season,
        p1.name AS Player1_Name,
        p2.name AS Player2_Name,
        p1.average_points AS Player1_average_points,
        p2.average_points AS Player2_average_points
  FROM Player1 p1
  JOIN Player2 p2
      ON p1.season = p2.season
  ORDER By p1.season
  `;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};


/******************
 * Team PAGE ROUTES *
 ******************/

// Route 1: GET /team/:team_name
const team_stats_season = async function(req, res) {

  const season = req.query.season ?? 2021;
  const team = req.params.team_name;
  
  let query = 
  `
  WITH season_games AS (
      SELECT * FROM Game g
      WHERE g.SEASON = ${season}
      AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') <=
              (SELECT STR_TO_DATE(temp1.STANDINGSDATE, '%Y-%m-%d') AS Date1
              FROM (SELECT STANDINGSDATE
                    FROM Ranking
                    WHERE is_post_season = 1
                      AND YEAR(STR_TO_DATE(STANDINGSDATE, '%Y-%m-%d')) = ${season} + 1) temp1
              ORDER BY Date1
              LIMIT 1)
      AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') >=
              (SELECT STR_TO_DATE(temp2.STANDINGSDATE, '%Y-%m-%d') AS Date2
              FROM (SELECT STANDINGSDATE
                    FROM Ranking
                    WHERE is_post_season = 0
                      AND YEAR(STR_TO_DATE(STANDINGSDATE, '%Y-%m-%d')) = ${season}) temp2
              ORDER BY Date2
              LIMIT 1)
      ORDER BY STR_TO_DATE(GAME_DATE_EST, '%Y-%m-%d')
  )
  SELECT season_games.SEASON as SEASON,
        t1.nickname AS Home_team,
        t2.nickname AS Away_team,
        season_games.GAME_DATE_EST AS Date,
        PTS_home,
        FG_PCT_home,
        FT_PCT_home,
        FG3_PCT_home,
        AST_home,
        REB_home,
        PTS_away,
        FG_PCT_away,
        FT_PCT_away,
        FG3_PCT_away,
        AST_away,
        REB_away
  FROM Game_Stats_Team gt
      JOIN Team t1 ON gt.TEAM_ID_home = t1.TEAM_ID
      JOIN Team t2 ON gt.TEAM_ID_away = t2.TEAM_ID
      JOIN season_games ON gt.GAME_ID = season_games.GAME_ID
  WHERE t1.nickname LIKE '${team}' OR t2.nickname LIKE '${team}'
  ORDER BY STR_TO_DATE(Date, '%Y-%m-%d')
`;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

module.exports = {
  // Trend Page Routes
  get_player_names,
  games_count,
  compare,
  trend_game,
  teams_count,
  // Championship
  champion,
  // Game Page
  game_date,
  highscore,
  // HomePage Routes
  acknowledge,
  all_teams,
  search_players,
  search_teams,
  get_team_names,
  // Player Page
  player_performance,
  compare_player,
  // Team Page
  team_stats_season
}
