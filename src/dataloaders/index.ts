import DataLoader from 'dataloader';
import pool from '../db/postgres';
import redis from '../db/redis';

// Helper: Cache with Redis
async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fetchFn();
  }
}

// Batch load teams by IDs
async function batchTeams(ids: readonly number[]) {
  const result = await pool.query(
    'SELECT * FROM teams WHERE id = ANY($1::int[])',
    [ids]
  );

  const teamMap = new Map(result.rows.map(row => [row.id, row]));
  return ids.map(id => teamMap.get(id) || null);
}

// Batch load players by IDs
async function batchPlayers(ids: readonly number[]) {
  const result = await pool.query(
    'SELECT * FROM players WHERE id = ANY($1::int[])',
    [ids]
  );

  const playerMap = new Map(result.rows.map(row => [row.id, row]));
  return ids.map(id => playerMap.get(id) || null);
}

// Batch load player stats by player IDs
async function batchPlayerStatsByPlayerId(playerIds: readonly number[]) {
  const result = await pool.query(
    'SELECT * FROM player_season_stats WHERE player_id = ANY($1::int[]) ORDER BY season_end_year DESC',
    [playerIds]
  );

  const statsByPlayer = new Map<number, any[]>();
  result.rows.forEach(stat => {
    if (!statsByPlayer.has(stat.player_id)) {
      statsByPlayer.set(stat.player_id, []);
    }
    statsByPlayer.get(stat.player_id)!.push(stat);
  });

  return playerIds.map(id => statsByPlayer.get(id) || []);
}

// Batch load team stats by team IDs
async function batchTeamStatsByTeamId(teamIds: readonly number[]) {
  const result = await pool.query(
    'SELECT * FROM team_season_stats WHERE team_id = ANY($1::int[]) ORDER BY season_end_year DESC',
    [teamIds]
  );

  const statsByTeam = new Map<number, any[]>();
  result.rows.forEach(stat => {
    if (!statsByTeam.has(stat.team_id)) {
      statsByTeam.set(stat.team_id, []);
    }
    statsByTeam.get(stat.team_id)!.push(stat);
  });

  return teamIds.map(id => statsByTeam.get(id) || []);
}

// Batch load players by team IDs
async function batchPlayersByTeamId(teamIds: readonly number[]) {
  const result = await pool.query(
    `SELECT DISTINCT p.*, pss.team_id 
     FROM players p
     JOIN player_season_stats pss ON p.id = pss.player_id
     WHERE pss.team_id = ANY($1::int[])`,
    [teamIds]
  );

  const playersByTeam = new Map<number, any[]>();
  result.rows.forEach(player => {
    if (!playersByTeam.has(player.team_id)) {
      playersByTeam.set(player.team_id, []);
    }
    playersByTeam.get(player.team_id)!.push(player);
  });

  return teamIds.map(id => playersByTeam.get(id) || []);
}

export function createLoaders() {
  return {
    teamLoader: new DataLoader(batchTeams),
    playerLoader: new DataLoader(batchPlayers),
    playerStatsByPlayerLoader: new DataLoader(batchPlayerStatsByPlayerId),
    teamStatsByTeamLoader: new DataLoader(batchTeamStatsByTeamId),
    playersByTeamLoader: new DataLoader(batchPlayersByTeamId),
  };
}

export { getCached };