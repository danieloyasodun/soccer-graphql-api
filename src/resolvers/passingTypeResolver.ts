import pool from '../db/postgres';

export const passingTypeResolvers = {
  Query: {
    playerPassingTypeStats: async (_: any, { playerSeasonStatId }: { playerSeasonStatId: number }) => {
      const result = await pool.query(
        `SELECT *
         FROM player_passing_type_stats
         WHERE player_season_stat_id = $1`,
        [playerSeasonStatId]
      );
      return result.rows[0] || null;
    },

    teamPassingTypeStats: async (_: any, { teamSeasonStatId }: { teamSeasonStatId: number }) => {
      const result = await pool.query(
        `SELECT *
         FROM team_passing_type_stats
         WHERE team_season_stat_id = $1`,
        [teamSeasonStatId]
      );
      return result.rows[0] || null;
    },
  },

  Player: {
    passingTypeStats: async (parent: any, args: any) => {
      const { seasonEndYear, competition } = args;

      const result = await pool.query(
        `
        SELECT *
        FROM player_passing_type_stats pts
        JOIN player_season_stats pss
          ON pss.id = pts.player_season_stat_id
        WHERE pss.player_id = $1
          AND pss.season_end_year = $2
          AND ($3::text IS NULL OR pss.competition = $3)
        `,
        [parent.id, seasonEndYear, competition || null]
      );

      return result.rows[0] || null; 
    },
  },

  Team: {
    // MUST match schema: passingTypeStats
    passingTypeStats: async (parent: any, args: any) => {
      const { seasonEndYear, competition } = args;

      const result = await pool.query(
        `SELECT tpts.*
         FROM team_passing_type_stats tpts
         JOIN team_season_stats tss
           ON tss.id = tpts.team_season_stat_id
         WHERE tss.team_id = $1
           AND tss.season_end_year = $2
           AND ($3::text IS NULL OR tss.competition = $3)`,
        [parent.id, seasonEndYear, competition || null]
      );

      return result.rows[0] || null;
    },
  },
};

