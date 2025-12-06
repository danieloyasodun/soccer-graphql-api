import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pool from '../src/db/postgres';

interface PlayerShootingRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Player: string;
  Nation: string;
  Pos: string;
  Age: string;
  Born: string;
  Mins_Per_90: string;
  Gls_Standard: string;
  Sh_Standard: string;
  SoT_Standard: string;
  SoT_percent_Standard: string;
  Sh_per_90_Standard: string;
  SoT_per_90_Standard: string;
  G_per_Sh_Standard: string;
  G_per_SoT_Standard: string;
  Dist_Standard: string;
  FK_Standard: string;
  PK_Standard: string;
  PKatt_Standard: string;
  xG_Expected: string;
  npxG_Expected: string;
  npxG_per_Sh_Expected: string;
  G_minus_xG_Expected: string;
  'np:G_minus_xG_Expected': string;
  Url: string;
}

interface TeamShootingRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  Num_Players: string;
  Mins_Per_90: string;
  Gls_Standard: string;
  Sh_Standard: string;
  SoT_Standard: string;
  SoT_percent_Standard: string;
  Sh_per_90_Standard: string;
  SoT_per_90_Standard: string;
  G_per_Sh_Standard: string;
  G_per_SoT_Standard: string;
  Dist_Standard: string;
  FK_Standard: string;
  PK_Standard: string;
  PKatt_Standard: string;
  xG_Expected: string;
  npxG_Expected: string;
  npxG_per_Sh_Expected: string;
  G_minus_xG_Expected: string;
  'np:G_minus_xG_Expected': string;
  Url: string;
}

function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
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

async function insertPlayerShootingStats(row: PlayerShootingRow) {
  // Find the matching player_season_stat_id
  const playerResult = await pool.query(
    'SELECT id FROM players WHERE fbref_url = $1',
    [row.Url]
  );

  if (playerResult.rows.length === 0) {
    return; // Player not found, skip silently
  }

  const playerId = playerResult.rows[0].id;

  const statResult = await pool.query(
    `SELECT id FROM player_season_stats 
     WHERE player_id = $1 
     AND season_end_year = $2 
     AND competition = $3
     LIMIT 1`,
    [playerId, parseInteger(row.Season_End_Year), row.Comp]
  );

  if (statResult.rows.length === 0) {
    return; // Season stats not found, skip
  }

  const playerSeasonStatId = statResult.rows[0].id;

  await pool.query(
    `INSERT INTO player_shooting_stats (
      player_season_stat_id,
      goals_standard, shots_standard, shots_on_target_standard,
      shots_on_target_pct_standard, shots_per_90_standard,
      shots_on_target_per_90_standard, goals_per_shot_standard,
      goals_per_shot_on_target_standard, distance_standard,
      free_kicks_standard, penalties_standard, penalties_attempted_standard,
      xg_expected, npxg_expected, npxg_per_shot_expected,
      goals_minus_xg_expected, np_goals_minus_xg_expected
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    ON CONFLICT (player_season_stat_id) DO NOTHING`,
    [
      playerSeasonStatId,
      parseInteger(row.Gls_Standard),
      parseInteger(row.Sh_Standard),
      parseInteger(row.SoT_Standard),
      parseNumber(row.SoT_percent_Standard),
      parseNumber(row.Sh_per_90_Standard),
      parseNumber(row.SoT_per_90_Standard),
      parseNumber(row.G_per_Sh_Standard),
      parseNumber(row.G_per_SoT_Standard),
      parseNumber(row.Dist_Standard),
      parseInteger(row.FK_Standard),
      parseInteger(row.PK_Standard),
      parseInteger(row.PKatt_Standard),
      parseNumber(row.xG_Expected),
      parseNumber(row.npxG_Expected),
      parseNumber(row.npxG_per_Sh_Expected),
      parseNumber(row.G_minus_xG_Expected),
      parseNumber(row['np:G_minus_xG_Expected']),
    ]
  );
}

