-- ###################################################################
-- HomePage Query

-- First Section: NBA Team
WITH TeamName AS (
    SELECT TEAM_ID, CONCAT(Team.city, ' ', Team.nickname) AS name
    FROM Team
),

Conference AS (
    SELECT DISTINCT Ranking.team_id AS TEAM_ID, Ranking.conference AS conference
    FROM Ranking
)

SELECT
    TN.name AS Name,
    T.abbreviation AS Abbreviation,
    T.year_founded AS FoundedYear,
    C.conference AS Conference,
    T.arena AS Arena
FROM Team T
JOIN TeamName TN ON T.TEAM_ID = TN.TEAM_ID
JOIN Conference C ON T.TEAM_ID = C.TEAM_ID
ORDER BY Conference, Name;

-- # Second Section: Player Search
WITH Game_Update AS (
    SELECT
        GST.GAME_ID AS GAME_ID,
        GST.TEAM_ID_home AS Home_Team,
        GST.TEAM_ID_away AS Away_Team,
        G.SEASON AS Game_season,
        G.GAME_DATE_EST AS Game_Date,
        CASE
            WHEN GST.PTS_home > GST.PTS_away THEN 'HomeWin'
            WHEN GST.PTS_home < GST.PTS_away THEN 'AwayWin'
            WHEN GST.PTS_home = GST.PTS_away THEN 'Tie'
            ELSE 'missing'
        END AS Result
    FROM Game_Stats_Team GST
    JOIN Game G ON GST.GAME_ID = G.GAME_ID
),

Game_Update_Matches AS (
    SELECT
        GU.GAME_ID,
        CONCAT(T1.nickname, ' vs. ', T2.nickname) AS MatchUp,
        GU.Game_season,
        GU.Game_Date,
        GU.Result
    FROM Game_Update GU
    JOIN Team T1 ON GU.Home_Team = T1.TEAM_ID
    JOIN Team T2 ON GU.Away_Team = T2.TEAM_ID
    WHERE GU.Result <> 'missing'
),

Wrapper AS (
    SELECT
        PU.name AS Player_Name,
        T.nickname AS Player_Team,
        GUM.Game_season,
        STR_TO_DATE(GUM.Game_Date,'%m/%d/%Y') AS Game_Date,
        GUM.MatchUp,
        GSP.home_or_away AS Home_Away,
        GUM.Result AS WinningTeam,
        CASE
            WHEN GSP.home_or_away = 'home' AND GUM.Result = 'HomeWin' THEN 'Win'
            WHEN GSP.home_or_away = 'away' AND GUM.Result = 'AwayWin' THEN 'Win'
            WHEN GSP.home_or_away = 'home' AND GUM.Result = 'AwayWin' THEN 'Loss'
            WHEN GSP.home_or_away = 'away' AND GUM.Result = 'HomeWin' THEN 'Loss'
        END AS Result,
        CASE
            WHEN INSTR(MIN, ':') > 0 THEN MIN
            ELSE CONCAT(MIN, ':00')
        END AS MIN,
        (3*FG3M + 2*(FGM - FG3M) + 1*FTM) AS PTS,
        FGM,
        FGA,
        CASE WHEN FGA = 0 THEN 0.000 ELSE (FGM / FGA) END AS FG_PCT,
        FG3M,
        FG3A,
        CASE WHEN FG3A = 0 THEN 0.000 ELSE (FG3M / FG3A) END AS FG3_PCT,
        FTM,
        FTA,
        CASE WHEN FTA = 0 THEN 0.000 ELSE (FTM / FTA) END AS FT_PCT,
        OREB,
        DREB,
        (OREB + DREB) AS REB,
        AST,
        STL,
        BLK,
        TOO AS TOV,
        PF
    FROM Game_Stats_Player GSP
    JOIN Game_Update_Matches GUM ON GUM.GAME_ID = GSP.game_id
    JOIN Player PU ON GSP.player_id = PU.PLAYER_ID
    JOIN Team T ON GSP.team_id = T.TEAM_ID
)

SELECT *
FROM Wrapper
WHERE Player_Name = 'LeBron James' AND
      Game_season = 2013 AND
      Result = 'Win' AND
      PTS >= 0 AND
      FG_PCT >= 0 AND FG3_PCT >= 0 AND FT_PCT >= 0 AND
      REB >= 0 AND AST >= 0 AND STL >=0 AND BLK >=0 AND
      TOV >=0 AND PF >= 0 AND
      Game_Date BETWEEN '2013-10-07' AND '2013-11-07';

