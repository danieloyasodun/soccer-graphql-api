-- ============================================
-- GCA (Goal and Shot Creating Actions)
-- ============================================

CREATE TABLE player_gca_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Shot Creating Actions
    sca INTEGER DEFAULT 0,
    sca_per_90 DECIMAL(10,2) DEFAULT 0,
    sca_pass_live INTEGER DEFAULT 0,
    sca_pass_dead INTEGER DEFAULT 0,
    sca_take_on INTEGER DEFAULT 0,
    sca_shot INTEGER DEFAULT 0,
    sca_fouled INTEGER DEFAULT 0,
    sca_defense INTEGER DEFAULT 0,
    
    -- Goal Creating Actions
    gca INTEGER DEFAULT 0,
    gca_per_90 DECIMAL(10,2) DEFAULT 0,
    gca_pass_live INTEGER DEFAULT 0,
    gca_pass_dead INTEGER DEFAULT 0,
    gca_take_on INTEGER DEFAULT 0,
    gca_shot INTEGER DEFAULT 0,
    gca_fouled INTEGER DEFAULT 0,
    gca_defense INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

CREATE TABLE team_gca_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    sca INTEGER DEFAULT 0,
    sca_per_90 DECIMAL(10,2) DEFAULT 0,
    sca_pass_live INTEGER DEFAULT 0,
    sca_pass_dead INTEGER DEFAULT 0,
    sca_take_on INTEGER DEFAULT 0,
    sca_shot INTEGER DEFAULT 0,
    sca_fouled INTEGER DEFAULT 0,
    sca_defense INTEGER DEFAULT 0,
    
    gca INTEGER DEFAULT 0,
    gca_per_90 DECIMAL(10,2) DEFAULT 0,
    gca_pass_live INTEGER DEFAULT 0,
    gca_pass_dead INTEGER DEFAULT 0,
    gca_take_on INTEGER DEFAULT 0,
    gca_shot INTEGER DEFAULT 0,
    gca_fouled INTEGER DEFAULT 0,
    gca_defense INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- ============================================
-- POSSESSION
-- ============================================

CREATE TABLE player_possession_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Touches
    touches INTEGER DEFAULT 0,
    touches_def_pen INTEGER DEFAULT 0,
    touches_def_3rd INTEGER DEFAULT 0,
    touches_mid_3rd INTEGER DEFAULT 0,
    touches_att_3rd INTEGER DEFAULT 0,
    touches_att_pen INTEGER DEFAULT 0,
    touches_live INTEGER DEFAULT 0,
    
    -- Take-ons
    take_ons_attempted INTEGER DEFAULT 0,
    take_ons_successful INTEGER DEFAULT 0,
    take_ons_success_pct DECIMAL(5,2) DEFAULT 0,
    take_ons_tackled INTEGER DEFAULT 0,
    take_ons_tackled_pct DECIMAL(5,2) DEFAULT 0,
    
    -- Carries
    carries INTEGER DEFAULT 0,
    carries_total_distance INTEGER DEFAULT 0,
    carries_progressive_distance INTEGER DEFAULT 0,
    progressive_carries INTEGER DEFAULT 0,
    carries_into_final_third INTEGER DEFAULT 0,
    carries_into_penalty_area INTEGER DEFAULT 0,
    miscontrols INTEGER DEFAULT 0,
    dispossessed INTEGER DEFAULT 0,
    
    -- Receiving
    passes_received INTEGER DEFAULT 0,
    progressive_passes_received INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

