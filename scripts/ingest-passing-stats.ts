import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pool from '../src/db/postgres';

interface PlayerPassingRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Player: string;
  Nation: string;
  Pos: string;
  Age: string;
  Born: string;
  Mins_Per_90: string;
  Cmp_Total: string;
  Att_Total: string;
  Cmp_percent_Total: string;
  TotDist_Total: string;
  PrgDist_Total: string;
  Cmp_Short: string;
  Att_Short: string;
  Cmp_percent_Short: string;
  Cmp_Medium: string;
  Att_Medium: string;
  Cmp_percent_Medium: string;
  Cmp_Long: string;
  Att_Long: string;
  Cmp_percent_Long: string;
  Ast: string;
  xAG: string;
  xA_Expected: string;
  A_minus_xAG_Expected: string;
  KP: string;
  Final_Third: string;
  PPA: string;
  CrsPA: string;
  PrgP: string;
  Url: string;
}

interface TeamPassingRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  Num_Players: string;
  Mins_Per_90: string;
  Cmp_Total: string;
  Att_Total: string;
  Cmp_percent_Total: string;
  TotDist_Total: string;
  PrgDist_Total: string;
  Cmp_Short: string;
  Att_Short: string;
  Cmp_percent_Short: string;
  Cmp_Medium: string;
  Att_Medium: string;
  Cmp_percent_Medium: string;
  Cmp_Long: string;
  Att_Long: string;
  Cmp_percent_Long: string;
  Ast: string;
  xAG: string;
  xA_Expected: string;
  A_minus_xAG_Expected: string;
  KP: string;
  Final_Third: string;
  PPA: string;
  CrsPA: string;
  PrgP: string;
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

async function insertPlayerPassingStats(row: PlayerPassingRow) {
  const playerResult = await pool.query(
    'SELECT id FROM players WHERE fbref_url = $1',
    [row.Url]
  );

  if (playerResult.rows.length === 0) return;

  const playerId = playerResult.rows[0].id;

  const statResult = await pool.query(
    `SELECT id FROM player_season_stats 
     WHERE player_id = $1 
     AND season_end_year = $2 
     AND competition = $3
     LIMIT 1`,
    [playerId, parseInteger(row.Season_End_Year), row.Comp]
  );

  if (statResult.rows.length === 0) return;

  const playerSeasonStatId = statResult.rows[0].id;

  await pool.query(
    `INSERT INTO player_passing_stats (
      player_season_stat_id,
      completed_total, attempted_total, completion_pct_total,
      total_distance, progressive_distance,
      completed_short, attempted_short, completion_pct_short,
      completed_medium, attempted_medium, completion_pct_medium,
      completed_long, attempted_long, completion_pct_long,
      assists, xag, xa_expected, assists_minus_xag,
      key_passes, passes_into_final_third, passes_into_penalty_area,
      crosses_into_penalty_area, progressive_passes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    ON CONFLICT (player_season_stat_id) DO NOTHING`,
    [
      playerSeasonStatId,
      parseInteger(row.Cmp_Total),
      parseInteger(row.Att_Total),
      parseNumber(row.Cmp_percent_Total),
      parseInteger(row.TotDist_Total),
      parseInteger(row.PrgDist_Total),
      parseInteger(row.Cmp_Short),
      parseInteger(row.Att_Short),
      parseNumber(row.Cmp_percent_Short),
      parseInteger(row.Cmp_Medium),
      parseInteger(row.Att_Medium),
      parseNumber(row.Cmp_percent_Medium),
      parseInteger(row.Cmp_Long),
      parseInteger(row.Att_Long),
      parseNumber(row.Cmp_percent_Long),
      parseInteger(row.Ast),
      parseNumber(row.xAG),
      parseNumber(row.xA_Expected),
      parseNumber(row.A_minus_xAG_Expected),
      parseInteger(row.KP),
      parseInteger(row.Final_Third),
      parseInteger(row.PPA),
      parseInteger(row.CrsPA),
      parseInteger(row.PrgP),
    ]
  );
}

