import pool from '../db/postgres';
import redis from '../db/redis';
import { getCached } from '../dataloaders';

export const playerResolvers = {
  Query: {
    player: async (_: any, { id, name }: any, { loaders }: any) => {
      if (id) {
        return loaders.playerLoader.load(parseInt(id));
      }
      
      if (name) {
        const result = await pool.query(
          'SELECT * FROM players WHERE name ILIKE $1 LIMIT 1',
          [name]
        );
        return result.rows[0] || null;
      }
      
      return null;
    },

    players: async (
      _: any,
      { teamId, competition, seasonEndYear, position, nation, minMinutes, limit, offset }: any
    ) => {
      let query = `
        SELECT DISTINCT p.*
        FROM players p
        JOIN player_season_stats pss ON p.id = pss.player_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (teamId) {
        query += ` AND pss.team_id = $${paramCount}`;
        params.push(teamId);
        paramCount++;
      }

      if (competition) {
        query += ` AND pss.competition = $${paramCount}`;
        params.push(competition);
        paramCount++;
      }

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

      if (nation) {
        query += ` AND p.nation = $${paramCount}`;
        params.push(nation);
        paramCount++;
      }

      if (minMinutes) {
        query += ` AND pss.minutes >= $${paramCount}`;
        params.push(minMinutes);
        paramCount++;
      }

      query += ` ORDER BY p.name LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    },

    searchPlayers: async (_: any, { query }: any) => {
      const result = await pool.query(
        'SELECT * FROM players WHERE name ILIKE $1 ORDER BY name LIMIT 20',
        [`%${query}%`]
      );
      return result.rows;
    },

    topScorers: async (
      _: any,
      { seasonEndYear, competition, position, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_scorers:${seasonEndYear}:${competition || 'all'}:${position || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pss.goals, pss.minutes
          FROM players p
          JOIN player_season_stats pss ON p.id = pss.player_id
          WHERE pss.season_end_year = $1
          AND pss.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pss.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        if (position) {
          query += ` AND pss.position = $${paramCount}`;
          params.push(position);
          paramCount++;
        }

        query += ` ORDER BY pss.goals DESC, pss.minutes DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600); // Cache for 1 hour
    },

    topAssists: async (
      _: any,
      { seasonEndYear, competition, position, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_assists:${seasonEndYear}:${competition || 'all'}:${position || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pss.assists, pss.minutes
          FROM players p
          JOIN player_season_stats pss ON p.id = pss.player_id
          WHERE pss.season_end_year = $1
          AND pss.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pss.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        if (position) {
          query += ` AND pss.position = $${paramCount}`;
          params.push(position);
          paramCount++;
        }

        query += ` ORDER BY pss.assists DESC, pss.minutes DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    topXG: async (
      _: any,
      { seasonEndYear, competition, position, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_xg:${seasonEndYear}:${competition || 'all'}:${position || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pss.xg, pss.minutes
          FROM players p
          JOIN player_season_stats pss ON p.id = pss.player_id
          WHERE pss.season_end_year = $1
          AND pss.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pss.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        if (position) {
          query += ` AND pss.position = $${paramCount}`;
          params.push(position);
          paramCount++;
        }

        query += ` ORDER BY pss.xg DESC, pss.minutes DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    topProgressivePasses: async (
      _: any,
      { seasonEndYear, competition, position, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_prog_passes:${seasonEndYear}:${competition || 'all'}:${position || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pss.progressive_passes, pss.minutes
          FROM players p
          JOIN player_season_stats pss ON p.id = pss.player_id
          WHERE pss.season_end_year = $1
          AND pss.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pss.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        if (position) {
          query += ` AND pss.position = $${paramCount}`;
          params.push(position);
          paramCount++;
        }

        query += ` ORDER BY pss.progressive_passes DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    playerComparison: async (_: any, { playerIds, seasonEndYear }: any) => {
      const ids = playerIds.map((id: string) => parseInt(id));
      const result = await pool.query(
        'SELECT * FROM players WHERE id = ANY($1::int[])',
        [ids]
      );
      return result.rows;
    },

    competitions: async () => {
      const cacheKey = 'competitions_list';
      return getCached(cacheKey, async () => {
        const result = await pool.query(
          'SELECT DISTINCT competition FROM player_season_stats ORDER BY competition'
        );
        return result.rows.map(r => r.competition);
      }, 86400); // Cache for 24 hours
    },

    seasons: async () => {
      const cacheKey = 'seasons_list';
      return getCached(cacheKey, async () => {
        const result = await pool.query(
          'SELECT DISTINCT season_end_year FROM player_season_stats ORDER BY season_end_year DESC'
        );
        return result.rows.map(r => r.season_end_year);
      }, 86400);
    },
  },

  Player: {
    currentTeam: async (player: any, _: any, { loaders }: any) => {
      // Get most recent team
      const result = await pool.query(
        `SELECT team_id FROM player_season_stats 
         WHERE player_id = $1 
         ORDER BY season_end_year DESC 
         LIMIT 1`,
        [player.id]
      );
      
      if (result.rows.length === 0) return null;
      return loaders.teamLoader.load(result.rows[0].team_id);
    },

    seasonStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      let query = `
        SELECT * FROM player_season_stats 
        WHERE player_id = $1 AND season_end_year = $2
      `;
      const params: any[] = [player.id, seasonEndYear];

      if (competition) {
        query += ' AND competition = $3';
        params.push(competition);
      }

      query += ' LIMIT 1';

      const result = await pool.query(query, params);
      return result.rows[0] || null;
    },

    allSeasonStats: async (player: any, { competition }: any, { loaders }: any) => {
      const allStats = await loaders.playerStatsByPlayerLoader.load(player.id);
      
      if (competition) {
        return allStats.filter((s: any) => s.competition === competition);
      }
      
      return allStats;
    },

    careerStats: async (player: any) => {
      const cacheKey = `career_stats:${player.id}`;
      
      return getCached(cacheKey, async () => {
        const result = await pool.query(
          `SELECT 
            SUM(goals) as total_goals,
            SUM(assists) as total_assists,
            SUM(matches_played) as total_matches,
            SUM(minutes) as total_minutes,
            COUNT(DISTINCT season_end_year) as seasons_played,
            ARRAY_AGG(DISTINCT competition) as competitions,
            ROUND(CAST(SUM(goals) AS NUMERIC) / NULLIF(SUM(minutes), 0) * 90, 2) as avg_goals_per_90,
            ROUND(CAST(SUM(assists) AS NUMERIC) / NULLIF(SUM(minutes), 0) * 90, 2) as avg_assists_per_90
          FROM player_season_stats
          WHERE player_id = $1`,
          [player.id]
        );

        const stats = result.rows[0];
        return {
          totalGoals: parseInt(stats.total_goals) || 0,
          totalAssists: parseInt(stats.total_assists) || 0,
          totalMatches: parseInt(stats.total_matches) || 0,
          totalMinutes: parseInt(stats.total_minutes) || 0,
          seasonsPlayed: parseInt(stats.seasons_played) || 0,
          competitions: stats.competitions || [],
          avgGoalsPer90: parseFloat(stats.avg_goals_per_90) || 0,
          avgAssistsPer90: parseFloat(stats.avg_assists_per_90) || 0,
        };
      }, 3600);
    },
  },

  PlayerSeasonStats: {
    player: (stats: any, _: any, { loaders }: any) => {
      return loaders.playerLoader.load(stats.player_id);
    },

    team: (stats: any, _: any, { loaders }: any) => {
      return loaders.teamLoader.load(stats.team_id);
    },

    

    // Map snake_case DB fields to camelCase GraphQL fields
    seasonEndYear: (stats: any) => stats.season_end_year,
    matchesPlayed: (stats: any) => stats.matches_played,
    minutesPer90: (stats: any) => parseFloat(stats.minutes_per_90),
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
    progressiveReceptions: (stats: any) => stats.progressive_receptions,
    goalsPer90: (stats: any) => parseFloat(stats.goals_per_90),
    assistsPer90: (stats: any) => parseFloat(stats.assists_per_90),
    goalsAssistsPer90: (stats: any) => parseFloat(stats.goals_plus_assists_per_90),
    xGPer90: (stats: any) => parseFloat(stats.xg_per_90),
    xAGPer90: (stats: any) => parseFloat(stats.xag_per_90),
  },
};