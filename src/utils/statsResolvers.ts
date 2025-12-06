import pool from '../db/postgres';

// Generic function to fetch additional stats
export async function fetchPlayerAdditionalStats(
  tableName: string,
  playerSeasonStatId: number
) {
  const result = await pool.query(
    `SELECT * FROM ${tableName} WHERE player_season_stat_id = $1 LIMIT 1`,
    [playerSeasonStatId]
  );
  return result.rows[0] || null;
}

export async function fetchTeamAdditionalStats(
  tableName: string,
  teamSeasonStatId: number
) {
  const result = await pool.query(
    `SELECT * FROM ${tableName} WHERE team_season_stat_id = $1 LIMIT 1`,
    [teamSeasonStatId]
  );
  return result.rows[0] || null;
}

// Helper to get player_season_stat_id
export async function getPlayerSeasonStatId(
  playerId: number,
  seasonEndYear: number,
  competition?: string
): Promise<number | null> {
  let query = `
    SELECT id FROM player_season_stats 
    WHERE player_id = $1 AND season_end_year = $2
  `;
  const params: any[] = [playerId, seasonEndYear];

  if (competition) {
    query += ' AND competition = $3';
    params.push(competition);
  }

  query += ' LIMIT 1';

  const result = await pool.query(query, params);
  return result.rows.length > 0 ? result.rows[0].id : null;
}

// Helper to get team_season_stat_id
export async function getTeamSeasonStatId(
  teamId: number,
  seasonEndYear: number,
  competition?: string
): Promise<number | null> {
  let query = `
    SELECT id FROM team_season_stats 
    WHERE team_id = $1 
    AND season_end_year = $2 
    AND team_or_opponent = 'team'
  `;
  const params: any[] = [teamId, seasonEndYear];

  if (competition) {
    query += ' AND competition = $3';
    params.push(competition);
  }

  query += ' LIMIT 1';

  const result = await pool.query(query, params);
  return result.rows.length > 0 ? result.rows[0].id : null;
}