async function insertTeamPassingStats(row: TeamPassingRow, rowIndex: number) {
  // Step 1: Get team_id
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

  // Step 3: Find the correct team_season_stats row
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

  // Step 4: Insert passing stats
  await pool.query(
    `INSERT INTO team_passing_stats (
      team_season_stat_id,
      completed_total, attempted_total, completion_pct_total,
      total_distance, progressive_distance,
      completed_short, attempted_short, completion_pct_short,
      completed_medium, attempted_medium, completion_pct_medium,
      completed_long, attempted_long, completion_pct_long,
      assists, xag, xa_expected, assists_minus_xag,
      key_passes, passes_into_final_third, passes_into_penalty_area,
      crosses_into_penalty_area, progressive_passes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
    ON CONFLICT (team_season_stat_id) DO NOTHING`,
    [
      teamSeasonStatId,
      parseInteger(row.Cmp_Total),
      parseInteger(row.Att_Total),
      parseNumber(row.Cmp_percent_Total),
      parseInteger(row.TotDist_Total),
      parseInteger(row.PrgDist_Total),
      parseInteger(row.Cmp_Short),
      parseInteger(row.Att_Short),
      parseNumber(row.Cmp_percent_Short),
      parseInteger(row.Cmp_Medium),
      parseInteger(row.Att_Medium),
      parseNumber(row.Cmp_percent_Medium),
      parseInteger(row.Cmp_Long),
      parseInteger(row.Att_Long),
      parseNumber(row.Cmp_percent_Long),
      parseInteger(row.Ast),
      parseNumber(row.xAG),
      parseNumber(row.xA_Expected),
      parseNumber(row.A_minus_xAG_Expected),
      parseInteger(row.KP),
      parseInteger(row.Final_Third),
      parseInteger(row.PPA),
      parseInteger(row.CrsPA),
      parseInteger(row.PrgP),
    ]
  );
}

async function main() {
  try {
    console.log('🚀 Starting passing stats ingestion...\n');

    const dataDir = path.join(process.cwd(), 'data');

    // Process player passing stats
    console.log('📊 Processing player passing stats...');
    const playerFile = path.join(dataDir, 'big5', 'player', 'big5_player_passing.csv');
    
    const playerData = await parseCSV<PlayerPassingRow>(playerFile);
    console.log(`Found ${playerData.length} player passing records\n`);

    let processedPlayers = 0;
    for (const row of playerData) {
      await insertPlayerPassingStats(row);
      processedPlayers++;
      
      if (processedPlayers % 500 === 0) {
        console.log(`  ✓ Processed ${processedPlayers}/${playerData.length} player records`);
      }
    }
    console.log(`✅ All ${processedPlayers} player passing records imported\n`);

    // Process team passing stats
    console.log('📊 Processing team passing stats...');
    const teamFile = path.join(dataDir, 'big5', 'team', 'big5_team_passing.csv');
    
    const teamData = await parseCSV<TeamPassingRow>(teamFile);
    console.log(`Found ${teamData.length} team passing records\n`);

    let processedTeams = 0;
    for (let t = 0; t < teamData.length; t++) {
      await insertTeamPassingStats(teamData[t], t);
    }
    console.log(`✅ All ${processedTeams} team passing records imported\n`);

    // Summary
    const playerPassingCount = await pool.query('SELECT COUNT(*) FROM player_passing_stats');
    const teamPassingCount = await pool.query('SELECT COUNT(*) FROM team_passing_stats');

    console.log('═══════════════════════════════════════');
    console.log('📈 Passing Stats Import Summary');
    console.log('═══════════════════════════════════════');
    console.log(`   Player Passing Records: ${playerPassingCount.rows[0].count}`);
    console.log(`   Team Passing Records: ${teamPassingCount.rows[0].count}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Passing stats ingestion complete!\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    await pool.end();
    process.exit(1);
  }
}

main();