-- # Third Section: Team Search
WITH GameMatch AS (
    SELECT
        GST.GAME_ID,
        SEASON AS Game_Season,
        STR_TO_DATE(GAME_DATE_EST,'%m/%d/%Y') AS Game_Date,
        CONCAT(T1.nickname, ' vs. ', T2.nickname) AS MatchUp,
        CONCAT(T1.city, ' ', T1.nickname) AS Home_Team,
        CONCAT(T2.city, ' ', T2.nickname) AS Away_Team,
        CASE
            WHEN GST.PTS_home > GST.PTS_away THEN 'HomeWin'
            WHEN GST.PTS_home < GST.PTS_away THEN 'AwayWin'
            WHEN GST.PTS_home = GST.PTS_away THEN 'Tie'
            ELSE 'missing'
        END AS Result
    FROM Game_Stats_Team GST
    JOIN Team T1 ON GST.TEAM_ID_home = T1.TEAM_ID
    JOIN Team T2 ON GST.TEAM_ID_away = T2.TEAM_ID
    JOIN Game G ON GST.GAME_ID = G.GAME_ID
),

Wrapper AS (
    SELECT
        GM.Game_Season,
        GM.Game_Date,
        GM.MatchUp,
        GM.Home_Team,
        GM.Away_Team,
        GM.Result,
        GST.PTS_home AS HomePTS,
        GST.PTS_away AS AwayPTS,
        GST.FG_PCT_home AS HomeFG_PCT,
        GST.FG_PCT_away AS AwayFG_PCT,
        GST.FT_PCT_home AS HomeFT_PCT,
        GST.FT_PCT_away AS AwayFT_PCT,
        GST.FG3_PCT_home AS HomeFG3_PCT,
        GST.FG3_PCT_away AS AwayFG3_PCT,
        GST.AST_home AS Home_AST,
        GST.AST_away AS Away_AST,
        GST.REB_home AS Home_REB,
        GST.REB_away AS Away_REB
    FROM Game_Stats_Team GST
    JOIN GameMatch AS GM ON GST.GAME_ID = GM.GAME_ID
    WHERE Result <> 'missing'
)


(SELECT
     Home_Team AS Team,
     Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
FROM Wrapper
WHERE Home_Team = 'Philadelphia 76ers' AND HomePTS >= 90 AND
      HomeFG_PCT >=0 AND HomeFT_PCT >= 0 AND HomeFG3_PCT >=0
      AND Home_AST >=0 AND Home_REB >= 0 AND Result = 'HomeWin'
      AND Game_Season = 2013 AND Game_Date BETWEEN '2013-10-07' AND '2013-12-07')
UNION
(SELECT
     Away_Team AS Team,
    Game_Season, Game_Date, MatchUp, Home_Team, Away_Team, Result, HomePTS, AwayPTS, HomeFG_PCT, AwayFG_PCT, HomeFT_PCT, AwayFT_PCT, HomeFG3_PCT, AwayFG3_PCT, Home_AST, Away_AST, Home_REB, Away_REB
FROM Wrapper
WHERE Away_Team = 'Philadelphia 76ers' AND AwayPTS >= 90 AND
      AwayFG_PCT >=0 AND AwayFT_PCT >= 0 AND AwayFG3_PCT >=0
      AND Away_AST >=0 AND Away_REB >= 0 AND Result = 'AwayWin'
      AND Game_Season = 2013 AND Game_Date BETWEEN '2013-10-07' AND '2013-12-07')

       
-- USE Project;
-- ###### Simple Query 1 #######
SELECT name, SEASON, (SUM(FGM*2) + SUM(FTM) + SUM(FG3M*3))/COUNT(*) AS Average_Points,
       SUM(FGM)/SUM(FGA) AS 2_point_shot_Percentage,
       SUM(FG3M)/SUM(FG3A) AS 3_point_shot_Percentage,
       SUM(FTM)/SUM(FTA) AS Free_Throw_Percentage
FROM Game g
    JOIN Game_Stats_Player gp ON g.GAME_ID = gp.game_id
    JOIN Player p ON gp.player_id = p.player_id
WHERE p.name LIKE 'LeBron James'
    AND g.SEASON = 2012
    AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') <=
            (SELECT STR_TO_DATE(temp1.STANDINGSDATE, '%Y-%m-%d') AS Date1
             FROM (SELECT r.STANDINGSDATE
                   FROM Ranking r
                   WHERE (r.W + r.L = 82)
                     AND STANDINGSDATE LIKE '2013%') temp1
             ORDER BY Date1
             LIMIT 1)
    AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') >=
            (SELECT STR_TO_DATE(temp2.STANDINGSDATE, '%Y-%m-%d') AS Date2
             FROM (SELECT r.STANDINGSDATE
                   FROM Ranking r
                   WHERE r.STANDINGSDATE LIKE '2012%'
                     AND (r.W + r.L) = 1) temp2
             ORDER BY Date2
             LIMIT 1)
