import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pool from '../src/db/postgres';

// ======================================
// UTILITY FUNCTIONS
// ======================================

function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}, skipping...`);
      resolve([]);
      return;
    }

    const file = fs.readFileSync(filePath, 'utf8');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(`  Parsed ${results.data.length} rows`);
        resolve(results.data as T[]);
      },
      error: (error: any) => reject(error),
    });
  });
}

function parseNumber(value: string | undefined): number {
  if (!value || value === '' || value === 'NA') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseInteger(value: string | undefined): number {
  if (!value || value === '' || value === 'NA') return 0;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

// ======================================
// 1. GCA STATS
// ======================================

interface PlayerGCARow {
  Season_End_Year: string;
  Comp: string;
  Player: string;
  SCA_SCA: string;
  SCA90_SCA: string;
  PassLive_SCA: string;
  PassDead_SCA: string;
  TO_SCA: string;
  Sh_SCA: string;
  Fld_SCA: string;
  Def_SCA: string;
  GCA_GCA: string;
  GCA90_GCA: string;
  PassLive_GCA: string;
  PassDead_GCA: string;
  TO_GCA: string;
  Sh_GCA: string;
  Fld_GCA: string;
  Def_GCA: string;
  Url: string;
}

interface TeamGCARow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  SCA_SCA: string;
  SCA90_SCA: string;
  PassLive_SCA: string;
  PassDead_SCA: string;
  TO_SCA: string;
  Sh_SCA: string;
  Fld_SCA: string;
  Def_SCA: string;
  GCA_GCA: string;
  GCA90_GCA: string;
  PassLive_GCA: string;
  PassDead_GCA: string;
  TO_GCA: string;
  Sh_GCA: string;
  Fld_GCA: string;
  Def_GCA: string;
  Url: string;
}

async function ingestPlayerGCA() {
  console.log('📊 Processing player GCA stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const playerData = await parseCSV<PlayerGCARow>(path.join(dataDir, 'big5', 'player', 'big5_player_gca.csv'));
  
  if (playerData.length === 0) {
    console.log('⚠️  No GCA data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of playerData) {
    const playerResult = await pool.query('SELECT id FROM players WHERE fbref_url = $1', [row.Url]);
    if (playerResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM player_season_stats WHERE player_id = $1 AND season_end_year = $2 AND competition = $3 LIMIT 1`,
      [playerResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp]
    );
    if (statResult.rows.length === 0) continue;

    await pool.query(
      `INSERT INTO player_gca_stats (
        player_season_stat_id, sca, sca_per_90,
        sca_pass_live, sca_pass_dead, sca_take_on, sca_shot, sca_fouled, sca_defense,
        gca, gca_per_90,
        gca_pass_live, gca_pass_dead, gca_take_on, gca_shot, gca_fouled, gca_defense
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (player_season_stat_id) DO NOTHING`,
      [
        statResult.rows[0].id,
        parseInteger(row.SCA_SCA), parseNumber(row.SCA90_SCA),
        parseInteger(row.PassLive_SCA), parseInteger(row.PassDead_SCA),
        parseInteger(row.TO_SCA), parseInteger(row.Sh_SCA),
        parseInteger(row.Fld_SCA), parseInteger(row.Def_SCA),
        parseInteger(row.GCA_GCA), parseNumber(row.GCA90_GCA),
        parseInteger(row.PassLive_GCA), parseInteger(row.PassDead_GCA),
        parseInteger(row.TO_GCA), parseInteger(row.Sh_GCA),
        parseInteger(row.Fld_GCA), parseInteger(row.Def_GCA),
      ]
    );
    processed++;
    if (processed % 500 === 0) console.log(`  ✓ Processed ${processed}/${playerData.length} player GCA records`);
  }
  console.log(`✅ ${processed} player GCA records imported\n`);
}

