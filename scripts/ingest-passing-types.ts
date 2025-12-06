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

// -----------------------------------------------------------
// Insert Player Passing Type Row
// -----------------------------------------------------------

async function insertPlayer(row: PlayerPassingTypeRow) {
  await pool.query(
    `
    INSERT INTO player_passing_type_stats (
      season_end_year, squad, comp, player, nation, pos, age, born,
      mins_per_90, att, live_pass, dead_pass, fk_pass, tb_pass, sw_pass,
      crs_pass, ti_pass, ck_pass, in_corner, out_corner, str_corner,
      cmp_outcomes, off_outcomes, blocks_outcomes, url
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,$14,$15,
      $16,$17,$18,$19,$20,$21,
      $22,$23,$24,$25
    )
    `,
    [
      toInt(row.Season_End_Year),
      row.Squad,
      row.Comp,
      row.Player,
      row.Nation,
      row.Pos,
      toInt(row.Age),
      toInt(row.Born),

      toFloat(row.Mins_Per_90),
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
// Insert Team Passing Type Row
// -----------------------------------------------------------

async function insertTeam(row: TeamPassingTypeRow) {
  await pool.query(
    `
    INSERT INTO team_passing_type_stats (
      season_end_year, squad, comp, team_or_opponent, num_players,
      mins_per_90, att, live_pass, dead_pass, fk_pass, tb_pass, sw_pass,
      crs_pass, ti_pass, ck_pass, in_corner, out_corner, str_corner,
      cmp_outcomes, off_outcomes, blocks_outcomes, url
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,$18,
      $19,$20,$21,$22
    )
    `,
    [
      toInt(row.Season_End_Year),
      row.Squad,
      row.Comp,
      row.Team_or_Opponent,
      toInt(row.Num_Players),

      toFloat(row.Mins_Per_90),
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
    for (const row of teams) {
      await insertTeam(row);
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
