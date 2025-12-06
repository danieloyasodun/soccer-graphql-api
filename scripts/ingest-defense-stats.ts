import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pool from '../src/db/postgres';

interface PlayerDefenseRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Player: string;
  Nation: string;
  Pos: string;
  Age: string;
  Born: string;
  Mins_Per_90: string;
  Tkl_Tackles: string;
  TklW_Tackles: string;
  'Def 3rd_Tackles': string;
  'Mid 3rd_Tackles': string;
  'Att 3rd_Tackles': string;
  Tkl_Challenges: string;
  Att_Challenges: string;
  Tkl_percent_Challenges: string;
  Lost_Challenges: string;
  Blocks_Blocks: string;
  Sh_Blocks: string;
  Pass_Blocks: string;
  Int: string;
  'Tkl+Int': string;
  Clr: string;
  Err: string;
  Url: string;
}

interface TeamDefenseRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  Num_Players: string;
  Mins_Per_90: string;
  Tkl_Tackles: string;
  TklW_Tackles: string;
  'Def 3rd_Tackles': string;
  'Mid 3rd_Tackles': string;
  'Att 3rd_Tackles': string;
  Tkl_Challenges: string;
  Att_Challenges: string;
  Tkl_percent_Challenges: string;
  Lost_Challenges: string;
  Blocks_Blocks: string;
  Sh_Blocks: string;
  Pass_Blocks: string;
  Int: string;
  'Tkl+Int': string;
  Clr: string;
  Err: string;
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

async function insertPlayerDefenseStats(row: PlayerDefenseRow) {
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
    `INSERT INTO player_defense_stats (
      player_season_stat_id,
      tackles, tackles_won, tackles_def_3rd, tackles_mid_3rd, tackles_att_3rd,
      challenge_tackles, challenges_attempted, challenge_tackles_pct, challenges_lost,
      blocks, shots_blocked, passes_blocked,
      interceptions, tackles_plus_interceptions, clearances, errors
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (player_season_stat_id) DO NOTHING`,
    [
      playerSeasonStatId,
      parseInteger(row.Tkl_Tackles),
      parseInteger(row.TklW_Tackles),
      parseInteger(row['Def 3rd_Tackles']),
      parseInteger(row['Mid 3rd_Tackles']),
      parseInteger(row['Att 3rd_Tackles']),
      parseInteger(row.Tkl_Challenges),
      parseInteger(row.Att_Challenges),
      parseNumber(row.Tkl_percent_Challenges),
      parseInteger(row.Lost_Challenges),
      parseInteger(row.Blocks_Blocks),
      parseInteger(row.Sh_Blocks),
      parseInteger(row.Pass_Blocks),
      parseInteger(row.Int),
      parseInteger(row['Tkl+Int']),
      parseInteger(row.Clr),
      parseInteger(row.Err),
    ]
  );
}

async function insertTeamDefenseStats(row: TeamDefenseRow, rowIndex: number) {
  // Step 1: Get team_id
  const teamResult = await pool.query(
    'SELECT id FROM teams WHERE fbref_url = $1',
    [row.Url]
  );
  if (teamResult.rows.length === 0) return;

  const teamId = teamResult.rows[0].id;

  // Step 2: Determine team_or_opponent
  const teamOrOpponent = row.Team_or_Opponent || (rowIndex % 2 === 0 ? 'opponent' : 'team');

  // Step 3: Find correct team_season_stats row
  const statResult = await pool.query(
    `SELECT id FROM team_season_stats
     WHERE team_id = $1
       AND season_end_year = $2
       AND competition = $3
       AND team_or_opponent = $4`,
    [teamId, parseInteger(row.Season_End_Year), row.Comp, teamOrOpponent]
  );
  if (statResult.rows.length === 0) return;

  const teamSeasonStatId = statResult.rows[0].id;

  // Step 4: Insert defense stats
  await pool.query(
    `INSERT INTO team_defense_stats (
      team_season_stat_id,
      tackles, tackles_won, tackles_def_3rd, tackles_mid_3rd, tackles_att_3rd,
      challenge_tackles, challenges_attempted, challenge_tackles_pct, challenges_lost,
      blocks, shots_blocked, passes_blocked,
      interceptions, tackles_plus_interceptions, clearances, errors
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    ON CONFLICT (team_season_stat_id) DO NOTHING`,
    [
      teamSeasonStatId,
      parseInteger(row.Tkl_Tackles),
      parseInteger(row.TklW_Tackles),
      parseInteger(row['Def 3rd_Tackles']),
      parseInteger(row['Mid 3rd_Tackles']),
      parseInteger(row['Att 3rd_Tackles']),
      parseInteger(row.Tkl_Challenges),
      parseInteger(row.Att_Challenges),
      parseNumber(row.Tkl_percent_Challenges),
      parseInteger(row.Lost_Challenges),
      parseInteger(row.Blocks_Blocks),
      parseInteger(row.Sh_Blocks),
      parseInteger(row.Pass_Blocks),
      parseInteger(row.Int),
      parseInteger(row['Tkl+Int']),
      parseInteger(row.Clr),
      parseInteger(row.Err),
    ]
  );
}

async function main() {
  try {
    console.log('🚀 Starting defense stats ingestion...\n');

    const dataDir = path.join(process.cwd(), 'data');

    // Process player defense stats
    console.log('📊 Processing player defense stats...');
    const playerFile = path.join(dataDir, 'big5', 'player', 'big5_player_defense.csv');
    
    const playerData = await parseCSV<PlayerDefenseRow>(playerFile);
    console.log(`Found ${playerData.length} player defense records\n`);

    let processedPlayers = 0;
    for (const row of playerData) {
      await insertPlayerDefenseStats(row);
      processedPlayers++;
      
      if (processedPlayers % 500 === 0) {
        console.log(`  ✓ Processed ${processedPlayers}/${playerData.length} player records`);
      }
    }
    console.log(`✅ All ${processedPlayers} player defense records imported\n`);

    // Process team defense stats
    console.log('📊 Processing team defense stats...');
    const teamFile = path.join(dataDir, 'big5', 'team', 'big5_team_defense.csv');
    
    const teamData = await parseCSV<TeamDefenseRow>(teamFile);
    console.log(`Found ${teamData.length} team defense records\n`);

    let processedTeams = 0;
    for (let t = 0; t < teamData.length; t++) {
      await insertTeamDefenseStats(teamData[t], t);
    }

    console.log(`✅ All ${processedTeams} team defense records imported\n`);

    // Summary
    const playerDefenseCount = await pool.query('SELECT COUNT(*) FROM player_defense_stats');
    const teamDefenseCount = await pool.query('SELECT COUNT(*) FROM team_defense_stats');

    console.log('═══════════════════════════════════════');
    console.log('📈 Defense Stats Import Summary');
    console.log('═══════════════════════════════════════');
    console.log(`   Player Defense Records: ${playerDefenseCount.rows[0].count}`);
    console.log(`   Team Defense Records: ${teamDefenseCount.rows[0].count}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Defense stats ingestion complete!\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    await pool.end();
    process.exit(1);
  }
}

main();