async function ingestTeamGCA() {
  console.log('📊 Processing team GCA stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const teamData = await parseCSV<TeamGCARow>(path.join(dataDir, 'big5', 'team', 'big5_team_gca.csv'));
  
  if (teamData.length === 0) {
    console.log('⚠️  No team GCA data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of teamData) {
    const teamResult = await pool.query('SELECT id FROM teams WHERE fbref_url = $1', [row.Url]);
    if (teamResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM team_season_stats WHERE team_id = $1 AND season_end_year = $2 AND competition = $3 AND team_or_opponent = $4 LIMIT 1`,
      [teamResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp, row.Team_or_Opponent]
    );
    if (statResult.rows.length === 0) continue;

    await pool.query(
      `INSERT INTO team_gca_stats (
        team_season_stat_id, sca, sca_per_90,
        sca_pass_live, sca_pass_dead, sca_take_on, sca_shot, sca_fouled, sca_defense,
        gca, gca_per_90,
        gca_pass_live, gca_pass_dead, gca_take_on, gca_shot, gca_fouled, gca_defense
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (team_season_stat_id) DO NOTHING`,
      [
        statResult.rows[0].id,
        parseInteger(row.SCA_SCA), parseNumber(row.SCA90_SCA),
        parseInteger(row.PassLive_SCA), parseInteger(row.PassDead_SCA),
        parseInteger(row.TO_SCA), parseInteger(row.Sh_SCA),
        parseInteger(row.Fld_SCA), parseInteger(row.Def_SCA),
        parseInteger(row.GCA_GCA), parseNumber(row.GCA90_GCA),
        parseInteger(row.PassLive_GCA), parseInteger(row.PassDead_GCA),
        parseInteger(row.TO_GCA), parseInteger(row.Sh_GCA),
        parseInteger(row.Fld_GCA), parseInteger(row.Def_GCA),
      ]
    );
    processed++;
    if (processed % 100 === 0) console.log(`  ✓ Processed ${processed}/${teamData.length} team GCA records`);
  }
  console.log(`✅ ${processed} team GCA records imported\n`);
}

// ======================================
// 2. POSSESSION STATS
// ======================================

interface PlayerPossessionRow {
  Season_End_Year: string;
  Comp: string;
  Player: string;
  Touches_Touches: string;
  'Def Pen_Touches': string;
  'Def 3rd_Touches': string;
  'Mid 3rd_Touches': string;
  'Att 3rd_Touches': string;
  'Att Pen_Touches': string;
  Live_Touches: string;
  Att_Take: string;
  Succ_Take: string;
  Succ_percent_Take: string;
  Tkld_Take: string;
  Tkld_percent_Take: string;
  Carries_Carries: string;
  TotDist_Carries: string;
  PrgDist_Carries: string;
  PrgC_Carries: string;
  Final_Third_Carries: string;
  CPA_Carries: string;
  Mis_Carries: string;
  Dis_Carries: string;
  Rec_Receiving: string;
  PrgR_Receiving: string;
  Url: string;
}

interface TeamPossessionRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  Touches_Touches: string;
  'Def Pen_Touches': string;
  'Def 3rd_Touches': string;
  'Mid 3rd_Touches': string;
  'Att 3rd_Touches': string;
  'Att Pen_Touches': string;
  Live_Touches: string;
  Att_Take: string;
  Succ_Take: string;
  Succ_percent_Take: string;
  Tkld_Take: string;
  Tkld_percent_Take: string;
  Carries_Carries: string;
  TotDist_Carries: string;
  PrgDist_Carries: string;
  PrgC_Carries: string;
  Final_Third_Carries: string;
  CPA_Carries: string;
  Mis_Carries: string;
  Dis_Carries: string;
  Rec_Receiving: string;
  PrgR_Receiving: string;
  Url: string;
}

async function ingestPlayerPossession() {
  console.log('📊 Processing player possession stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const playerData = await parseCSV<PlayerPossessionRow>(path.join(dataDir, 'big5', 'player', 'big5_player_possession.csv'));
  
  if (playerData.length === 0) {
    console.log('⚠️  No possession data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of playerData) {
    const playerResult = await pool.query('SELECT id FROM players WHERE fbref_url = $1', [row.Url]);
    if (playerResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM player_season_stats WHERE player_id = $1 AND season_end_year = $2 AND competition = $3 LIMIT 1`,
      [playerResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp]
    );
    if (statResult.rows.length === 0) continue;

    await pool.query(
      `INSERT INTO player_possession_stats (
        player_season_stat_id,
        touches, touches_def_pen, touches_def_3rd, touches_mid_3rd, touches_att_3rd, touches_att_pen, touches_live,
        take_ons_attempted, take_ons_successful, take_ons_success_pct, take_ons_tackled, take_ons_tackled_pct,
        carries, carries_total_distance, carries_progressive_distance, progressive_carries,
        carries_into_final_third, carries_into_penalty_area, miscontrols, dispossessed,
        passes_received, progressive_passes_received
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      ON CONFLICT (player_season_stat_id) DO NOTHING`,
      [
        statResult.rows[0].id,
        parseInteger(row.Touches_Touches),
        parseInteger(row['Def Pen_Touches']),
        parseInteger(row['Def 3rd_Touches']),
        parseInteger(row['Mid 3rd_Touches']),
        parseInteger(row['Att 3rd_Touches']),
        parseInteger(row['Att Pen_Touches']),
        parseInteger(row.Live_Touches),
        parseInteger(row.Att_Take),
        parseInteger(row.Succ_Take),
        parseNumber(row.Succ_percent_Take),
        parseInteger(row.Tkld_Take),
        parseNumber(row.Tkld_percent_Take),
        parseInteger(row.Carries_Carries),
        parseInteger(row.TotDist_Carries),
        parseInteger(row.PrgDist_Carries),
        parseInteger(row.PrgC_Carries),
        parseInteger(row.Final_Third_Carries),
        parseInteger(row.CPA_Carries),
        parseInteger(row.Mis_Carries),
        parseInteger(row.Dis_Carries),
        parseInteger(row.Rec_Receiving),
        parseInteger(row.PrgR_Receiving),
      ]
    );
    processed++;
    if (processed % 500 === 0) console.log(`  ✓ Processed ${processed}/${playerData.length} player possession records`);
  }
  console.log(`✅ ${processed} player possession records imported\n`);
}

async function ingestTeamPossession() {
  console.log('📊 Processing team possession stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const teamData = await parseCSV<TeamPossessionRow>(path.join(dataDir, 'big5', 'team', 'big5_team_possession.csv'));
  
  if (teamData.length === 0) {
    console.log('⚠️  No team possession data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of teamData) {
    const teamResult = await pool.query('SELECT id FROM teams WHERE fbref_url = $1', [row.Url]);
    if (teamResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM team_season_stats WHERE team_id = $1 AND season_end_year = $2 AND competition = $3 AND team_or_opponent = $4 LIMIT 1`,
      [teamResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp, row.Team_or_Opponent]
    );
    if (statResult.rows.length === 0) continue;

    await pool.query(
      `INSERT INTO team_possession_stats (
        team_season_stat_id,
        touches, touches_def_pen, touches_def_3rd, touches_mid_3rd, touches_att_3rd, touches_att_pen, touches_live,
        take_ons_attempted, take_ons_successful, take_ons_success_pct, take_ons_tackled, take_ons_tackled_pct,
        carries, carries_total_distance, carries_progressive_distance, progressive_carries,
        carries_into_final_third, carries_into_penalty_area, miscontrols, dispossessed,
        passes_received, progressive_passes_received
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      ON CONFLICT (team_season_stat_id) DO NOTHING`,
      [
        statResult.rows[0].id,
        parseInteger(row.Touches_Touches),
        parseInteger(row['Def Pen_Touches']),
        parseInteger(row['Def 3rd_Touches']),
        parseInteger(row['Mid 3rd_Touches']),
        parseInteger(row['Att 3rd_Touches']),
        parseInteger(row['Att Pen_Touches']),
        parseInteger(row.Live_Touches),
        parseInteger(row.Att_Take),
        parseInteger(row.Succ_Take),
        parseNumber(row.Succ_percent_Take),
        parseInteger(row.Tkld_Take),
        parseNumber(row.Tkld_percent_Take),
        parseInteger(row.Carries_Carries),
        parseInteger(row.TotDist_Carries),
        parseInteger(row.PrgDist_Carries),
        parseInteger(row.PrgC_Carries),
        parseInteger(row.Final_Third_Carries),
        parseInteger(row.CPA_Carries),
        parseInteger(row.Mis_Carries),
        parseInteger(row.Dis_Carries),
        parseInteger(row.Rec_Receiving),
        parseInteger(row.PrgR_Receiving),
      ]
    );
    processed++;
    if (processed % 100 === 0) console.log(`  ✓ Processed ${processed}/${teamData.length} team possession records`);
  }
  console.log(`✅ ${processed} team possession records imported\n`);
}

// ======================================
// 3. PLAYING TIME STATS
// ======================================

interface PlayerPlayingTimeRow {
  Season_End_Year: string;
  Comp: string;
  Player: string;
  'MP_Playing.Time': string;
  'Min_Playing.Time': string;
  'Mn_per_MP_Playing.Time': string;
  'Min_percent_Playing.Time': string;
  'Mins_Per_90_Playing.Time': string;
  Starts_Starts: string;
  Mn_per_Start_Starts: string;
  Compl_Starts: string;
  Subs_Subs: string;
  Mn_per_Sub_Subs: string;
  unSub_Subs: string;
  PPM_Team_Success: string;
  'onG_Team.Success': string;
  'onGA_Team.Success': string;
  'plus_per__minus__Team.Success': string;
  'plus_per__minus_90_Team.Success': string;
  'On_minus_Off_Team.Success': string;
  'onxG_Team.Success..xG.': string;
  'onxGA_Team.Success..xG': string;
  'xGplus_per__minus__Team.Success..xG': string;
  'xGplus_per__minus_90_Team.Success..xG': string;
  'On_minus_Off_Team.Success..xG': string;
  Url: string;
}

interface TeamPlayingTimeRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  'MP_Playing.Time': string;
  'Min_Playing.Time': string;
  'Mn_per_MP_Playing.Time': string;
  'Min_percent_Playing.Time': string;
  'Mins_Per_90_Playing.Time': string;
  Starts_Starts: string;
  Mn_per_Start_Starts: string;
  Compl_Starts: string;
  Subs_Subs: string;
  Mn_per_Sub_Subs: string;
  unSub_Subs: string;
  'PPM_Team.Success': string;
  'onG_Team.Success': string;
  'onGA_Team.Success': string;
  'plus_per__minus__Team.Success': string;
  'plus_per__minus_90_Team.Success': string;
  'onxG_Team.Success..xG.': string;
  'onxGA_Team.Success..xG': string;
  'xGplus_per__minus__Team.Success..xG': string;
  'xGplus_per__minus_90_Team.Success..xG': string;
  Url: string;
}

async function ingestPlayerPlayingTime() {
  console.log('📊 Processing player playing time stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const playerData = await parseCSV<PlayerPlayingTimeRow>(path.join(dataDir, 'big5', 'player', 'big5_player_playing_time.csv'));
  
  if (playerData.length === 0) {
    console.log('⚠️  No playing time data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of playerData) {
    const playerResult = await pool.query('SELECT id FROM players WHERE fbref_url = $1', [row.Url]);
    if (playerResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM player_season_stats WHERE player_id = $1 AND season_end_year = $2 AND competition = $3 LIMIT 1`,
      [playerResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp]
    );
    if (statResult.rows.length === 0) continue;

    await pool.query(
      `INSERT INTO player_playing_time_stats (
        player_season_stat_id,
        matches_played, minutes, minutes_per_match, minutes_pct, minutes_per_90,
        starts, minutes_per_start, complete_matches,
        subs, minutes_per_sub, unused_sub,
        points_per_match, on_goals_for, on_goals_against, plus_minus, plus_minus_per_90, on_off,
        on_xg, on_xga, xg_plus_minus, xg_plus_minus_per_90, xg_on_off
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      ON CONFLICT (player_season_stat_id) DO NOTHING`,
      [
        statResult.rows[0].id,
        parseInteger(row['MP_Playing.Time']),
        parseInteger(row['Min_Playing.Time']),
        parseNumber(row['Mn_per_MP_Playing.Time']),
        parseNumber(row['Min_percent_Playing.Time']),
        parseNumber(row['Mins_Per_90_Playing.Time']),
        parseInteger(row.Starts_Starts),
        parseNumber(row.Mn_per_Start_Starts),
        parseInteger(row.Compl_Starts),
        parseInteger(row.Subs_Subs),
        parseNumber(row.Mn_per_Sub_Subs),
        parseInteger(row.unSub_Subs),
        parseNumber(row.PPM_Team_Success),
        parseInteger(row['onG_Team.Success']),
        parseInteger(row['onGA_Team.Success']),
        parseInteger(row['plus_per__minus__Team.Success']),
        parseNumber(row['plus_per__minus_90_Team.Success']),
        parseNumber(row['On_minus_Off_Team.Success']),
        parseNumber(row['onxG_Team.Success..xG.']),
        parseNumber(row['onxGA_Team.Success..xG']),
        parseNumber(row['xGplus_per__minus__Team.Success..xG']),
        parseNumber(row['xGplus_per__minus_90_Team.Success..xG']),
        parseNumber(row['On_minus_Off_Team.Success..xG']),
      ]
    );
    processed++;
    if (processed % 500 === 0) console.log(`  ✓ Processed ${processed}/${playerData.length} player playing time records`);
  }
  console.log(`✅ ${processed} player playing time records imported\n`);
}

async function ingestTeamPlayingTime() {
  console.log('📊 Processing team playing time stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const teamData = await parseCSV<TeamPlayingTimeRow>(path.join(dataDir, 'big5', 'team', 'big5_team_playing_time.csv'));
  
  if (teamData.length === 0) {
    console.log('⚠️  No team playing time data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of teamData) {
    const teamResult = await pool.query('SELECT id FROM teams WHERE fbref_url = $1', [row.Url]);
    if (teamResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM team_season_stats WHERE team_id = $1 AND season_end_year = $2 AND competition = $3 AND team_or_opponent = $4 LIMIT 1`,
      [teamResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp, row.Team_or_Opponent]
    );
    if (statResult.rows.length === 0) continue;

    await pool.query(
      `INSERT INTO team_playing_time_stats (
        team_season_stat_id,
        matches_played, minutes, minutes_per_match, minutes_pct, minutes_per_90,
        starts, minutes_per_start, complete_matches,
        subs, minutes_per_sub, unused_sub,
        points_per_match, on_goals_for, on_goals_against, plus_minus, plus_minus_per_90,
        on_xg, on_xga, xg_plus_minus, xg_plus_minus_per_90
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (team_season_stat_id) DO NOTHING`,
      [
        statResult.rows[0].id,
        parseInteger(row['MP_Playing.Time']),
        parseInteger(row['Min_Playing.Time']),
        parseNumber(row['Mn_per_MP_Playing.Time']),
        parseNumber(row['Min_percent_Playing.Time']),
        parseNumber(row['Mins_Per_90_Playing.Time']),
        parseInteger(row.Starts_Starts),
        parseNumber(row.Mn_per_Start_Starts),
        parseInteger(row.Compl_Starts),
        parseInteger(row.Subs_Subs),
        parseNumber(row.Mn_per_Sub_Subs),
        parseInteger(row.unSub_Subs),
        parseNumber(row['PPM_Team.Success']),
        parseInteger(row['onG_Team.Success']),
        parseInteger(row['onGA_Team.Success']),
        parseInteger(row['plus_per__minus__Team.Success']),
        parseNumber(row['plus_per__minus_90_Team.Success']),
        parseNumber(row['onxG_Team.Success..xG.']),
        parseNumber(row['onxGA_Team.Success..xG']),
        parseNumber(row['xGplus_per__minus__Team.Success..xG']),
        parseNumber(row['xGplus_per__minus_90_Team.Success..xG']),
      ]
    );
    processed++;
    if (processed % 100 === 0) console.log(`  ✓ Processed ${processed}/${teamData.length} team playing time records`);
  }
  console.log(`✅ ${processed} team playing time records imported\n`);
}

// ======================================
// 4. MISC STATS
// ======================================

interface PlayerMiscRow {
  Season_End_Year: string;
  Comp: string;
  Player: string;
  CrdY: string;
  CrdR: string;
  '2CrdY': string;
  Fls: string;
  Fld: string;
  Off: string;
  Crs: string;
  Int: string;
  TklW: string;
  PKwon: string;
  PKcon: string;
  OG: string;
  Recov: string;
  Won_Aerial: string;
  Lost_Aerial: string;
  Won_percent_Aerial: string;
  Url: string;
}

interface TeamMiscRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  CrdY: string;
  CrdR: string;
  '2CrdY': string;
  Fls: string;
  Fld: string;
  Off: string;
  Crs: string;
  Int: string;
  TklW: string;
  PKwon: string;
  PKcon: string;
  OG: string;
  Recov: string;
  Won_Aerial: string;
  Lost_Aerial: string;
  Won_percent_Aerial: string;
  Url: string;
}

async function ingestPlayerMisc() {
  console.log('📊 Processing player misc stats...');
  const dataDir = path.join(process.cwd(), 'data');
  const playerData = await parseCSV<PlayerMiscRow>(path.join(dataDir, 'big5', 'player', 'big5_player_misc.csv'));
  
  if (playerData.length === 0) {
    console.log('⚠️  No misc data found, skipping...\n');
    return;
  }

  let processed = 0;
  for (const row of playerData) {
    const playerResult = await pool.query('SELECT id FROM players WHERE fbref_url = $1', [row.Url]);
    if (playerResult.rows.length === 0) continue;

    const statResult = await pool.query(
      `SELECT id FROM player_season_stats WHERE player_id = $1
      AND season_end_year = $2 AND competition = $3 LIMIT 1`,
[playerResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp]
);
if (statResult.rows.length === 0) continue;
await pool.query(
  `INSERT INTO player_misc_stats (
    player_season_stat_id,
    yellow_cards, red_cards, second_yellow,
    fouls_committed, fouls_drawn,
    offsides, crosses, interceptions, tackles_won,
    penalty_kicks_won, penalty_kicks_conceded, own_goals,
    ball_recoveries, aerials_won, aerials_lost, aerials_won_pct
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  ON CONFLICT (player_season_stat_id) DO NOTHING`,
  [
    statResult.rows[0].id,
    parseInteger(row.CrdY),
    parseInteger(row.CrdR),
    parseInteger(row['2CrdY']),
    parseInteger(row.Fls),
    parseInteger(row.Fld),
    parseInteger(row.Off),
    parseInteger(row.Crs),
    parseInteger(row.Int),
    parseInteger(row.TklW),
    parseInteger(row.PKwon),
    parseInteger(row.PKcon),
    parseInteger(row.OG),
    parseInteger(row.Recov),
    parseInteger(row.Won_Aerial),
    parseInteger(row.Lost_Aerial),
    parseNumber(row.Won_percent_Aerial),
  ]
);
processed++;
if (processed % 500 === 0) console.log(`  ✓ Processed ${processed}/${playerData.length} player misc records`);
}
console.log(`✅ ${processed} player misc records imported\n`);
}

async function ingestTeamMisc() {
console.log('📊 Processing team misc stats...');
const dataDir = path.join(process.cwd(), 'data');
const teamData = await parseCSV<TeamMiscRow>(path.join(dataDir, 'big5', 'team', 'big5_team_misc.csv'));
if (teamData.length === 0) {
console.log('⚠️  No team misc data found, skipping...\n');
return;
}
let processed = 0;
for (const row of teamData) {
const teamResult = await pool.query('SELECT id FROM teams WHERE fbref_url = $1', [row.Url]);
if (teamResult.rows.length === 0) continue;
const statResult = await pool.query(
  `SELECT id FROM team_season_stats WHERE team_id = $1 AND season_end_year = $2 AND competition = $3 AND team_or_opponent = $4 LIMIT 1`,
  [teamResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp, row.Team_or_Opponent]
);
if (statResult.rows.length === 0) continue;

await pool.query(
  `INSERT INTO team_misc_stats (
    team_season_stat_id,
    yellow_cards, red_cards, second_yellow,
    fouls_committed, fouls_drawn,
    offsides, crosses, interceptions, tackles_won,
    penalty_kicks_won, penalty_kicks_conceded, own_goals,
    ball_recoveries, aerials_won, aerials_lost, aerials_won_pct
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  ON CONFLICT (team_season_stat_id) DO NOTHING`,
  [
    statResult.rows[0].id,
    parseInteger(row.CrdY),
    parseInteger(row.CrdR),
    parseInteger(row['2CrdY']),
    parseInteger(row.Fls),
    parseInteger(row.Fld),
    parseInteger(row.Off),
    parseInteger(row.Crs),
    parseInteger(row.Int),
    parseInteger(row.TklW),
    parseInteger(row.PKwon),
    parseInteger(row.PKcon),
    parseInteger(row.OG),
    parseInteger(row.Recov),
    parseInteger(row.Won_Aerial),
    parseInteger(row.Lost_Aerial),
    parseNumber(row.Won_percent_Aerial),
  ]
);
processed++;
if (processed % 100 === 0) console.log(`  ✓ Processed ${processed}/${teamData.length} team misc records`);
}
console.log(`✅ ${processed} team misc records imported\n`);
}
// ======================================
// 5. GOALKEEPER STATS
// ======================================
interface PlayerKeeperRow {
Season_End_Year: string;
Comp: string;
Player: string;
MP_Playing: string;
Starts_Playing: string;
Min_Playing: string;
Mins_Per_90: string;
GA: string;
GA90: string;
SoTA: string;
Saves: string;
Save_percent: string;
W: string;
D: string;
L: string;
CS: string;
CS_percent: string;
PKatt_Penalty: string;
PKA_Penalty: string;
PKsv_Penalty: string;
PKm_Penalty: string;
Save_percent_Penalty: string;
Url: string;
}
interface TeamKeeperRow {
Season_End_Year: string;
Squad: string;
Comp: string;
Team_or_Opponent: string;
MP_Playing: string;
Starts_Playing: string;
Min_Playing: string;
Mins_Per_90: string;
GA: string;
GA90: string;
SoTA: string;
Saves: string;
Save_percent: string;
W: string;
D: string;
L: string;
CS: string;
CS_percent: string;
PKatt_Penalty: string;
PKA_Penalty: string;
PKsv_Penalty: string;
PKm_Penalty: string;
Save_percent_Penalty: string;
Url: string;
}
async function ingestPlayerKeeper() {
console.log('📊 Processing player keeper stats...');
const dataDir = path.join(process.cwd(), 'data');
const playerData = await parseCSV<PlayerKeeperRow>(path.join(dataDir, 'big5', 'player', 'big5_player_keepers.csv'));
if (playerData.length === 0) {
console.log('⚠️  No keeper data found, skipping...\n');
return;
}
let processed = 0;
for (const row of playerData) {
const playerResult = await pool.query('SELECT id FROM players WHERE fbref_url = $1', [row.Url]);
if (playerResult.rows.length === 0) continue;
const statResult = await pool.query(
  `SELECT id FROM player_season_stats WHERE player_id = $1 AND season_end_year = $2 AND competition = $3 LIMIT 1`,
  [playerResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp]
);
if (statResult.rows.length === 0) continue;

await pool.query(
  `INSERT INTO player_keeper_stats (
    player_season_stat_id,
    matches_played, starts, minutes, minutes_per_90,
    goals_against, goals_against_per_90, shots_on_target_against, saves, save_pct,
    wins, draws, losses, clean_sheets, clean_sheet_pct,
    penalty_kicks_attempted, penalty_kicks_allowed, penalty_kicks_saved, penalty_kicks_missed, penalty_save_pct
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
  ON CONFLICT (player_season_stat_id) DO NOTHING`,
  [
    statResult.rows[0].id,
    parseInteger(row.MP_Playing),
    parseInteger(row.Starts_Playing),
    parseInteger(row.Min_Playing),
    parseNumber(row.Mins_Per_90),
    parseInteger(row.GA),
    parseNumber(row.GA90),
    parseInteger(row.SoTA),
    parseInteger(row.Saves),
    parseNumber(row.Save_percent),
    parseInteger(row.W),
    parseInteger(row.D),
    parseInteger(row.L),
    parseInteger(row.CS),
    parseNumber(row.CS_percent),
    parseInteger(row.PKatt_Penalty),
    parseInteger(row.PKA_Penalty),
    parseInteger(row.PKsv_Penalty),
    parseInteger(row.PKm_Penalty),
    parseNumber(row.Save_percent_Penalty),
  ]
);
processed++;
if (processed % 500 === 0) console.log(`  ✓ Processed ${processed}/${playerData.length} player keeper records`);
}
console.log(`✅ ${processed} player keeper records imported\n`);
}
async function ingestTeamKeeper() {
console.log('📊 Processing team keeper stats...');
const dataDir = path.join(process.cwd(), 'data');
const teamData = await parseCSV<TeamKeeperRow>(path.join(dataDir, 'big5', 'team', 'big5_team_keepers.csv'));
if (teamData.length === 0) {
console.log('⚠️  No team keeper data found, skipping...\n');
return;
}
let processed = 0;
for (const row of teamData) {
const teamResult = await pool.query('SELECT id FROM teams WHERE fbref_url = $1', [row.Url]);
if (teamResult.rows.length === 0) continue;
const statResult = await pool.query(
  `SELECT id FROM team_season_stats WHERE team_id = $1 AND season_end_year = $2 AND competition = $3 AND team_or_opponent = $4 LIMIT 1`,
  [teamResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp, row.Team_or_Opponent]
);
if (statResult.rows.length === 0) continue;

await pool.query(
  `INSERT INTO team_keeper_stats (
    team_season_stat_id,
    matches_played, starts, minutes, minutes_per_90,
    goals_against, goals_against_per_90, shots_on_target_against, saves, save_pct,
    wins, draws, losses, clean_sheets, clean_sheet_pct,
    penalty_kicks_attempted, penalty_kicks_allowed, penalty_kicks_saved, penalty_kicks_missed, penalty_save_pct
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
  ON CONFLICT (team_season_stat_id) DO NOTHING`,
  [
    statResult.rows[0].id,
    parseInteger(row.MP_Playing),
    parseInteger(row.Starts_Playing),
    parseInteger(row.Min_Playing),
    parseNumber(row.Mins_Per_90),
    parseInteger(row.GA),
    parseNumber(row.GA90),
    parseInteger(row.SoTA),
    parseInteger(row.Saves),
    parseNumber(row.Save_percent),
    parseInteger(row.W),
    parseInteger(row.D),
    parseInteger(row.L),
    parseInteger(row.CS),
    parseNumber(row.CS_percent),
    parseInteger(row.PKatt_Penalty),
    parseInteger(row.PKA_Penalty),
    parseInteger(row.PKsv_Penalty),
    parseInteger(row.PKm_Penalty),
    parseNumber(row.Save_percent_Penalty),
  ]
);
processed++;
if (processed % 100 === 0) console.log(`  ✓ Processed ${processed}/${teamData.length} team keeper records`);
}
console.log(`✅ ${processed} team keeper records imported\n`);
}
// ======================================
// 6. GOALKEEPER ADVANCED STATS
// ======================================
interface PlayerKeeperAdvancedRow {
Season_End_Year: string;
Comp: string;
Player: string;
GA_Goals: string;
PKA_Goals: string;
FK_Goals: string;
CK_Goals: string;
OG_Goals: string;
PSxG_Expected: string;
PSxG_per_SoT_Expected: string;
'PSxG+_per__minus__Expected': string;
_per_90_Expected: string;
Cmp_Launched: string;
Att_Launched: string;
Cmp_percent_Launched: string;
'Att (GK)_Passes': string;
Thr_Passes: string;
Launch_percent_Passes: string;
AvgLen_Passes: string;
Att_Goal: string;
Launch_percent_Goal: string;
AvgLen_Goal: string;
Opp_Crosses: string;
Stp_Crosses: string;
Stp_percent_Crosses: string;
'#OPA_Sweeper': string;
'#OPA_per_90_Sweeper': string;
AvgDist_Sweeper: string;
Url: string;
}
interface TeamKeeperAdvancedRow {
Season_End_Year: string;
Squad: string;
Comp: string;
Team_or_Opponent: string;
GA_Goals: string;
PKA_Goals: string;
FK_Goals: string;
CK_Goals: string;
OG_Goals: string;
PSxG_Expected: string;
PSxG_per_SoT_Expected: string;
'PSxG+_per__minus__Expected': string;
_per_90_Expected: string;
Cmp_Launched: string;
Att_Launched: string;
Cmp_percent_Launched: string;
'Att (GK)_Passes': string;
Thr_Passes: string;
Launch_percent_Passes: string;
AvgLen_Passes: string;
Att_Goal: string;
Launch_percent_Goal: string;
AvgLen_Goal: string;
Opp_Crosses: string;
Stp_Crosses: string;
Stp_percent_Crosses: string;
'#OPA_Sweeper': string;
'#OPA_per_90_Sweeper': string;
AvgDist_Sweeper: string;
Url: string;
}
async function ingestPlayerKeeperAdvanced() {
console.log('📊 Processing player keeper advanced stats...');
const dataDir = path.join(process.cwd(), 'data');
const playerData = await parseCSV<PlayerKeeperAdvancedRow>(path.join(dataDir, 'big5', 'player', 'big5_player_keepers_adv.csv'));
if (playerData.length === 0) {
console.log('⚠️  No keeper advanced data found, skipping...\n');
return;
}
let processed = 0;
for (const row of playerData) {
const playerResult = await pool.query('SELECT id FROM players WHERE fbref_url = $1', [row.Url]);
if (playerResult.rows.length === 0) continue;
const statResult = await pool.query(
  `SELECT id FROM player_season_stats WHERE player_id = $1 AND season_end_year = $2 AND competition = $3 LIMIT 1`,
  [playerResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp]
);
if (statResult.rows.length === 0) continue;

await pool.query(
  `INSERT INTO player_keeper_advanced_stats (
    player_season_stat_id,
    goals_against, penalty_kicks_allowed, free_kicks_against, corner_kicks_against, own_goals_against,
    psxg, psxg_per_shot_on_target, psxg_plus_minus, psxg_plus_minus_per_90,
    passes_completed_launched, passes_attempted_launched, passes_pct_launched,
    passes_attempted_gk, passes_throws, pct_passes_launched, avg_pass_length,
    goal_kicks_attempted, pct_goal_kicks_launched, avg_goal_kick_length,
    crosses_faced, crosses_stopped, crosses_stopped_pct,
    def_actions_outside_pen_area, def_actions_outside_pen_area_per_90, avg_distance_def_actions
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
  ON CONFLICT (player_season_stat_id) DO NOTHING`,
  [
    statResult.rows[0].id,
    parseInteger(row.GA_Goals),
    parseInteger(row.PKA_Goals),
    parseInteger(row.FK_Goals),
    parseInteger(row.CK_Goals),
    parseInteger(row.OG_Goals),
    parseNumber(row.PSxG_Expected),
    parseNumber(row.PSxG_per_SoT_Expected),
    parseNumber(row['PSxG+_per__minus__Expected']),
    parseNumber(row._per_90_Expected),
    parseInteger(row.Cmp_Launched),
    parseInteger(row.Att_Launched),
    parseNumber(row.Cmp_percent_Launched),
    parseInteger(row['Att (GK)_Passes']),
    parseInteger(row.Thr_Passes),
    parseNumber(row.Launch_percent_Passes),
    parseNumber(row.AvgLen_Passes),
    parseInteger(row.Att_Goal),
    parseNumber(row.Launch_percent_Goal),
    parseNumber(row.AvgLen_Goal),
    parseInteger(row.Opp_Crosses),
    parseInteger(row.Stp_Crosses),
    parseNumber(row.Stp_percent_Crosses),
    parseInteger(row['#OPA_Sweeper']),
    parseNumber(row['#OPA_per_90_Sweeper']),
    parseNumber(row.AvgDist_Sweeper),
  ]
);
processed++;
if (processed % 500 === 0) console.log(`  ✓ Processed ${processed}/${playerData.length} player keeper advanced records`);
}
console.log(`✅ ${processed} player keeper advanced records imported\n`);
}
async function ingestTeamKeeperAdvanced() {
console.log('📊 Processing team keeper advanced stats...');
const dataDir = path.join(process.cwd(), 'data');
const teamData = await parseCSV<TeamKeeperAdvancedRow>(path.join(dataDir, 'big5', 'team', 'big5_team_keepers_adv.csv'));
if (teamData.length === 0) {
console.log('⚠️  No team keeper advanced data found, skipping...\n');
return;
}
let processed = 0;
for (const row of teamData) {
const teamResult = await pool.query('SELECT id FROM teams WHERE fbref_url = $1', [row.Url]);
if (teamResult.rows.length === 0) continue;
const statResult = await pool.query(
  `SELECT id FROM team_season_stats WHERE team_id = $1 AND season_end_year = $2 AND competition = $3 AND team_or_opponent = $4 LIMIT 1`,
  [teamResult.rows[0].id, parseInteger(row.Season_End_Year), row.Comp, row.Team_or_Opponent]
);
if (statResult.rows.length === 0) continue;

await pool.query(
  `INSERT INTO team_keeper_advanced_stats (
    team_season_stat_id,
    goals_against, penalty_kicks_allowed, free_kicks_against, corner_kicks_against, own_goals_against,
    psxg, psxg_per_shot_on_target, psxg_plus_minus, psxg_plus_minus_per_90,
    passes_completed_launched, passes_attempted_launched, passes_pct_launched,
    passes_attempted_gk, passes_throws, pct_passes_launched, avg_pass_length,
    goal_kicks_attempted, pct_goal_kicks_launched, avg_goal_kick_length,
    crosses_faced, crosses_stopped, crosses_stopped_pct,
    def_actions_outside_pen_area, def_actions_outside_pen_area_per_90, avg_distance_def_actions
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
  ON CONFLICT (team_season_stat_id) DO NOTHING`,
  [
    statResult.rows[0].id,
    parseInteger(row.GA_Goals),
    parseInteger(row.PKA_Goals),
    parseInteger(row.FK_Goals),
    parseInteger(row.CK_Goals),
    parseInteger(row.OG_Goals),
    parseNumber(row.PSxG_Expected),
    parseNumber(row.PSxG_per_SoT_Expected),
    parseNumber(row['PSxG+_per__minus__Expected']),
    parseNumber(row._per_90_Expected),
    parseInteger(row.Cmp_Launched),
    parseInteger(row.Att_Launched),
    parseNumber(row.Cmp_percent_Launched),
    parseInteger(row['Att (GK)_Passes']),
    parseInteger(row.Thr_Passes),
    parseNumber(row.Launch_percent_Passes),
    parseNumber(row.AvgLen_Passes),
    parseInteger(row.Att_Goal),
    parseNumber(row.Launch_percent_Goal),
    parseNumber(row.AvgLen_Goal),
    parseInteger(row.Opp_Crosses),
    parseInteger(row.Stp_Crosses),
    parseNumber(row.Stp_percent_Crosses),
    parseInteger(row['#OPA_Sweeper']),
    parseNumber(row['#OPA_per_90_Sweeper']),
    parseNumber(row.AvgDist_Sweeper),
  ]
);
processed++;
if (processed % 100 === 0) console.log(`  ✓ Processed ${processed}/${teamData.length} team keeper advanced records`);
}
console.log(`✅ ${processed} team keeper advanced records imported\n`);
}
// ======================================
// MAIN EXECUTION
// ======================================
async function main() {
try {
console.log('🚀 Starting all remaining stats ingestion...\n');
console.log('═══════════════════════════════════════════════════════════\n');

await ingestPlayerGCA();
await ingestTeamGCA();

await ingestPlayerPossession();
await ingestTeamPossession();

await ingestPlayerPlayingTime();
await ingestTeamPlayingTime();

await ingestPlayerMisc();
await ingestTeamMisc();

await ingestPlayerKeeper();
await ingestTeamKeeper();

await ingestPlayerKeeperAdvanced();
await ingestTeamKeeperAdvanced();

// Final summary
console.log('═══════════════════════════════════════════════════════════');
console.log('📈 Final Import Summary');
console.log('═══════════════════════════════════════════════════════════');

const counts = await Promise.all([
  pool.query('SELECT COUNT(*) FROM player_gca_stats'),
  pool.query('SELECT COUNT(*) FROM team_gca_stats'),
  pool.query('SELECT COUNT(*) FROM player_possession_stats'),
  pool.query('SELECT COUNT(*) FROM team_possession_stats'),
  pool.query('SELECT COUNT(*) FROM player_playing_time_stats'),
  pool.query('SELECT COUNT(*) FROM team_playing_time_stats'),
  pool.query('SELECT COUNT(*) FROM player_misc_stats'),
  pool.query('SELECT COUNT(*) FROM team_misc_stats'),
  pool.query('SELECT COUNT(*) FROM player_keeper_stats'),
  pool.query('SELECT COUNT(*) FROM team_keeper_stats'),
  pool.query('SELECT COUNT(*) FROM player_keeper_advanced_stats'),
  pool.query('SELECT COUNT(*) FROM team_keeper_advanced_stats'),
]);

console.log(`   Player GCA: ${counts[0].rows[0].count}`);
console.log(`   Team GCA: ${counts[1].rows[0].count}`);
console.log(`   Player Possession: ${counts[2].rows[0].count}`);
console.log(`   Team Possession: ${counts[3].rows[0].count}`);
console.log(`   Player Playing Time: ${counts[4].rows[0].count}`);
console.log(`   Team Playing Time: ${counts[5].rows[0].count}`);
console.log(`   Player Misc: ${counts[6].rows[0].count}`);
console.log(`   Team Misc: ${counts[7].rows[0].count}`);
console.log(`   Player Keeper: ${counts[8].rows[0].count}`);
console.log(`   Team Keeper: ${counts[9].rows[0].count}`);
console.log(`   Player Keeper Advanced: ${counts[10].rows[0].count}`);
console.log(`   Team Keeper Advanced: ${counts[11].rows[0].count}`);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✅ All remaining stats ingestion complete!\n');

await pool.end();
process.exit(0);
} catch (error) {
console.error('❌ Error during ingestion:', error);
await pool.end();
process.exit(1);
}
}
main();