CREATE TABLE team_possession_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    touches INTEGER DEFAULT 0,
    touches_def_pen INTEGER DEFAULT 0,
    touches_def_3rd INTEGER DEFAULT 0,
    touches_mid_3rd INTEGER DEFAULT 0,
    touches_att_3rd INTEGER DEFAULT 0,
    touches_att_pen INTEGER DEFAULT 0,
    touches_live INTEGER DEFAULT 0,
    
    take_ons_attempted INTEGER DEFAULT 0,
    take_ons_successful INTEGER DEFAULT 0,
    take_ons_success_pct DECIMAL(5,2) DEFAULT 0,
    take_ons_tackled INTEGER DEFAULT 0,
    take_ons_tackled_pct DECIMAL(5,2) DEFAULT 0,
    
    carries INTEGER DEFAULT 0,
    carries_total_distance INTEGER DEFAULT 0,
    carries_progressive_distance INTEGER DEFAULT 0,
    progressive_carries INTEGER DEFAULT 0,
    carries_into_final_third INTEGER DEFAULT 0,
    carries_into_penalty_area INTEGER DEFAULT 0,
    miscontrols INTEGER DEFAULT 0,
    dispossessed INTEGER DEFAULT 0,
    
    passes_received INTEGER DEFAULT 0,
    progressive_passes_received INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- ============================================
-- PLAYING TIME
-- ============================================

CREATE TABLE player_playing_time_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Playing time
    matches_played INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    minutes_per_match DECIMAL(10,1) DEFAULT 0,
    minutes_pct DECIMAL(5,2) DEFAULT 0,
    minutes_per_90 DECIMAL(10,2) DEFAULT 0,
    
    -- Starts
    starts INTEGER DEFAULT 0,
    minutes_per_start DECIMAL(10,1) DEFAULT 0,
    complete_matches INTEGER DEFAULT 0,
    
    -- Subs
    subs INTEGER DEFAULT 0,
    minutes_per_sub DECIMAL(10,1) DEFAULT 0,
    unused_sub INTEGER DEFAULT 0,
    
    -- Team success
    points_per_match DECIMAL(10,2) DEFAULT 0,
    on_goals_for INTEGER DEFAULT 0,
    on_goals_against INTEGER DEFAULT 0,
    plus_minus INTEGER DEFAULT 0,
    plus_minus_per_90 DECIMAL(10,2) DEFAULT 0,
    on_off DECIMAL(10,2) DEFAULT 0,
    
    -- Expected team success
    on_xg DECIMAL(10,2) DEFAULT 0,
    on_xga DECIMAL(10,2) DEFAULT 0,
    xg_plus_minus DECIMAL(10,2) DEFAULT 0,
    xg_plus_minus_per_90 DECIMAL(10,2) DEFAULT 0,
    xg_on_off DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

CREATE TABLE team_playing_time_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    matches_played INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    minutes_per_match DECIMAL(10,1) DEFAULT 0,
    minutes_pct DECIMAL(5,2) DEFAULT 0,
    minutes_per_90 DECIMAL(10,2) DEFAULT 0,
    
    starts INTEGER DEFAULT 0,
    minutes_per_start DECIMAL(10,1) DEFAULT 0,
    complete_matches INTEGER DEFAULT 0,
    
    subs INTEGER DEFAULT 0,
    minutes_per_sub DECIMAL(10,1) DEFAULT 0,
    unused_sub INTEGER DEFAULT 0,
    
    points_per_match DECIMAL(10,2) DEFAULT 0,
    on_goals_for INTEGER DEFAULT 0,
    on_goals_against INTEGER DEFAULT 0,
    plus_minus INTEGER DEFAULT 0,
    plus_minus_per_90 DECIMAL(10,2) DEFAULT 0,
    
    on_xg DECIMAL(10,2) DEFAULT 0,
    on_xga DECIMAL(10,2) DEFAULT 0,
    xg_plus_minus DECIMAL(10,2) DEFAULT 0,
    xg_plus_minus_per_90 DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- ============================================
-- MISC (Miscellaneous Stats)
-- ============================================

