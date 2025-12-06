import pool from '../db/postgres';
import { getCached } from '../dataloaders';
import {
  fetchPlayerAdditionalStats,
  fetchTeamAdditionalStats,
  getPlayerSeasonStatId,
  getTeamSeasonStatId,
} from '../utils/statsResolvers';

export const additionalStatsResolvers = {
  Query: {
    // Top shooters by shots on target
    topShooters: async (
      _: any,
      { seasonEndYear, competition, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_shooters:${seasonEndYear}:${competition || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pss.shots_on_target_standard
          FROM players p
          JOIN player_season_stats pst ON p.id = pst.player_id
          JOIN player_shooting_stats pss ON pst.id = pss.player_season_stat_id
          WHERE pst.season_end_year = $1
          AND pst.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pst.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        query += ` ORDER BY pss.shots_on_target_standard DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    // Top passers by completion rate
    topPassers: async (
      _: any,
      { seasonEndYear, competition, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_passers:${seasonEndYear}:${competition || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pps.completion_pct_total, pps.completed_total
          FROM players p
          JOIN player_season_stats pst ON p.id = pst.player_id
          JOIN player_passing_stats pps ON pst.id = pps.player_season_stat_id
          WHERE pst.season_end_year = $1
          AND pst.minutes >= $2
          AND pps.attempted_total >= 100
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pst.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        query += ` ORDER BY pps.completed_total DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    // Top defenders by tackles + interceptions
    topDefenders: async (
      _: any,
      { seasonEndYear, competition, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_defenders:${seasonEndYear}:${competition || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pds.tackles_plus_interceptions
          FROM players p
          JOIN player_season_stats pst ON p.id = pst.player_id
          JOIN player_defense_stats pds ON pst.id = pds.player_season_stat_id
          WHERE pst.season_end_year = $1
          AND pst.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pst.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        query += ` ORDER BY pds.tackles_plus_interceptions DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    // Top dribblers by successful take-ons
    topDribblers: async (
      _: any,
      { seasonEndYear, competition, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_dribblers:${seasonEndYear}:${competition || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, ppos.take_ons_successful
          FROM players p
          JOIN player_season_stats pst ON p.id = pst.player_id
          JOIN player_possession_stats ppos ON pst.id = ppos.player_season_stat_id
          WHERE pst.season_end_year = $1
          AND pst.minutes >= $2
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pst.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        query += ` ORDER BY ppos.take_ons_successful DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },

    // Top keepers by save percentage
    topKeepers: async (
      _: any,
      { seasonEndYear, competition, minMinutes, limit }: any
    ) => {
      const cacheKey = `top_keepers:${seasonEndYear}:${competition || 'all'}:${minMinutes}:${limit}`;
      
      return getCached(cacheKey, async () => {
        let query = `
          SELECT p.*, pks.save_pct, pks.saves
          FROM players p
          JOIN player_season_stats pst ON p.id = pst.player_id
          JOIN player_keeper_stats pks ON pst.id = pks.player_season_stat_id
          WHERE pst.season_end_year = $1
          AND pks.minutes >= $2
          AND pks.shots_on_target_against >= 20
        `;
        const params: any[] = [seasonEndYear, minMinutes];
        let paramCount = 3;

        if (competition) {
          query += ` AND pst.competition = $${paramCount}`;
          params.push(competition);
          paramCount++;
        }

        query += ` ORDER BY pks.save_pct DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
      }, 3600);
    },
  },

  Player: {
    shootingStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_shooting_stats', statId);
    },

    passingStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_passing_stats', statId);
    },

    defenseStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_defense_stats', statId);
    },

    gcaStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_gca_stats', statId);
    },

    possessionStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_possession_stats', statId);
    },

    playingTimeStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_playing_time_stats', statId);
    },

    miscStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_misc_stats', statId);
    },

    keeperStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_keeper_stats', statId);
    },

    keeperAdvancedStats: async (
      player: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getPlayerSeasonStatId(player.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchPlayerAdditionalStats('player_keeper_advanced_stats', statId);
    },
  },

  Team: {
    shootingStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_shooting_stats', statId);
    },

    passingStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_passing_stats', statId);
    },

    defenseStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_defense_stats', statId);
    },

    gcaStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_gca_stats', statId);
    },

    possessionStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_possession_stats', statId);
    },

    playingTimeStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_playing_time_stats', statId);
    },

    miscStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_misc_stats', statId);
    },

    keeperStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_keeper_stats', statId);
    },

    keeperAdvancedStats: async (
      team: any,
      { seasonEndYear, competition }: any
    ) => {
      const statId = await getTeamSeasonStatId(team.id, seasonEndYear, competition);
      if (!statId) return null;
      return fetchTeamAdditionalStats('team_keeper_advanced_stats', statId);
    },
  },

  // ======================================
  // FIELD RESOLVERS (snake_case to camelCase)
  // ======================================

  PlayerShootingStats: {
    goalsStandard: (s: any) => s.goals_standard,
    shotsStandard: (s: any) => s.shots_standard,
    shotsOnTargetStandard: (s: any) => s.shots_on_target_standard,
    shotsOnTargetPctStandard: (s: any) => parseFloat(s.shots_on_target_pct_standard || 0),
    shotsPer90Standard: (s: any) => parseFloat(s.shots_per_90_standard || 0),
    shotsOnTargetPer90Standard: (s: any) => parseFloat(s.shots_on_target_per_90_standard || 0),
    goalsPerShotStandard: (s: any) => parseFloat(s.goals_per_shot_standard || 0),
    goalsPerShotOnTargetStandard: (s: any) => parseFloat(s.goals_per_shot_on_target_standard || 0),
    distanceStandard: (s: any) => parseFloat(s.distance_standard || 0),
    freeKicksStandard: (s: any) => s.free_kicks_standard,
    penaltiesStandard: (s: any) => s.penalties_standard,
    penaltiesAttemptedStandard: (s: any) => s.penalties_attempted_standard,
    xgExpected: (s: any) => parseFloat(s.xg_expected || 0),
    npxgExpected: (s: any) => parseFloat(s.npxg_expected || 0),
    npxgPerShotExpected: (s: any) => parseFloat(s.npxg_per_shot_expected || 0),
    goalsMinusXgExpected: (s: any) => parseFloat(s.goals_minus_xg_expected || 0),
    npGoalsMinusXgExpected: (s: any) => parseFloat(s.np_goals_minus_xg_expected || 0),
  },

  TeamShootingStats: {
    goalsStandard: (s: any) => s.goals_standard,
    shotsStandard: (s: any) => s.shots_standard,
    shotsOnTargetStandard: (s: any) => s.shots_on_target_standard,
    shotsOnTargetPctStandard: (s: any) => parseFloat(s.shots_on_target_pct_standard || 0),
    shotsPer90Standard: (s: any) => parseFloat(s.shots_per_90_standard || 0),
    shotsOnTargetPer90Standard: (s: any) => parseFloat(s.shots_on_target_per_90_standard || 0),
    goalsPerShotStandard: (s: any) => parseFloat(s.goals_per_shot_standard || 0),
    goalsPerShotOnTargetStandard: (s: any) => parseFloat(s.goals_per_shot_on_target_standard || 0),
    distanceStandard: (s: any) => parseFloat(s.distance_standard || 0),
    freeKicksStandard: (s: any) => s.free_kicks_standard,
    penaltiesStandard: (s: any) => s.penalties_standard,
    penaltiesAttemptedStandard: (s: any) => s.penalties_attempted_standard,
    xgExpected: (s: any) => parseFloat(s.xg_expected || 0),
    npxgExpected: (s: any) => parseFloat(s.npxg_expected || 0),
    npxgPerShotExpected: (s: any) => parseFloat(s.npxg_per_shot_expected || 0),
    goalsMinusXgExpected: (s: any) => parseFloat(s.goals_minus_xg_expected || 0),
    npGoalsMinusXgExpected: (s: any) => parseFloat(s.np_goals_minus_xg_expected || 0),
  },

  PlayerPassingStats: {
    completedTotal: (s: any) => s.completed_total,
    attemptedTotal: (s: any) => s.attempted_total,
    completionPctTotal: (s: any) => parseFloat(s.completion_pct_total || 0),
    totalDistance: (s: any) => s.total_distance,
    progressiveDistance: (s: any) => s.progressive_distance,
    completedShort: (s: any) => s.completed_short,
    attemptedShort: (s: any) => s.attempted_short,
    completionPctShort: (s: any) => parseFloat(s.completion_pct_short || 0),
    completedMedium: (s: any) => s.completed_medium,
    attemptedMedium: (s: any) => s.attempted_medium,
    completionPctMedium: (s: any) => parseFloat(s.completion_pct_medium || 0),
    completedLong: (s: any) => s.completed_long,
    attemptedLong: (s: any) => s.attempted_long,
    completionPctLong: (s: any) => parseFloat(s.completion_pct_long || 0),
    assists: (s: any) => s.assists,
    xag: (s: any) => parseFloat(s.xag || 0),
    xaExpected: (s: any) => parseFloat(s.xa_expected || 0),
    assistsMinusXag: (s: any) => parseFloat(s.assists_minus_xag || 0),
    keyPasses: (s: any) => s.key_passes,
    passesIntoFinalThird: (s: any) => s.passes_into_final_third,
    passesIntoPenaltyArea: (s: any) => s.passes_into_penalty_area,
    crossesIntoPenaltyArea: (s: any) => s.crosses_into_penalty_area,
    progressivePasses: (s: any) => s.progressive_passes,
  },

  TeamPassingStats: {
    completedTotal: (s: any) => s.completed_total,
    attemptedTotal: (s: any) => s.attempted_total,
    completionPctTotal: (s: any) => parseFloat(s.completion_pct_total || 0),
    totalDistance: (s: any) => s.total_distance,
    progressiveDistance: (s: any) => s.progressive_distance,
    completedShort: (s: any) => s.completed_short,
    attemptedShort: (s: any) => s.attempted_short,
    completionPctShort: (s: any) => parseFloat(s.completion_pct_short || 0),
    completedMedium: (s: any) => s.completed_medium,
    attemptedMedium: (s: any) => s.attempted_medium,
    completionPctMedium: (s: any) => parseFloat(s.completion_pct_medium || 0),
    completedLong: (s: any) => s.completed_long,
    attemptedLong: (s: any) => s.attempted_long,
    completionPctLong: (s: any) => parseFloat(s.completion_pct_long || 0),
    assists: (s: any) => s.assists,
    xag: (s: any) => parseFloat(s.xag || 0),
    xaExpected: (s: any) => parseFloat(s.xa_expected || 0),
    assistsMinusXag: (s: any) => parseFloat(s.assists_minus_xag || 0),
    keyPasses: (s: any) => s.key_passes,
    passesIntoFinalThird: (s: any) => s.passes_into_final_third,
    passesIntoPenaltyArea: (s: any) => s.passes_into_penalty_area,
    crossesIntoPenaltyArea: (s: any) => s.crosses_into_penalty_area,
    progressivePasses: (s: any) => s.progressive_passes,
  },

  PlayerDefenseStats: {
    tackles: (s: any) => s.tackles,
    tacklesWon: (s: any) => s.tackles_won,
    tacklesDef3rd: (s: any) => s.tackles_def_3rd,
    tacklesMid3rd: (s: any) => s.tackles_mid_3rd,
    tacklesAtt3rd: (s: any) => s.tackles_att_3rd,
    challengeTackles: (s: any) => s.challenge_tackles,
    challengesAttempted: (s: any) => s.challenges_attempted,
    challengeTacklesPct: (s: any) => parseFloat(s.challenge_tackles_pct || 0),
    challengesLost: (s: any) => s.challenges_lost,
    blocks: (s: any) => s.blocks,
    shotsBlocked: (s: any) => s.shots_blocked,
    passesBlocked: (s: any) => s.passes_blocked,
    interceptions: (s: any) => s.interceptions,
    tacklesPlusInterceptions: (s: any) => s.tackles_plus_interceptions,
    clearances: (s: any) => s.clearances,
    errors: (s: any) => s.errors,
  },

  TeamDefenseStats: {
    tackles: (s: any) => s.tackles,
    tacklesWon: (s: any) => s.tackles_won,
    tacklesDef3rd: (s: any) => s.tackles_def_3rd,
    tacklesMid3rd: (s: any) => s.tackles_mid_3rd,
    tacklesAtt3rd: (s: any) => s.tackles_att_3rd,
    challengeTackles: (s: any) => s.challenge_tackles,
    challengesAttempted: (s: any) => s.challenges_attempted,
    challengeTacklesPct: (s: any) => parseFloat(s.challenge_tackles_pct || 0),
    challengesLost: (s: any) => s.challenges_lost,
    blocks: (s: any) => s.blocks,
    shotsBlocked: (s: any) => s.shots_blocked,
    passesBlocked: (s: any) => s.passes_blocked,
    interceptions: (s: any) => s.interceptions,
    tacklesPlusInterceptions: (s: any) => s.tackles_plus_interceptions,
    clearances: (s: any) => s.clearances,
    errors: (s: any) => s.errors,
  },

  PlayerGCAStats: {
    sca: (s: any) => s.sca,
    scaPer90: (s: any) => parseFloat(s.sca_per_90 || 0),
    scaPassLive: (s: any) => s.sca_pass_live,
    scaPassDead: (s: any) => s.sca_pass_dead,
    scaTakeOn: (s: any) => s.sca_take_on,
    scaShot: (s: any) => s.sca_shot,
    scaFouled: (s: any) => s.sca_fouled,
    scaDefense: (s: any) => s.sca_defense,
    gca: (s: any) => s.gca,
    gcaPer90: (s: any) => parseFloat(s.gca_per_90 || 0),
    gcaPassLive: (s: any) => s.gca_pass_live,
    gcaPassDead: (s: any) => s.gca_pass_dead,
    gcaTakeOn: (s: any) => s.gca_take_on,
    gcaShot: (s: any) => s.gca_shot,
    gcaFouled: (s: any) => s.gca_fouled,
    gcaDefense: (s: any) => s.gca_defense,
  },

  TeamGCAStats: {
    sca: (s: any) => s.sca,
    scaPer90: (s: any) => parseFloat(s.sca_per_90 || 0),
    scaPassLive: (s: any) => s.sca_pass_live,
    scaPassDead: (s: any) => s.sca_pass_dead,
    scaTakeOn: (s: any) => s.sca_take_on,
    scaShot: (s: any) => s.sca_shot,
    scaFouled: (s: any) => s.sca_fouled,
    scaDefense: (s: any) => s.sca_defense,
    gca: (s: any) => s.gca,
    gcaPer90: (s: any) => parseFloat(s.gca_per_90 || 0),
    gcaPassLive: (s: any) => s.gca_pass_live,
    gcaPassDead: (s: any) => s.gca_pass_dead,
    gcaTakeOn: (s: any) => s.gca_take_on,
    gcaShot: (s: any) => s.gca_shot,
    gcaFouled: (s: any) => s.gca_fouled,
    gcaDefense: (s: any) => s.gca_defense,
  },

  PlayerPossessionStats: {
    touches: (s: any) => s.touches,
    touchesDefPen: (s: any) => s.touches_def_pen,
    touchesDef3rd: (s: any) => s.touches_def_3rd,
    touchesMid3rd: (s: any) => s.touches_mid_3rd,
    touchesAtt3rd: (s: any) => s.touches_att_3rd,
    touchesAttPen: (s: any) => s.touches_att_pen,
    touchesLive: (s: any) => s.touches_live,
    takeOnsAttempted: (s: any) => s.take_ons_attempted,
    takeOnsSuccessful: (s: any) => s.take_ons_successful,
    takeOnsSuccessPct: (s: any) => parseFloat(s.take_ons_success_pct || 0),
    takeOnsTackled: (s: any) => s.take_ons_tackled,
    takeOnsTackledPct: (s: any) => parseFloat(s.take_ons_tackled_pct || 0),
    carries: (s: any) => s.carries,
    carriesTotalDistance: (s: any) => s.carries_total_distance,
    carriesProgressiveDistance: (s: any) => s.carries_progressive_distance,
    progressiveCarries: (s: any) => s.progressive_carries,
    carriesIntoFinalThird: (s: any) => s.carries_into_final_third,
    carriesIntoPenaltyArea: (s: any) => s.carries_into_penalty_area,
    miscontrols: (s: any) => s.miscontrols,
    dispossessed: (s: any) => s.dispossessed,
    passesReceived: (s: any) => s.passes_received,
    progressivePassesReceived: (s: any) => s.progressive_passes_received,
  },

  TeamPossessionStats: {
    touches: (s: any) => s.touches,
    touchesDefPen: (s: any) => s.touches_def_pen,
    touchesDef3rd: (s: any) => s.touches_def_3rd,
    touchesMid3rd: (s: any) => s.touches_mid_3rd,
    touchesAtt3rd: (s: any) => s.touches_att_3rd,
    touchesAttPen: (s: any) => s.touches_att_pen,
    touchesLive: (s: any) => s.touches_live,
    takeOnsAttempted: (s: any) => s.take_ons_attempted,
    takeOnsSuccessful: (s: any) => s.take_ons_successful,
    takeOnsSuccessPct: (s: any) => parseFloat(s.take_ons_success_pct || 0),
    takeOnsTackled: (s: any) => s.take_ons_tackled,
    takeOnsTackledPct: (s: any) => parseFloat(s.take_ons_tackled_pct || 0),
    carries: (s: any) => s.carries,
    carriesTotalDistance: (s: any) => s.carries_total_distance,
    carriesProgressiveDistance: (s: any) => s.carries_progressive_distance,
    progressiveCarries: (s: any) => s.progressive_carries,
    carriesIntoFinalThird: (s: any) => s.carries_into_final_third,
    carriesIntoPenaltyArea: (s: any) => s.carries_into_penalty_area,
    miscontrols: (s: any) => s.miscontrols,
    dispossessed: (s: any) => s.dispossessed,
    passesReceived: (s: any) => s.passes_received,
    progressivePassesReceived: (s: any) => s.progressive_passes_received,
  },

  PlayerPlayingTimeStats: {
    matchesPlayed: (s: any) => s.matches_played,
    minutes: (s: any) => s.minutes,
    minutesPerMatch: (s: any) => parseFloat(s.minutes_per_match || 0),
    minutesPct: (s: any) => parseFloat(s.minutes_pct || 0),
    minutesPer90: (s: any) => parseFloat(s.minutes_per_90 || 0),
    starts: (s: any) => s.starts,
    minutesPerStart: (s: any) => parseFloat(s.minutes_per_start || 0),
    completeMatches: (s: any) => s.complete_matches,
    subs: (s: any) => s.subs,
    minutesPerSub: (s: any) => parseFloat(s.minutes_per_sub || 0),
    unusedSub: (s: any) => s.unused_sub,
    pointsPerMatch: (s: any) => parseFloat(s.points_per_match || 0),
onGoalsFor: (s: any) => s.on_goals_for,
onGoalsAgainst: (s: any) => s.on_goals_against,
plusMinus: (s: any) => s.plus_minus,
plusMinusPer90: (s: any) => parseFloat(s.plus_minus_per_90 || 0),
onOff: (s: any) => parseFloat(s.on_off || 0),
onXg: (s: any) => parseFloat(s.on_xg || 0),
onXga: (s: any) => parseFloat(s.on_xga || 0),
xgPlusMinus: (s: any) => parseFloat(s.xg_plus_minus || 0),
xgPlusMinusPer90: (s: any) => parseFloat(s.xg_plus_minus_per_90 || 0),
xgOnOff: (s: any) => parseFloat(s.xg_on_off || 0),
},
TeamPlayingTimeStats: {
matchesPlayed: (s: any) => s.matches_played,
minutes: (s: any) => s.minutes,
minutesPerMatch: (s: any) => parseFloat(s.minutes_per_match || 0),
minutesPct: (s: any) => parseFloat(s.minutes_pct || 0),
minutesPer90: (s: any) => parseFloat(s.minutes_per_90 || 0),
starts: (s: any) => s.starts,
minutesPerStart: (s: any) => parseFloat(s.minutes_per_start || 0),
completeMatches: (s: any) => s.complete_matches,
subs: (s: any) => s.subs,
minutesPerSub: (s: any) => parseFloat(s.minutes_per_sub || 0),
unusedSub: (s: any) => s.unused_sub,
pointsPerMatch: (s: any) => parseFloat(s.points_per_match || 0),
onGoalsFor: (s: any) => s.on_goals_for,
onGoalsAgainst: (s: any) => s.on_goals_against,
plusMinus: (s: any) => s.plus_minus,
plusMinusPer90: (s: any) => parseFloat(s.plus_minus_per_90 || 0),
onXg: (s: any) => parseFloat(s.on_xg || 0),
onXga: (s: any) => parseFloat(s.on_xga || 0),
xgPlusMinus: (s: any) => parseFloat(s.xg_plus_minus || 0),
xgPlusMinusPer90: (s: any) => parseFloat(s.xg_plus_minus_per_90 || 0),
},
PlayerMiscStats: {
yellowCards: (s: any) => s.yellow_cards,
redCards: (s: any) => s.red_cards,
secondYellow: (s: any) => s.second_yellow,
foulsCommitted: (s: any) => s.fouls_committed,
foulsDrawn: (s: any) => s.fouls_drawn,
offsides: (s: any) => s.offsides,
crosses: (s: any) => s.crosses,
interceptions: (s: any) => s.interceptions,
tacklesWon: (s: any) => s.tackles_won,
penaltyKicksWon: (s: any) => s.penalty_kicks_won,
penaltyKicksConceded: (s: any) => s.penalty_kicks_conceded,
ownGoals: (s: any) => s.own_goals,
ballRecoveries: (s: any) => s.ball_recoveries,
aerialsWon: (s: any) => s.aerials_won,
aerialsLost: (s: any) => s.aerials_lost,
aerialsWonPct: (s: any) => parseFloat(s.aerials_won_pct || 0),
},
TeamMiscStats: {
yellowCards: (s: any) => s.yellow_cards,
redCards: (s: any) => s.red_cards,
secondYellow: (s: any) => s.second_yellow,
foulsCommitted: (s: any) => s.fouls_committed,
foulsDrawn: (s: any) => s.fouls_drawn,
offsides: (s: any) => s.offsides,
crosses: (s: any) => s.crosses,
interceptions: (s: any) => s.interceptions,
tacklesWon: (s: any) => s.tackles_won,
penaltyKicksWon: (s: any) => s.penalty_kicks_won,
penaltyKicksConceded: (s: any) => s.penalty_kicks_conceded,
ownGoals: (s: any) => s.own_goals,
ballRecoveries: (s: any) => s.ball_recoveries,
aerialsWon: (s: any) => s.aerials_won,
aerialsLost: (s: any) => s.aerials_lost,
aerialsWonPct: (s: any) => parseFloat(s.aerials_won_pct || 0),
},
PlayerKeeperStats: {
matchesPlayed: (s: any) => s.matches_played,
starts: (s: any) => s.starts,
minutes: (s: any) => s.minutes,
minutesPer90: (s: any) => parseFloat(s.minutes_per_90 || 0),
goalsAgainst: (s: any) => s.goals_against,
goalsAgainstPer90: (s: any) => parseFloat(s.goals_against_per_90 || 0),
shotsOnTargetAgainst: (s: any) => s.shots_on_target_against,
saves: (s: any) => s.saves,
savePct: (s: any) => parseFloat(s.save_pct || 0),
wins: (s: any) => s.wins,
draws: (s: any) => s.draws,
losses: (s: any) => s.losses,
cleanSheets: (s: any) => s.clean_sheets,
cleanSheetPct: (s: any) => parseFloat(s.clean_sheet_pct || 0),
penaltyKicksAttempted: (s: any) => s.penalty_kicks_attempted,
penaltyKicksAllowed: (s: any) => s.penalty_kicks_allowed,
penaltyKicksSaved: (s: any) => s.penalty_kicks_saved,
penaltyKicksMissed: (s: any) => s.penalty_kicks_missed,
penaltySavePct: (s: any) => parseFloat(s.penalty_save_pct || 0),
},
TeamKeeperStats: {
matchesPlayed: (s: any) => s.matches_played,
starts: (s: any) => s.starts,
minutes: (s: any) => s.minutes,
minutesPer90: (s: any) => parseFloat(s.minutes_per_90 || 0),
goalsAgainst: (s: any) => s.goals_against,
goalsAgainstPer90: (s: any) => parseFloat(s.goals_against_per_90 || 0),
shotsOnTargetAgainst: (s: any) => s.shots_on_target_against,
saves: (s: any) => s.saves,
savePct: (s: any) => parseFloat(s.save_pct || 0),
wins: (s: any) => s.wins,
draws: (s: any) => s.draws,
losses: (s: any) => s.losses,
cleanSheets: (s: any) => s.clean_sheets,
cleanSheetPct: (s: any) => parseFloat(s.clean_sheet_pct || 0),
penaltyKicksAttempted: (s: any) => s.penalty_kicks_attempted,
penaltyKicksAllowed: (s: any) => s.penalty_kicks_allowed,
penaltyKicksSaved: (s: any) => s.penalty_kicks_saved,
penaltyKicksMissed: (s: any) => s.penalty_kicks_missed,
penaltySavePct: (s: any) => parseFloat(s.penalty_save_pct || 0),
},
PlayerKeeperAdvancedStats: {
goalsAgainst: (s: any) => s.goals_against,
penaltyKicksAllowed: (s: any) => s.penalty_kicks_allowed,
freeKicksAgainst: (s: any) => s.free_kicks_against,
cornerKicksAgainst: (s: any) => s.corner_kicks_against,
ownGoalsAgainst: (s: any) => s.own_goals_against,
psxg: (s: any) => parseFloat(s.psxg || 0),
psxgPerShotOnTarget: (s: any) => parseFloat(s.psxg_per_shot_on_target || 0),
psxgPlusMinus: (s: any) => parseFloat(s.psxg_plus_minus || 0),
psxgPlusMinusPer90: (s: any) => parseFloat(s.psxg_plus_minus_per_90 || 0),
passesCompletedLaunched: (s: any) => s.passes_completed_launched,
passesAttemptedLaunched: (s: any) => s.passes_attempted_launched,
passesPctLaunched: (s: any) => parseFloat(s.passes_pct_launched || 0),
passesAttemptedGk: (s: any) => s.passes_attempted_gk,
passesThrows: (s: any) => s.passes_throws,
pctPassesLaunched: (s: any) => parseFloat(s.pct_passes_launched || 0),
avgPassLength: (s: any) => parseFloat(s.avg_pass_length || 0),
goalKicksAttempted: (s: any) => s.goal_kicks_attempted,
pctGoalKicksLaunched: (s: any) => parseFloat(s.pct_goal_kicks_launched || 0),
avgGoalKickLength: (s: any) => parseFloat(s.avg_goal_kick_length || 0),
crossesFaced: (s: any) => s.crosses_faced,
crossesStopped: (s: any) => s.crosses_stopped,
crossesStoppedPct: (s: any) => parseFloat(s.crosses_stopped_pct || 0),
defActionsOutsidePenArea: (s: any) => s.def_actions_outside_pen_area,
defActionsOutsidePenAreaPer90: (s: any) => parseFloat(s.def_actions_outside_pen_area_per_90 || 0),
avgDistanceDefActions: (s: any) => parseFloat(s.avg_distance_def_actions || 0),
},
TeamKeeperAdvancedStats: {
goalsAgainst: (s: any) => s.goals_against,
penaltyKicksAllowed: (s: any) => s.penalty_kicks_allowed,
freeKicksAgainst: (s: any) => s.free_kicks_against,
cornerKicksAgainst: (s: any) => s.corner_kicks_against,
ownGoalsAgainst: (s: any) => s.own_goals_against,
psxg: (s: any) => parseFloat(s.psxg || 0),
psxgPerShotOnTarget: (s: any) => parseFloat(s.psxg_per_shot_on_target || 0),
psxgPlusMinus: (s: any) => parseFloat(s.psxg_plus_minus || 0),
psxgPlusMinusPer90: (s: any) => parseFloat(s.psxg_plus_minus_per_90 || 0),
passesCompletedLaunched: (s: any) => s.passes_completed_launched,
passesAttemptedLaunched: (s: any) => s.passes_attempted_launched,
passesPctLaunched: (s: any) => parseFloat(s.passes_pct_launched || 0),
passesAttemptedGk: (s: any) => s.passes_attempted_gk,
passesThrows: (s: any) => s.passes_throws,
pctPassesLaunched: (s: any) => parseFloat(s.pct_passes_launched || 0),
avgPassLength: (s: any) => parseFloat(s.avg_pass_length || 0),
goalKicksAttempted: (s: any) => s.goal_kicks_attempted,
pctGoalKicksLaunched: (s: any) => parseFloat(s.pct_goal_kicks_launched || 0),
avgGoalKickLength: (s: any) => parseFloat(s.avg_goal_kick_length || 0),
crossesFaced: (s: any) => s.crosses_faced,
crossesStopped: (s: any) => s.crosses_stopped,
crossesStoppedPct: (s: any) => parseFloat(s.crosses_stopped_pct || 0),
defActionsOutsidePenArea: (s: any) => s.def_actions_outside_pen_area,
defActionsOutsidePenAreaPer90: (s: any) => parseFloat(s.def_actions_outside_pen_area_per_90 || 0),
avgDistanceDefActions: (s: any) => parseFloat(s.avg_distance_def_actions || 0),
},
};