async function insertTeamShootingStats(row: TeamShootingRow, rowIndex: number) {
  // Step 1: Find general team_id
  const teamResult = await pool.query(
    'SELECT id FROM teams WHERE fbref_url = $1',
    [row.Url]
  );
  if (teamResult.rows.length === 0) {
    console.warn(`⚠️ Team not found for URL: ${row.Url}`);
    return;
  }
  const teamId = teamResult.rows[0].id;

  // Step 2: Determine team_or_opponent
  const teamOrOpponent = row.Team_or_Opponent || (rowIndex % 2 === 0 ? 'opponent' : 'team');

  // Step 3: Find correct team_season_stats row (serial id)
  const statResult = await pool.query(
    `SELECT id FROM team_season_stats
     WHERE team_id = $1
       AND season_end_year = $2
       AND competition = $3
       AND team_or_opponent = $4`,
    [teamId, parseInteger(row.Season_End_Year), row.Comp, teamOrOpponent]
  );

  if (statResult.rows.length === 0) {
    console.warn(`⚠️ No team_season_stats found for ${row.Url} ${row.Season_End_Year} ${row.Comp} (${teamOrOpponent})`);
    return;
  }

  const teamSeasonStatId = statResult.rows[0].id;

  // Step 4: Insert shooting stats
  await pool.query(
    `INSERT INTO team_shooting_stats (
      team_season_stat_id,
      goals_standard, shots_standard, shots_on_target_standard,
      shots_on_target_pct_standard, shots_per_90_standard,
      shots_on_target_per_90_standard, goals_per_shot_standard,
      goals_per_shot_on_target_standard, distance_standard,
      free_kicks_standard, penalties_standard, penalties_attempted_standard,
      xg_expected, npxg_expected, npxg_per_shot_expected,
      goals_minus_xg_expected, np_goals_minus_xg_expected
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    ON CONFLICT (team_season_stat_id) DO NOTHING`,
    [
      teamSeasonStatId,
      parseInteger(row.Gls_Standard),
      parseInteger(row.Sh_Standard),
      parseInteger(row.SoT_Standard),
      parseNumber(row.SoT_percent_Standard),
      parseNumber(row.Sh_per_90_Standard),
      parseNumber(row.SoT_per_90_Standard),
      parseNumber(row.G_per_Sh_Standard),
      parseNumber(row.G_per_SoT_Standard),
      parseNumber(row.Dist_Standard),
      parseInteger(row.FK_Standard),
      parseInteger(row.PK_Standard),
      parseInteger(row.PKatt_Standard),
      parseNumber(row.xG_Expected),
      parseNumber(row.npxG_Expected),
      parseNumber(row.npxG_per_Sh_Expected),
      parseNumber(row.G_minus_xG_Expected),
      parseNumber(row['np:G_minus_xG_Expected']),
    ]
  );
}

async function main() {
  try {
    console.log('🚀 Starting shooting stats ingestion...\n');

    const dataDir = path.join(process.cwd(), 'data');

    // Process player shooting stats
    console.log('📊 Processing player shooting stats...');
    const playerFile = path.join(dataDir, 'big5', 'player', 'big5_player_shooting.csv');
    
    const playerData = await parseCSV<PlayerShootingRow>(playerFile) || [];
    console.log(`Found ${playerData.length} player shooting records\n`);

    let processedPlayers = 0;
    for (const row of playerData) {
      await insertPlayerShootingStats(row);
      processedPlayers++;
      
      if (processedPlayers % 500 === 0) {
        console.log(`  ✓ Processed ${processedPlayers}/${playerData.length} player records`);
      }
    }
    console.log(`✅ All ${processedPlayers} player shooting records imported\n`);

    // Process team shooting stats
    console.log('📊 Processing team shooting stats...');
    const teamFile = path.join(dataDir, 'big5', 'team', 'big5_team_shooting.csv');

    const teamData = await parseCSV<TeamShootingRow>(teamFile) || [];
    console.log(`Found ${teamData.length} team shooting records\n`);

    let processedTeams = 0;
    for (let t = 0; t < teamData.length; t++) {
      await insertTeamShootingStats(teamData[t], t);
      if ((t + 1) % 100 === 0) console.log(`  ✓ ${t + 1}/${teamData.length} teams`);
    }
    console.log(`✅ All ${processedTeams} team shooting records imported\n`);

    // Summary
    const playerShootingCount = await pool.query('SELECT COUNT(*) FROM player_shooting_stats');
    const teamShootingCount = await pool.query('SELECT COUNT(*) FROM team_shooting_stats');

    console.log('═══════════════════════════════════════');
    console.log('📈 Shooting Stats Import Summary');
    console.log('═══════════════════════════════════════');
    console.log(`   Player Shooting Records: ${playerShootingCount.rows[0].count}`);
    console.log(`   Team Shooting Records: ${teamShootingCount.rows[0].count}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Shooting stats ingestion complete!\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    await pool.end();
    process.exit(1);
  }
}

main();