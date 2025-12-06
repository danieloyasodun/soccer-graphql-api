-- Player Passing Type Stats
CREATE TABLE IF NOT EXISTS player_passing_type_stats (
    id SERIAL PRIMARY KEY,
    player_season_stat_id INTEGER REFERENCES player_season_stats(id) ON DELETE CASCADE,

    att INTEGER,
    live_pass INTEGER,
    dead_pass INTEGER,
    fk_pass INTEGER,
    tb_pass INTEGER,
    sw_pass INTEGER,
    crs_pass INTEGER,
    ti_pass INTEGER,
    ck_pass INTEGER,
    in_corner INTEGER,
    out_corner INTEGER,
    str_corner INTEGER,
    cmp_outcomes INTEGER,
    off_outcomes INTEGER,
    blocks_outcomes INTEGER,
    url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Team Passing Type Stats
CREATE TABLE IF NOT EXISTS team_passing_type_stats (
    id SERIAL PRIMARY KEY,
    team_season_stat_id INTEGER REFERENCES team_season_stats(id) ON DELETE CASCADE,

    att INTEGER,
    live_pass INTEGER,
    dead_pass INTEGER,
    fk_pass INTEGER,
    tb_pass INTEGER,
    sw_pass INTEGER,
    crs_pass INTEGER,
    ti_pass INTEGER,
    ck_pass INTEGER,
    in_corner INTEGER,
    out_corner INTEGER,
    str_corner INTEGER,
    cmp_outcomes INTEGER,
    off_outcomes INTEGER,
    blocks_outcomes INTEGER,
    url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
