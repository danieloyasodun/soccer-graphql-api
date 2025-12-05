-- Teams
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fbref_url VARCHAR(500) UNIQUE,
    season_end_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nation VARCHAR(10),
    position VARCHAR(10),
    birth_year INTEGER,
    fbref_url VARCHAR(500) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player season stats (standard only for now)
CREATE TABLE player_season_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season_end_year INTEGER NOT NULL,
    competition VARCHAR(50) NOT NULL,
    age INTEGER,
    position VARCHAR(10),
    
    -- Playing time
    matches_played INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    minutes_per_90 DECIMAL(10,2) DEFAULT 0,
    
    -- Performance
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    goals_plus_assists INTEGER DEFAULT 0,
    goals_minus_pk INTEGER DEFAULT 0,
    penalties_made INTEGER DEFAULT 0,
    penalties_attempted INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    
    -- Expected stats
    xg DECIMAL(10,2) DEFAULT 0,
    npxg DECIMAL(10,2) DEFAULT 0,
    xag DECIMAL(10,2) DEFAULT 0,
    npxg_plus_xag DECIMAL(10,2) DEFAULT 0,
    
    -- Progression
    progressive_carries INTEGER DEFAULT 0,
    progressive_passes INTEGER DEFAULT 0,
    progressive_receptions INTEGER DEFAULT 0,
    
    -- Per 90 stats
    goals_per_90 DECIMAL(10,3) DEFAULT 0,
    assists_per_90 DECIMAL(10,3) DEFAULT 0,
    goals_plus_assists_per_90 DECIMAL(10,3) DEFAULT 0,
    xg_per_90 DECIMAL(10,3) DEFAULT 0,
    xag_per_90 DECIMAL(10,3) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, season_end_year, competition, team_id)
);

-- Team season stats
CREATE TABLE team_season_stats (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season_end_year INTEGER NOT NULL,
    competition VARCHAR(50) NOT NULL,
    team_or_opponent VARCHAR(10) NOT NULL, -- 'team' or 'opponent'
    
    num_players INTEGER,
    average_age DECIMAL(4,1),
    possession_pct DECIMAL(5,2),
    
    -- Playing time
    matches_played INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    minutes_per_90 DECIMAL(10,2) DEFAULT 0,
    
    -- Performance
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    goals_plus_assists INTEGER DEFAULT 0,
    goals_minus_pk INTEGER DEFAULT 0,
    penalties_made INTEGER DEFAULT 0,
    penalties_attempted INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    
    -- Expected stats
    xg DECIMAL(10,2) DEFAULT 0,
    npxg DECIMAL(10,2) DEFAULT 0,
    xag DECIMAL(10,2) DEFAULT 0,
    npxg_plus_xag DECIMAL(10,2) DEFAULT 0,
    
    -- Progression
    progressive_carries INTEGER DEFAULT 0,
    progressive_passes INTEGER DEFAULT 0,
    
    -- Per 90 stats
    goals_per_90 DECIMAL(10,3) DEFAULT 0,
    assists_per_90 DECIMAL(10,3) DEFAULT 0,
    xg_per_90 DECIMAL(10,3) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_end_year, competition, team_or_opponent)
);

-- Indexes for common queries
CREATE INDEX idx_player_stats_player_id ON player_season_stats(player_id);
CREATE INDEX idx_player_stats_season ON player_season_stats(season_end_year);
CREATE INDEX idx_player_stats_competition ON player_season_stats(competition);
CREATE INDEX idx_player_stats_team_id ON player_season_stats(team_id);
CREATE INDEX idx_team_stats_team_id ON team_season_stats(team_id);
CREATE INDEX idx_team_stats_season ON team_season_stats(season_end_year);
CREATE INDEX idx_team_stats_competition ON team_season_stats(competition);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_teams_name ON teams(name);
CREATE UNIQUE INDEX teams_name_season_unique ON teams(name, season_end_year);

-- Composite indexes for common filter combinations
CREATE INDEX idx_player_stats_season_comp ON player_season_stats(season_end_year, competition);
CREATE INDEX idx_player_stats_position ON player_season_stats(position);