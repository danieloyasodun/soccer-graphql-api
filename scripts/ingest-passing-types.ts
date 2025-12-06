import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pool from '../src/db/postgres';

// -----------------------------------------------------------
// CSV Row Interfaces
// -----------------------------------------------------------

interface PlayerPassingTypeRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Player: string;
  Nation: string;
  Pos: string;
  Age: string;
  Born: string;
  Mins_Per_90: string;
  Att: string;
  Live_Pass: string;
  Dead_Pass: string;
  FK_Pass: string;
  TB_Pass: string;
  Sw_Pass: string;
  Crs_Pass: string;
  TI_Pass: string;
  CK_Pass: string;
  In_Corner: string;
  Out_Corner: string;
  Str_Corner: string;
  Cmp_Outcomes: string;
  Off_Outcomes: string;
  Blocks_Outcomes: string;
  Url: string;
}

interface TeamPassingTypeRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  Num_Players: string;
  Mins_Per_90: string;
  Att: string;
  Live_Pass: string;
  Dead_Pass: string;
  FK_Pass: string;
  TB_Pass: string;
  Sw_Pass: string;
  Crs_Pass: string;
  TI_Pass: string;
  CK_Pass: string;
  In_Corner: string;
  Out_Corner: string;
  Str_Corner: string;
  Cmp_Outcomes: string;
  Off_Outcomes: string;
  Blocks_Outcomes: string;
  Url: string;
}

// -----------------------------------------------------------
// Utility: CSV Parsing
// -----------------------------------------------------------

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

// -----------------------------------------------------------
// Utility: Numeric Sanitizers
// -----------------------------------------------------------

function toInt(v: string | undefined): number | null {
  if (!v || v.trim() === '' || v === 'NA') return null;
  const parsed = parseInt(v, 10);
  return isNaN(parsed) ? null : parsed;
}

function toFloat(v: string | undefined): number | null {
  if (!v || v.trim() === '' || v === 'NA') return null;
  const parsed = parseFloat(v);
  return isNaN(parsed) ? null : parsed;
}

// Convert empty string fields into null
function sanitizeRow(row: any) {
  for (const key of Object.keys(row)) {
    if (row[key] === '') row[key] = null;
  }
  return row;
}

function parseInteger(value: string | undefined): number {
  if (!value || value === '' || value === 'NA') return 0;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

// -----------------------------------------------------------
// Insert Player Passing Type Row
// -----------------------------------------------------------

async function insertPlayer(row: PlayerPassingTypeRow) {
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
    `
    INSERT INTO player_passing_type_stats (
      player_season_stat_id, att, live_pass, dead_pass,
      fk_pass, tb_pass, sw_pass, crs_pass, ti_pass, ck_pass,
      in_corner, out_corner, str_corner,
      cmp_outcomes, off_outcomes, blocks_outcomes, url
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
    )
    `,
    [
      playerSeasonStatId,
      toInt(row.Att),
      toInt(row.Live_Pass),
      toInt(row.Dead_Pass),
      toInt(row.FK_Pass),
      toInt(row.TB_Pass),
      toInt(row.Sw_Pass),
      toInt(row.Crs_Pass),
      toInt(row.TI_Pass),
      toInt(row.CK_Pass),
      toInt(row.In_Corner),
      toInt(row.Out_Corner),
      toInt(row.Str_Corner),
      toInt(row.Cmp_Outcomes),
      toInt(row.Off_Outcomes),
      toInt(row.Blocks_Outcomes),
      row.Url
    ]
  );
}

// -----------------------------------------------------------
// Insert Team Passing Type Row (with FK)
// -----------------------------------------------------------
async function insertTeam(row: TeamPassingTypeRow, rowIndex: number) {
  // Step 1: Find the general team_id from the teams table
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
  // If your CSV doesn't have Team_or_Opponent, we can use rowIndex: even rows = opponent
  const teamOrOpponent = row.Team_or_Opponent || (rowIndex % 2 === 0 ? 'opponent' : 'team');

  // Step 3: Find the correct team_season_stats row (serial id)
  const seasonResult = await pool.query(
    `SELECT id FROM team_season_stats
     WHERE team_id = $1
       AND season_end_year = $2
       AND competition = $3
       AND team_or_opponent = $4`,
    [teamId, toInt(row.Season_End_Year), row.Comp, teamOrOpponent]
  );

  if (seasonResult.rows.length === 0) {
    console.warn(`⚠️ No team_season_stats found for ${row.Url} ${row.Season_End_Year} ${row.Comp} (${teamOrOpponent})`);
    return;
  }

  const teamSeasonStatId = seasonResult.rows[0].id;

  // Step 4: Insert passing type stats
  await pool.query(
    `
    INSERT INTO team_passing_type_stats (
      team_season_stat_id, att, live_pass, dead_pass,
      fk_pass, tb_pass, sw_pass, crs_pass, ti_pass, ck_pass,
      in_corner, out_corner, str_corner,
      cmp_outcomes, off_outcomes, blocks_outcomes, url
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
    )
    `,
    [
      teamSeasonStatId,
      toInt(row.Att),
      toInt(row.Live_Pass),
      toInt(row.Dead_Pass),
      toInt(row.FK_Pass),
      toInt(row.TB_Pass),
      toInt(row.Sw_Pass),
      toInt(row.Crs_Pass),
      toInt(row.TI_Pass),
      toInt(row.CK_Pass),
      toInt(row.In_Corner),
      toInt(row.Out_Corner),
      toInt(row.Str_Corner),
      toInt(row.Cmp_Outcomes),
      toInt(row.Off_Outcomes),
      toInt(row.Blocks_Outcomes),
      row.Url
    ]
  );
}

// -----------------------------------------------------------
// Main Execution
// -----------------------------------------------------------

async function main() {
  try {
    console.log('🚀 Starting Passing Type ingestion...\n');

    const dataDir = path.join(process.cwd(), 'data', 'big5');

    // PLAYER FILE
    const playerFile = path.join(dataDir, 'player', 'big5_player_passing_types.csv');
    const players = (await parseCSV<PlayerPassingTypeRow>(playerFile)).map(sanitizeRow);

    console.log(`Found ${players.length} player passing type rows`);

    let p = 0;
    for (const row of players) {
      await insertPlayer(row);
      if (++p % 500 === 0) console.log(`  ✓ ${p}/${players.length} players`);
    }

    // TEAM FILE
    const teamFile = path.join(dataDir, 'team', 'big5_team_passing_types.csv');
    const teams = (await parseCSV<TeamPassingTypeRow>(teamFile)).map(sanitizeRow);

    console.log(`Found ${teams.length} team passing type rows`);

    let t = 0;
    for (const [index, row] of teams.entries()) {
      await insertTeam(row, index);
      if (++t % 200 === 0) console.log(`  ✓ ${t}/${teams.length} teams`);
    }

    console.log('\n✅ Passing Type ingestion completed!');
    await pool.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    await pool.end();
    process.exit(1);
  }
}

main();