GROUP BY name, SEASON;

-- ###### Simple Query 2 #######
WITH season_games AS (
    SELECT * FROM Game g
    WHERE g.SEASON = 2010
    AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') <=
            (SELECT STR_TO_DATE(temp1.STANDINGSDATE, '%Y-%m-%d') AS Date1
             FROM (SELECT r.STANDINGSDATE
                   FROM Ranking r
                   WHERE (r.W + r.L = 82)
                     AND STANDINGSDATE LIKE '2011%') temp1
             ORDER BY Date1
             LIMIT 1)
    AND STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y') >=
            (SELECT STR_TO_DATE(temp2.STANDINGSDATE, '%Y-%m-%d') AS Date2
             FROM (SELECT r.STANDINGSDATE
                   FROM Ranking r
                   WHERE r.STANDINGSDATE LIKE '2010%'
                     AND (r.W + r.L) = 1) temp2
             ORDER BY Date2
             LIMIT 1)
    ORDER BY STR_TO_DATE(GAME_DATE_EST, '%m/%d/%Y')
)
SELECT t1.nickname AS Home_team,
       t2.nickname AS Away_team,
       season_games.GAME_DATE_EST,
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
    JOIN season_games ON gt.GAME_ID = season_games.GAME_ID;

-- ###### Simple Query 4 #######
SELECT
    g.SEASON,
    AVG(CASE WHEN lj.player_id IS NOT NULL THEN lj.Points END) AS LeBron_James_Average_Points,
    AVG(CASE WHEN sc.player_id IS NOT NULL THEN sc.Points END) AS Stephen_Curry_Average_Points
FROM
    Game g
LEFT JOIN
    (
        SELECT
            gsp.game_id,
            gsp.player_id,
            (gsp.FGM * 2 + gsp.FG3M * 3 + gsp.FTM) AS Points
        FROM
            Game_Stats_Player gsp
        JOIN
            Player p ON gsp.player_id = p.PLAYER_ID
        WHERE
            p.name = 'Lebron James'
    ) AS lj ON g.GAME_ID = lj.game_id
LEFT JOIN
    (
        SELECT
            gsp.game_id,
            gsp.player_id,
            (gsp.FGM * 2 + gsp.FG3M * 3 + gsp.FTM) AS Points
        FROM
            Game_Stats_Player gsp
        JOIN
            Player p ON gsp.player_id = p.PLAYER_ID
        WHERE
            p.name = 'Stephen Curry'
    ) AS sc ON g.GAME_ID = sc.game_id
WHERE
    g.SEASON BETWEEN 2015 AND 2021
GROUP BY
    g.SEASON;

-- ###### Simple Query 5 #######
SELECT p.player_id, name, count(*) as games_count
FROM Game_Stats_Player g_s JOIN Player p
    ON g_s.player_id = p.PLAYER_ID
WHERE FGA IS NOT NULL
GROUP BY player_id, name;

-- ###### Simple Query 6 #######
SELECT standingsdate, W, L
FROM Ranking
WHERE W + L = 82;


-- ###### Complex Query 5 #######
WITH latest_5_games AS (
    SELECT g.GAME_ID
    FROM Game_Stats_Player g_s JOIN Player p
            ON g_s.player_id = p.PLAYER_ID
        JOIN Game g
            ON g_s.game_id = g.GAME_ID
    WHERE
        p.name = 'LUKA DONCIC' # can change name
        AND g_s.FTA IS NOT NULL
    ORDER BY str_to_date(g.GAME_DATE_EST, '%m/%d/%y') DESC
    LIMIT 5
), latest_5_game_all_player AS (
    SELECT g.GAME_ID, p.PLAYER_ID, p.name, g_s.FTA as metric  # can change metrics
    FROM Game_Stats_Player g_s JOIN Player p
            ON g_s.player_id = p.PLAYER_ID
        JOIN Game g
            ON g_s.game_id = g.GAME_ID
    WHERE g_s.FTA IS NOT NULL
        AND g_s.game_id IN (SELECT GAME_ID FROM latest_5_games)
), metric_rank AS (
    SELECT
        game_id,
        player_id,
        name,
        metric,
        rank() over(partition by game_id order by metric DESC) as rnk
    FROM latest_5_game_all_player
    ORDER BY game_id, rnk
    )

