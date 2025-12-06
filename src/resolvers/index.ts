import { playerResolvers } from './playerResolvers';
import { teamResolvers } from './teamResolvers';
import { additionalStatsResolvers } from './additionalStatsResolvers';
import { passingTypeResolvers } from './passingTypeResolver';

export const resolvers = {
  Query: {
    ...playerResolvers.Query,
    ...teamResolvers.Query,
    ...additionalStatsResolvers.Query,
    ...passingTypeResolvers.Query,
  },
  Player: {
    ...playerResolvers.Player,
    ...additionalStatsResolvers.Player,
    ...passingTypeResolvers.Player,
  },
  PlayerSeasonStats: playerResolvers.PlayerSeasonStats,
  Team: {
    ...teamResolvers.Team,
    ...additionalStatsResolvers.Team,
    ...passingTypeResolvers.Team,
  },
  TeamSeasonStats: teamResolvers.TeamSeasonStats,
  
  // Additional stat type resolvers
  PlayerShootingStats: additionalStatsResolvers.PlayerShootingStats,
  TeamShootingStats: additionalStatsResolvers.TeamShootingStats,

  PlayerPassingStats: additionalStatsResolvers.PlayerPassingStats,
  TeamPassingStats: additionalStatsResolvers.TeamPassingStats,

  PlayerDefenseStats: additionalStatsResolvers.PlayerDefenseStats,
  TeamDefenseStats: additionalStatsResolvers.TeamDefenseStats,

  PlayerGCAStats: additionalStatsResolvers.PlayerGCAStats,
  TeamGCAStats: additionalStatsResolvers.TeamGCAStats,
  
  PlayerPossessionStats: additionalStatsResolvers.PlayerPossessionStats,
  TeamPossessionStats: additionalStatsResolvers.TeamPossessionStats,
  
  PlayerPlayingTimeStats: additionalStatsResolvers.PlayerPlayingTimeStats,
  TeamPlayingTimeStats: additionalStatsResolvers.TeamPlayingTimeStats,
  
  PlayerMiscStats: additionalStatsResolvers.PlayerMiscStats,
  TeamMiscStats: additionalStatsResolvers.TeamMiscStats,
  
  PlayerKeeperStats: additionalStatsResolvers.PlayerKeeperStats,
  TeamKeeperStats: additionalStatsResolvers.TeamKeeperStats,
  
  PlayerKeeperAdvancedStats: additionalStatsResolvers.PlayerKeeperAdvancedStats,
  TeamKeeperAdvancedStats: additionalStatsResolvers.TeamKeeperAdvancedStats,
};