CREATE TABLE player_misc_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Cards
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    second_yellow INTEGER DEFAULT 0,
    
    -- Fouls
    fouls_committed INTEGER DEFAULT 0,
    fouls_drawn INTEGER DEFAULT 0,
    
    -- Other
    offsides INTEGER DEFAULT 0,
    crosses INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    tackles_won INTEGER DEFAULT 0,
    penalty_kicks_won INTEGER DEFAULT 0,
    penalty_kicks_conceded INTEGER DEFAULT 0,
    own_goals INTEGER DEFAULT 0,
    
    -- Ball recovery
    ball_recoveries INTEGER DEFAULT 0,
    aerials_won INTEGER DEFAULT 0,
    aerials_lost INTEGER DEFAULT 0,
    aerials_won_pct DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

CREATE TABLE team_misc_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    second_yellow INTEGER DEFAULT 0,
    
    fouls_committed INTEGER DEFAULT 0,
    fouls_drawn INTEGER DEFAULT 0,
    
    offsides INTEGER DEFAULT 0,
    crosses INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    tackles_won INTEGER DEFAULT 0,
    penalty_kicks_won INTEGER DEFAULT 0,
    penalty_kicks_conceded INTEGER DEFAULT 0,
    own_goals INTEGER DEFAULT 0,
    
    ball_recoveries INTEGER DEFAULT 0,
    aerials_won INTEGER DEFAULT 0,
    aerials_lost INTEGER DEFAULT 0,
    aerials_won_pct DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- ============================================
-- GOALKEEPER STATS
-- ============================================

CREATE TABLE player_keeper_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Playing time
    matches_played INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    minutes_per_90 DECIMAL(10,2) DEFAULT 0,
    
    -- Performance
    goals_against INTEGER DEFAULT 0,
    goals_against_per_90 DECIMAL(10,2) DEFAULT 0,
    shots_on_target_against INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    save_pct DECIMAL(5,2) DEFAULT 0,
    
    -- Record
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    clean_sheet_pct DECIMAL(5,2) DEFAULT 0,
    
    -- Penalties
    penalty_kicks_attempted INTEGER DEFAULT 0,
    penalty_kicks_allowed INTEGER DEFAULT 0,
    penalty_kicks_saved INTEGER DEFAULT 0,
    penalty_kicks_missed INTEGER DEFAULT 0,
    penalty_save_pct DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

CREATE TABLE team_keeper_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    matches_played INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    minutes_per_90 DECIMAL(10,2) DEFAULT 0,
    
    goals_against INTEGER DEFAULT 0,
    goals_against_per_90 DECIMAL(10,2) DEFAULT 0,
    shots_on_target_against INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    save_pct DECIMAL(5,2) DEFAULT 0,
    
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    clean_sheet_pct DECIMAL(5,2) DEFAULT 0,
    
    penalty_kicks_attempted INTEGER DEFAULT 0,
    penalty_kicks_allowed INTEGER DEFAULT 0,
    penalty_kicks_saved INTEGER DEFAULT 0,
    penalty_kicks_missed INTEGER DEFAULT 0,
    penalty_save_pct DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- ============================================
-- GOALKEEPER ADVANCED STATS
-- ============================================

CREATE TABLE player_keeper_advanced_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,
    
    -- Goals
    goals_against INTEGER DEFAULT 0,
    penalty_kicks_allowed INTEGER DEFAULT 0,
    free_kicks_against INTEGER DEFAULT 0,
    corner_kicks_against INTEGER DEFAULT 0,
    own_goals_against INTEGER DEFAULT 0,
    
    -- Expected
    psxg DECIMAL(10,2) DEFAULT 0,
    psxg_per_shot_on_target DECIMAL(10,3) DEFAULT 0,
    psxg_plus_minus DECIMAL(10,2) DEFAULT 0,
    psxg_plus_minus_per_90 DECIMAL(10,3) DEFAULT 0,
    
    -- Launched passes
    passes_completed_launched INTEGER DEFAULT 0,
    passes_attempted_launched INTEGER DEFAULT 0,
    passes_pct_launched DECIMAL(5,2) DEFAULT 0,
    
    -- Passing
    passes_attempted_gk INTEGER DEFAULT 0,
    passes_throws INTEGER DEFAULT 0,
    pct_passes_launched DECIMAL(5,2) DEFAULT 0,
    avg_pass_length DECIMAL(10,1) DEFAULT 0,
    
    -- Goal kicks
    goal_kicks_attempted INTEGER DEFAULT 0,
    pct_goal_kicks_launched DECIMAL(5,2) DEFAULT 0,
    avg_goal_kick_length DECIMAL(10,1) DEFAULT 0,
    
    -- Crosses
    crosses_faced INTEGER DEFAULT 0,
    crosses_stopped INTEGER DEFAULT 0,
    crosses_stopped_pct DECIMAL(5,2) DEFAULT 0,
    
    -- Sweeper
    def_actions_outside_pen_area INTEGER DEFAULT 0,
    def_actions_outside_pen_area_per_90 DECIMAL(10,2) DEFAULT 0,
    avg_distance_def_actions DECIMAL(10,1) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_season_stat_id)
);

