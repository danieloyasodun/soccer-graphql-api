import pool from '../db/postgres';
import { getCached } from '../dataloaders';

export const teamResolvers = {
  Query: {
    team: async (_: any, { id, name }: any, { loaders }: any) => {
      if (id) {
        return loaders.teamLoader.load(parseInt(id));
      }
      
      if (name) {
        const result = await pool.query(
          'SELECT * FROM teams WHERE name ILIKE $1 LIMIT 1',
          [name]
        );
        return result.rows[0] || null;
      }
      
      return null;
    },

    teams: async (_: any, { competition, limit, offset }: any) => {
      let query = 'SELECT DISTINCT t.* FROM teams t';
      const params: any[] = [];
      let paramCount = 1;

      if (competition) {
        query += `
          JOIN team_season_stats tss ON t.id = tss.team_id
          WHERE tss.competition = $${paramCount}
        `;
        params.push(competition);
        paramCount++;
      }

      query += ` ORDER BY t.name LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    },

    searchTeams: async (_: any, { query }: any) => {
      const result = await pool.query(
        'SELECT * FROM teams WHERE name ILIKE $1 ORDER BY name LIMIT 20',
        [`%${query}%`]
      );
      return result.rows;
    },

    teamLeaderboard: async (
      _: any,
      { seasonEndYear, competition, sortBy, limit }: any
    ) => {
      const cacheKey = `team_leaderboard:${seasonEndYear}:${competition}:${sortBy}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let sortColumn = 'goals';
        switch (sortBy) {
          case 'XG':
            sortColumn = 'xg';
            break;
          case 'POSSESSION':
            sortColumn = 'possession_pct';
            break;
          case 'PROGRESSIVE_PASSES':
            sortColumn = 'progressive_passes';
            break;
        }

        const result = await pool.query(
          `SELECT t.*, tss.${sortColumn}
           FROM teams t
           JOIN team_season_stats tss ON t.id = tss.team_id
           WHERE tss.season_end_year = $1
           AND tss.competition = $2
           AND tss.team_or_opponent = 'team'
           ORDER BY tss.${sortColumn} DESC
           LIMIT $3`,
          [seasonEndYear, competition, limit]
        );
        return result.rows;
      }, 3600);
    },
  },

  Team: {
    fbrefUrl: (team: any) => team.fbref_url,

    seasonStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      let query = `
        SELECT * FROM team_season_stats 
        WHERE team_id = $1 
        AND season_end_year = $2
        AND team_or_opponent = 'team'
      `;
      const params: any[] = [team.id, seasonEndYear];

      if (competition) {
        query += ' AND competition = $3';
        params.push(competition);
      }

      query += ' LIMIT 1';

      const result = await pool.query(query, params);
      return result.rows[0] || null;
    },

    allSeasonStats: async (team: any, { competition }: any, { loaders }: any) => {
      const allStats = await loaders.teamStatsByTeamLoader.load(team.id);
      
      let filtered = allStats.filter((s: any) => s.team_or_opponent === 'team');
      
      if (competition) {
        filtered = filtered.filter((s: any) => s.competition === competition);
      }
      
      return filtered;
    },

    players: async (team: any, { seasonEndYear, position }: any, { loaders }: any) => {
      let query = `
        SELECT DISTINCT p.*
        FROM players p
        JOIN player_season_stats pss ON p.id = pss.player_id
        WHERE pss.team_id = $1
      `;
      const params: any[] = [team.id];
      let paramCount = 2;

      if (seasonEndYear) {
        query += ` AND pss.season_end_year = $${paramCount}`;
        params.push(seasonEndYear);
        paramCount++;
      }

      if (position) {
        query += ` AND pss.position = $${paramCount}`;
        params.push(position);
        paramCount++;
      }

      query += ' ORDER BY p.name';

      const result = await pool.query(query, params);
      return result.rows;
    },
  },

  TeamSeasonStats: {
    team: (stats: any, _: any, { loaders }: any) => {
      return loaders.teamLoader.load(stats.team_id);
    },

    // Map snake_case to camelCase
    seasonEndYear: (stats: any) => stats.season_end_year,
    teamOrOpponent: (stats: any) => stats.team_or_opponent,
    numPlayers: (stats: any) => stats.num_players,
    averageAge: (stats: any) => parseFloat(stats.average_age),
    possessionPct: (stats: any) => parseFloat(stats.possession_pct),
    matchesPlayed: (stats: any) => stats.matches_played,
    goalsAssists: (stats: any) => stats.goals_plus_assists,
    goalsPK: (stats: any) => stats.goals_minus_pk,
    penaltiesMade: (stats: any) => stats.penalties_made,
    penaltiesAttempted: (stats: any) => stats.penalties_attempted,
    yellowCards: (stats: any) => stats.yellow_cards,
    redCards: (stats: any) => stats.red_cards,
    xG: (stats: any) => parseFloat(stats.xg),
    npxG: (stats: any) => parseFloat(stats.npxg),
    xAG: (stats: any) => parseFloat(stats.xag),
    npxGxAG: (stats: any) => parseFloat(stats.npxg_plus_xag),
    progressiveCarries: (stats: any) => stats.progressive_carries,
    progressivePasses: (stats: any) => stats.progressive_passes,
    goalsPer90: (stats: any) => parseFloat(stats.goals_per_90),
    assistsPer90: (stats: any) => parseFloat(stats.assists_per_90),
    xGPer90: (stats: any) => parseFloat(stats.xg_per_90),
    },
};