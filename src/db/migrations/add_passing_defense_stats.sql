-- ============================================
-- PASSING STATS
-- ============================================

-- Player passing stats
CREATE TABLE player_passing_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Total passing
    completed_total INTEGER DEFAULT 0,
    attempted_total INTEGER DEFAULT 0,
    completion_pct_total DECIMAL(5,2) DEFAULT 0,
    total_distance INTEGER DEFAULT 0,
    progressive_distance INTEGER DEFAULT 0,
    
    -- Short passes
    completed_short INTEGER DEFAULT 0,
    attempted_short INTEGER DEFAULT 0,
    completion_pct_short DECIMAL(5,2) DEFAULT 0,
    
    -- Medium passes
    completed_medium INTEGER DEFAULT 0,
    attempted_medium INTEGER DEFAULT 0,
    completion_pct_medium DECIMAL(5,2) DEFAULT 0,
    
    -- Long passes
    completed_long INTEGER DEFAULT 0,
    attempted_long INTEGER DEFAULT 0,
    completion_pct_long DECIMAL(5,2) DEFAULT 0,
    
    -- Assists and chance creation
    assists INTEGER DEFAULT 0,
    xag DECIMAL(10,2) DEFAULT 0,
    xa_expected DECIMAL(10,2) DEFAULT 0,
    assists_minus_xag DECIMAL(10,2) DEFAULT 0,
    key_passes INTEGER DEFAULT 0,
    passes_into_final_third INTEGER DEFAULT 0,
    passes_into_penalty_area INTEGER DEFAULT 0,
    crosses_into_penalty_area INTEGER DEFAULT 0,
    progressive_passes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

-- Team passing stats
CREATE TABLE team_passing_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    -- Total passing
    completed_total INTEGER DEFAULT 0,
    attempted_total INTEGER DEFAULT 0,
    completion_pct_total DECIMAL(5,2) DEFAULT 0,
    total_distance INTEGER DEFAULT 0,
    progressive_distance INTEGER DEFAULT 0,
    
    -- Short passes
    completed_short INTEGER DEFAULT 0,
    attempted_short INTEGER DEFAULT 0,
    completion_pct_short DECIMAL(5,2) DEFAULT 0,
    
    -- Medium passes
    completed_medium INTEGER DEFAULT 0,
    attempted_medium INTEGER DEFAULT 0,
    completion_pct_medium DECIMAL(5,2) DEFAULT 0,
    
    -- Long passes
    completed_long INTEGER DEFAULT 0,
    attempted_long INTEGER DEFAULT 0,
    completion_pct_long DECIMAL(5,2) DEFAULT 0,
    
    -- Assists and chance creation
    assists INTEGER DEFAULT 0,
    xag DECIMAL(10,2) DEFAULT 0,
    xa_expected DECIMAL(10,2) DEFAULT 0,
    assists_minus_xag DECIMAL(10,2) DEFAULT 0,
    key_passes INTEGER DEFAULT 0,
    passes_into_final_third INTEGER DEFAULT 0,
    passes_into_penalty_area INTEGER DEFAULT 0,
    crosses_into_penalty_area INTEGER DEFAULT 0,
    progressive_passes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- ============================================
-- DEFENSE STATS
-- ============================================

-- Player defense stats
CREATE TABLE player_defense_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Tackles
    tackles INTEGER DEFAULT 0,
    tackles_won INTEGER DEFAULT 0,
    tackles_def_3rd INTEGER DEFAULT 0,
    tackles_mid_3rd INTEGER DEFAULT 0,
    tackles_att_3rd INTEGER DEFAULT 0,
    
    -- Challenges
    challenge_tackles INTEGER DEFAULT 0,
    challenges_attempted INTEGER DEFAULT 0,
    challenge_tackles_pct DECIMAL(5,2) DEFAULT 0,
    challenges_lost INTEGER DEFAULT 0,
    
    -- Blocks
    blocks INTEGER DEFAULT 0,
    shots_blocked INTEGER DEFAULT 0,
    passes_blocked INTEGER DEFAULT 0,
    
    -- Other defensive actions
    interceptions INTEGER DEFAULT 0,
    tackles_plus_interceptions INTEGER DEFAULT 0,
    clearances INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

-- Team defense stats
CREATE TABLE team_defense_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    -- Tackles
    tackles INTEGER DEFAULT 0,
    tackles_won INTEGER DEFAULT 0,
    tackles_def_3rd INTEGER DEFAULT 0,
    tackles_mid_3rd INTEGER DEFAULT 0,
    tackles_att_3rd INTEGER DEFAULT 0,
    
    -- Challenges
    challenge_tackles INTEGER DEFAULT 0,
    challenges_attempted INTEGER DEFAULT 0,
    challenge_tackles_pct DECIMAL(5,2) DEFAULT 0,
    challenges_lost INTEGER DEFAULT 0,
    
    -- Blocks
    blocks INTEGER DEFAULT 0,
    shots_blocked INTEGER DEFAULT 0,
    passes_blocked INTEGER DEFAULT 0,
    
    -- Other defensive actions
    interceptions INTEGER DEFAULT 0,
    tackles_plus_interceptions INTEGER DEFAULT 0,
    clearances INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- Indexes
CREATE INDEX idx_player_passing_stats_season ON player_passing_stats(player_season_stat_id);
CREATE INDEX idx_team_passing_stats_season ON team_passing_stats(team_season_stat_id);
CREATE INDEX idx_player_defense_stats_season ON player_defense_stats(player_season_stat_id);
CREATE INDEX idx_team_defense_stats_season ON team_defense_stats(team_season_stat_id);