CREATE TABLE team_keeper_advanced_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,
    
    goals_against INTEGER DEFAULT 0,
    penalty_kicks_allowed INTEGER DEFAULT 0,
    free_kicks_against INTEGER DEFAULT 0,
    corner_kicks_against INTEGER DEFAULT 0,
    own_goals_against INTEGER DEFAULT 0,
    
    psxg DECIMAL(10,2) DEFAULT 0,
    psxg_per_shot_on_target DECIMAL(10,3) DEFAULT 0,
    psxg_plus_minus DECIMAL(10,2) DEFAULT 0,
    psxg_plus_minus_per_90 DECIMAL(10,3) DEFAULT 0,
    
    passes_completed_launched INTEGER DEFAULT 0,
    passes_attempted_launched INTEGER DEFAULT 0,
    passes_pct_launched DECIMAL(5,2) DEFAULT 0,
    
    passes_attempted_gk INTEGER DEFAULT 0,
    passes_throws INTEGER DEFAULT 0,
    pct_passes_launched DECIMAL(5,2) DEFAULT 0,
    avg_pass_length DECIMAL(10,1) DEFAULT 0,
    
    goal_kicks_attempted INTEGER DEFAULT 0,
    pct_goal_kicks_launched DECIMAL(5,2) DEFAULT 0,
    avg_goal_kick_length DECIMAL(10,1) DEFAULT 0,
    
    crosses_faced INTEGER DEFAULT 0,
    crosses_stopped INTEGER DEFAULT 0,
    crosses_stopped_pct DECIMAL(5,2) DEFAULT 0,
    
    def_actions_outside_pen_area INTEGER DEFAULT 0,
    def_actions_outside_pen_area_per_90 DECIMAL(10,2) DEFAULT 0,
    avg_distance_def_actions DECIMAL(10,1) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_season_stat_id)
);

-- Indexes
CREATE INDEX idx_player_gca_stats_season ON player_gca_stats(player_season_stat_id);
CREATE INDEX idx_team_gca_stats_season ON team_gca_stats(team_season_stat_id);
CREATE INDEX idx_player_possession_stats_season ON player_possession_stats(player_season_stat_id);
CREATE INDEX idx_team_possession_stats_season ON team_possession_stats(team_season_stat_id);
CREATE INDEX idx_player_playing_time_stats_season ON player_playing_time_stats(player_season_stat_id);
CREATE INDEX idx_team_playing_time_stats_season ON team_playing_time_stats(team_season_stat_id);
CREATE INDEX idx_player_misc_stats_season ON player_misc_stats(player_season_stat_id);
CREATE INDEX idx_team_misc_stats_season ON team_misc_stats(team_season_stat_id);
CREATE INDEX idx_player_keeper_stats_season ON player_keeper_stats(player_season_stat_id);
CREATE INDEX idx_team_keeper_stats_season ON team_keeper_stats(team_season_stat_id);
CREATE INDEX idx_player_keeper_advanced_stats_season ON player_keeper_advanced_stats(player_season_stat_id);
CREATE INDEX idx_team_keeper_advanced_stats_season ON team_keeper_advanced_stats(team_season_stat_id);