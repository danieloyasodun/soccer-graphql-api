-- Player shooting stats
CREATE TABLE player_shooting_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Standard shooting
    goals_standard INTEGER DEFAULT 0,
    shots_standard INTEGER DEFAULT 0,
    shots_on_target_standard INTEGER DEFAULT 0,
    shots_on_target_pct_standard DECIMAL(5,2) DEFAULT 0,
    shots_per_90_standard DECIMAL(10,3) DEFAULT 0,
    shots_on_target_per_90_standard DECIMAL(10,3) DEFAULT 0,
    goals_per_shot_standard DECIMAL(10,3) DEFAULT 0,
    goals_per_shot_on_target_standard DECIMAL(10,3) DEFAULT 0,
    distance_standard DECIMAL(10,2) DEFAULT 0,
    free_kicks_standard INTEGER DEFAULT 0,
    penalties_standard INTEGER DEFAULT 0,
    penalties_attempted_standard INTEGER DEFAULT 0,
    
    -- Expected
    xg_expected DECIMAL(10,2) DEFAULT 0,
    npxg_expected DECIMAL(10,2) DEFAULT 0,
    npxg_per_shot_expected DECIMAL(10,3) DEFAULT 0,
    goals_minus_xg_expected DECIMAL(10,2) DEFAULT 0,
    np_goals_minus_xg_expected DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

-- Team shooting stats
CREATE TABLE team_shooting_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    -- Standard shooting
    goals_standard INTEGER DEFAULT 0,
    shots_standard INTEGER DEFAULT 0,
    shots_on_target_standard INTEGER DEFAULT 0,
    shots_on_target_pct_standard DECIMAL(5,2) DEFAULT 0,
    shots_per_90_standard DECIMAL(10,3) DEFAULT 0,
    shots_on_target_per_90_standard DECIMAL(10,3) DEFAULT 0,
    goals_per_shot_standard DECIMAL(10,3) DEFAULT 0,
    goals_per_shot_on_target_standard DECIMAL(10,3) DEFAULT 0,
    distance_standard DECIMAL(10,2) DEFAULT 0,
    free_kicks_standard INTEGER DEFAULT 0,
    penalties_standard INTEGER DEFAULT 0,
    penalties_attempted_standard INTEGER DEFAULT 0,
    
    -- Expected
    xg_expected DECIMAL(10,2) DEFAULT 0,
    npxg_expected DECIMAL(10,2) DEFAULT 0,
    npxg_per_shot_expected DECIMAL(10,3) DEFAULT 0,
    goals_minus_xg_expected DECIMAL(10,2) DEFAULT 0,
    np_goals_minus_xg_expected DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

CREATE INDEX idx_player_shooting_stats_season ON player_shooting_stats(player_season_stat_id);
CREATE INDEX idx_team_shooting_stats_season ON team_shooting_stats(team_season_stat_id);