SELECT game_id, name, metric, rnk
FROM metric_rank
WHERE name = 'LUKA DONCIC'; # can change name


-- ###### Complex Query 6 #######
# User Input:   user can specify player name and the metric they are interested in
# Query Output: Avg metric score in the last 5 seasons where the player participated
#               and the season over season percentage change for that metric
SELECT SEASON, metric_per_game, season_over_season_pct_change
FROM
    (SELECT
        SEASON
        , metric_per_game
        , name
        , (CASE WHEN lag(metric_per_game, 1) over(partition by player_id order by SEASON) = 0 and metric_per_game = 0 THEN 0
                WHEN lag(metric_per_game, 1) over(partition by player_id order by SEASON) = 0 and metric_per_game > 0 THEN 1
            ELSE ((metric_per_game - lag(metric_per_game, 1) over(partition by player_id order by SEASON))
               / lag(metric_per_game, 1) over(partition by player_id order by SEASON)) END) as season_over_season_pct_change
    FROM
        ((SELECT SEASON, player_id, name, round(metric_sum / game_played, 2) as metric_per_game
        FROM
            (SELECT
                 g.SEASON
                  , g_s.player_id
                  , p.name
                  , sum(g_s.FGM) as metric_sum # can change metrics
                  , count(*) as game_played
            FROM Game_Stats_Player g_s JOIN Player p
                    ON g_s.player_id = p.PLAYER_ID
                JOIN Game g
                    ON g_s.game_id = g.GAME_ID
            WHERE g_s.min IS NOT NULL
            GROUP BY g.SEASON, g_s.player_id, p.name) a )) b) c # can change name
WHERE name = 'LUKE KENNARD'
ORDER BY SEASON DESC
LIMIT 5;


-- # Pre-Optimized
-- # User Input:   user can specify player name and the metric they are interested in
-- # Query Output: Metric score in the last 5 games where the player participated
-- #               and the game over game percentage change for that metric
SELECT
    GAME_DATE_EST
    , metric
    , game_over_game_pct
FROM
    (SELECT
        GAME_DATE_EST
        , player_id
        , name
        , metric
        , (CASE WHEN lag(metric, 1) over(partition by player_id order by GAME_DATE_EST) = 0 AND metric > 0 THEN 1
                WHEN lag(metric, 1) over(partition by player_id order by GAME_DATE_EST) = 0 AND metric = 0 THEN 0
            ELSE ((metric - lag(metric, 1) over(partition by player_id order by GAME_DATE_EST))
                      / lag(metric, 1) over(partition by player_id order by GAME_DATE_EST)) END) as game_over_game_pct
    FROM
        (SELECT
             str_to_date(g.GAME_DATE_EST, '%m/%d/%y') as GAME_DATE_EST
              , g_s.player_id, p.name, g_s.FGM as metric  # can change metrics
        FROM Game_Stats_Player g_s JOIN Player p
            ON g_s.player_id = p.PLAYER_ID
        JOIN Game g
            ON g_s.game_id = g.GAME_ID
        WHERE g_s.min IS NOT NULL) a
    ORDER BY player_id, GAME_DATE_EST) b
WHERE name = 'LUKA DONCIC' # can change name
ORDER BY GAME_DATE_EST DESC
LIMIT 5;

-- # Post-Optimized
-- # selection first
-- # don't repeat calculation of windows function
SELECT
    GAME_DATE_EST
    , metric
    , (CASE WHEN prev_game_metric = 0 AND metric > 0 THEN 1
            WHEN prev_game_metric = 0 AND metric = 0 THEN 0
        ELSE ((metric - prev_game_metric) / prev_game_metric) END) as game_over_game_pct
FROM
    (SELECT
         str_to_date(g.GAME_DATE_EST, '%m/%d/%y') as GAME_DATE_EST
          , metric
          , lag(metric, 1) over(order by GAME_DATE_EST) as prev_game_metric
    FROM
        (
            SELECT g_s.game_id, g_s.FGM as metric # can change metrics
            FROM
                (SELECT * FROM Game_Stats_Player WHERE min IS NOT NULL) g_s JOIN
                (SELECT * FROM Player WHERE name = 'LUKA DONCIC') p # can change name
                ON g_s.player_id = p.PLAYER_ID
        ) a
        JOIN Game g
            ON a.game_id = g.GAME_ID
    ) b
ORDER BY GAME_DATE_EST DESC
LIMIT 5;
