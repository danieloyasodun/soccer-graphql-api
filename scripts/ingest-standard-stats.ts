import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pool from '../src/db/postgres';


interface PlayerRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Player: string;
  Nation: string;
  Pos: string;
  Age: string;
  Born: string;
  MP_Playing: string;
  Starts_Playing: string;
  Min_Playing: string;
  Mins_Per_90_Playing: string;
  Gls: string;
  Ast: string;
  'G+A': string;
  G_minus_PK: string;
  PK: string;
  PKatt: string;
  CrdY: string;
  CrdR: string;
  xG_Expected: string;
  npxG_Expected: string;
  xAG_Expected: string;
  'npxG+xAG_Expected': string;
  PrgC_Progression: string;
  PrgP_Progression: string;
  PrgR_Progression: string;
  Gls_Per: string;
  Ast_Per: string;
  'G+A_Per': string;
  G_minus_PK_Per: string;
  'G+A_minus_PK_Per': string;
  xG_Per: string;
  xAG_Per: string;
  'xG+xAG_Per': string;
  npxG_Per: string;
  'npxG+xAG_Per': string;
  Url: string;
}

interface TeamRow {
  Season_End_Year: string;
  Squad: string;
  Comp: string;
  Team_or_Opponent: string;
  Num_Players: string;
  Age: string;
  Poss: string;
  MP_Playing: string;
  Starts_Playing: string;
  Min_Playing: string;
  Mins_Per_90_Playing: string;
  Gls: string;
  Ast: string;
  'G+A': string;
  G_minus_PK: string;
  PK: string;
  PKatt: string;
  CrdY: string;
  CrdR: string;
  xG_Expected: string;
  npxG_Expected: string;
  xAG_Expected: string;
  'npxG+xAG_Expected': string;
  PrgC_Progression: string;
  PrgP_Progression: string;
  Gls_Per: string;
  Ast_Per: string;
  'G+A_Per': string;
  G_minus_PK_Per: string;
  'G+A_minus_PK_Per': string;
  xG_Per: string;
  xAG_Per: string;
  'xG+xAG_Per': string;
  npxG_Per: string;
  'npxG+xAG_Per': string;
  Url: string;
}

// Utility functions
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

