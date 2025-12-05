import { playerResolvers } from './playerResolvers';
import { teamResolvers } from './teamResolvers';

export const resolvers = {
  Query: {
    ...playerResolvers.Query,
    ...teamResolvers.Query,
  },
  Player: playerResolvers.Player,
  PlayerSeasonStats: playerResolvers.PlayerSeasonStats,
  Team: teamResolvers.Team,
  TeamSeasonStats: teamResolvers.TeamSeasonStats,
};