// Insert or get team (season-specific)
async function upsertTeam(name: string, url?: string, seasonEndYear?: number): Promise<number> {
  try {
    const result = await pool.query(
      `INSERT INTO teams (name, fbref_url, season_end_year)
       VALUES ($1, $2, $3)
       ON CONFLICT (name, season_end_year) DO UPDATE
       SET fbref_url = EXCLUDED.fbref_url
       RETURNING id`,
      [name, url || null, seasonEndYear || null]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error(`Error upserting team ${name}:`, error);
    throw error;
  }
}

// Insert or get player
async function upsertPlayer(
  name: string,
  nation: string,
  position: string,
  birthYear: number,
  url: string
): Promise<number> {
  try {
    const result = await pool.query(
      `INSERT INTO players (name, nation, position, birth_year, fbref_url) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (fbref_url) DO UPDATE 
       SET name = $1, nation = $2, position = $3, birth_year = $4
       RETURNING id`,
      [name, nation, position, birthYear, url]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error(`Error upserting player ${name}:`, error);
    throw error;
  }
}

async function insertPlayerSeasonStats(row: PlayerRow) {
  // Use season-specific team row
  const teamId = await upsertTeam(row.Squad, undefined, parseInteger(row.Season_End_Year));
  
  const playerId = await upsertPlayer(
    row.Player,
    row.Nation,
    row.Pos,
    parseInteger(row.Born),
    row.Url
  );

  await pool.query(
    `INSERT INTO player_season_stats (
      player_id, team_id, season_end_year, competition, age, position,
      matches_played, starts, minutes, minutes_per_90,
      goals, assists, goals_plus_assists, goals_minus_pk,
      penalties_made, penalties_attempted, yellow_cards, red_cards,
      xg, npxg, xag, npxg_plus_xag,
      progressive_carries, progressive_passes, progressive_receptions,
      goals_per_90, assists_per_90, goals_plus_assists_per_90,
      xg_per_90, xag_per_90
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
    ON CONFLICT (player_id, season_end_year, competition, team_id) DO NOTHING`,
    [
      playerId,
      teamId,
      parseInteger(row.Season_End_Year),
      row.Comp,
      parseInteger(row.Age),
      row.Pos,
      parseInteger(row.MP_Playing),
      parseInteger(row.Starts_Playing),
      parseInteger(row.Min_Playing),
      parseNumber(row.Mins_Per_90_Playing),
      parseInteger(row.Gls),
      parseInteger(row.Ast),
      parseInteger(row['G+A']),
      parseInteger(row.G_minus_PK),
      parseInteger(row.PK),
      parseInteger(row.PKatt),
      parseInteger(row.CrdY),
      parseInteger(row.CrdR),
      parseNumber(row.xG_Expected),
      parseNumber(row.npxG_Expected),
      parseNumber(row.xAG_Expected),
      parseNumber(row['npxG+xAG_Expected']),
      parseInteger(row.PrgC_Progression),
      parseInteger(row.PrgP_Progression),
      parseInteger(row.PrgR_Progression),
      parseNumber(row.Gls_Per),
      parseNumber(row.Ast_Per),
      parseNumber(row['G+A_Per']),
      parseNumber(row.xG_Per),
      parseNumber(row.xAG_Per),
    ]
  );
}

async function insertTeamSeasonStats(row: TeamRow) {
  // Create season-specific team row
  const teamId = await upsertTeam(row.Squad, row.Url, parseInteger(row.Season_End_Year));

  await pool.query(
    `INSERT INTO team_season_stats (
      team_id, season_end_year, competition, team_or_opponent,
      num_players, average_age, possession_pct,
      matches_played, starts, minutes, minutes_per_90,
      goals, assists, goals_plus_assists, goals_minus_pk,
      penalties_made, penalties_attempted, yellow_cards, red_cards,
      xg, npxg, xag, npxg_plus_xag,
      progressive_carries, progressive_passes,
      goals_per_90, assists_per_90, xg_per_90
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
    ON CONFLICT (team_id, season_end_year, competition, team_or_opponent) DO NOTHING`,
    [
      teamId,
      parseInteger(row.Season_End_Year),
      row.Comp,
      row.Team_or_Opponent,
      parseInteger(row.Num_Players),
      parseNumber(row.Age),
      parseNumber(row.Poss),
      parseInteger(row.MP_Playing),
      parseInteger(row.Starts_Playing),
      parseInteger(row.Min_Playing),
      parseNumber(row.Mins_Per_90_Playing),
      parseInteger(row.Gls),
      parseInteger(row.Ast),
      parseInteger(row['G+A']),
      parseInteger(row.G_minus_PK),
      parseInteger(row.PK),
      parseInteger(row.PKatt),
      parseInteger(row.CrdY),
      parseInteger(row.CrdR),
      parseNumber(row.xG_Expected),
      parseNumber(row.npxG_Expected),
      parseNumber(row.xAG_Expected),
      parseNumber(row['npxG+xAG_Expected']),
      parseInteger(row.PrgC_Progression),
      parseInteger(row.PrgP_Progression),
      parseNumber(row.Gls_Per),
      parseNumber(row.Ast_Per),
      parseNumber(row.xG_Per),
    ]
  );
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting FBref standard stats ingestion...\n');

    const dataDir = path.join(process.cwd(), 'data');

    // -------------------------
    // 📊 Player standard stats
    // -------------------------
    console.log('📊 Processing player standard stats...');

    const playerFile = path.join(
      dataDir,
      'big5',
      'player',
      'big5_player_standard.csv'
    );

    const playerData = await parseCSV<PlayerRow>(playerFile);
    console.log(`Found ${playerData.length} player season records\n`);

    let processedPlayers = 0;
    for (const row of playerData) {
      await insertPlayerSeasonStats(row);
      processedPlayers++;

      if (processedPlayers % 500 === 0) {
        console.log(`  ✓ Processed ${processedPlayers}/${playerData.length} player records`);
      }
    }
    console.log(`✅ All ${processedPlayers} player records imported\n`);

    // -------------------------
    // 📊 Team standard stats
    // -------------------------
    console.log('📊 Processing team standard stats...');

    const teamFile = path.join(
      dataDir,
      'big5',
      'team',
      'big5_team_standard.csv'
    );

    const teamData = await parseCSV<TeamRow>(teamFile);
    console.log(`Found ${teamData.length} team season records\n`);

    let processedTeams = 0;
    for (const row of teamData) {
      await insertTeamSeasonStats(row);
      processedTeams++;

      if (processedTeams % 100 === 0) {
        console.log(`  ✓ Processed ${processedTeams}/${teamData.length} team records`);
      }
    }
    console.log(`✅ All ${processedTeams} team records imported\n`);

    // Summary
    const playerCount = await pool.query('SELECT COUNT(*) FROM players');
    const teamCount = await pool.query('SELECT COUNT(*) FROM teams');
    const playerStatsCount = await pool.query('SELECT COUNT(*) FROM player_season_stats');
    const teamStatsCount = await pool.query('SELECT COUNT(*) FROM team_season_stats');

    console.log('═══════════════════════════════════════');
    console.log('📈 Import Summary');
    console.log('═══════════════════════════════════════');
    console.log(`   Unique Players: ${playerCount.rows[0].count}`);
    console.log(`   Unique Teams: ${teamCount.rows[0].count}`);
    console.log(`   Player Season Records: ${playerStatsCount.rows[0].count}`);
    console.log(`   Team Season Records: ${teamStatsCount.rows[0].count}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Ingestion complete! You can now start the GraphQL server.\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    await pool.end();
    process.exit(1);
  }
}

main();