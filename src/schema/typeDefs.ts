import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Team {
    id: ID!
    name: String!
    fbrefUrl: String
    
    # Team stats for a specific season
    seasonStats(seasonEndYear: Int!, competition: String): TeamSeasonStats
    
    # All seasons this team has data for
    allSeasonStats(competition: String): [TeamSeasonStats!]!
    
    # Players who played for this team
    players(seasonEndYear: Int, position: String): [Player!]!
  }

  type Player {
    id: ID!
    name: String!
    nation: String
    position: String
    birthYear: Int
    age: Int
    fbrefUrl: String
    
    # Current/most recent team
    currentTeam: Team
    
    # Stats for a specific season
    seasonStats(seasonEndYear: Int!, competition: String): PlayerSeasonStats
    
    # All seasons this player has data for
    allSeasonStats(competition: String): [PlayerSeasonStats!]!
    
    # Career aggregated stats
    careerStats: PlayerCareerStats!
  }

  type PlayerSeasonStats {
    id: ID!
    player: Player!
    team: Team!
    seasonEndYear: Int!
    competition: String!
    age: Int
    position: String
    
    # Playing time
    matchesPlayed: Int!
    starts: Int!
    minutes: Int!
    minutesPer90: Float!
    
    # Performance
    goals: Int!
    assists: Int!
    goalsAssists: Int!
    goalsPK: Int!
    penaltiesMade: Int!
    penaltiesAttempted: Int!
    yellowCards: Int!
    redCards: Int!
    
    # Expected stats
    xG: Float!
    npxG: Float!
    xAG: Float!
    npxGxAG: Float!
    
    # Progression
    progressiveCarries: Int!
    progressivePasses: Int!
    progressiveReceptions: Int!
    
    # Per 90 stats
    goalsPer90: Float!
    assistsPer90: Float!
    goalsAssistsPer90: Float!
    xGPer90: Float!
    xAGPer90: Float!
  }

  type TeamSeasonStats {
    id: ID!
    team: Team!
    seasonEndYear: Int!
    competition: String!
    teamOrOpponent: String! # "team" or "opponent"
    
    numPlayers: Int
    averageAge: Float
    possessionPct: Float
    
    # Playing time
    matchesPlayed: Int!
    minutes: Int!
    
    # Performance
    goals: Int!
    assists: Int!
    goalsAssists: Int!
    goalsPK: Int!
    penaltiesMade: Int!
    penaltiesAttempted: Int!
    yellowCards: Int!
    redCards: Int!
    
    # Expected stats
    xG: Float!
    npxG: Float!
    xAG: Float!
    npxGxAG: Float!
    
    # Progression
    progressiveCarries: Int!
    progressivePasses: Int!
    
    # Per 90 stats
    goalsPer90: Float!
    assistsPer90: Float!
    xGPer90: Float!
  }

  type PlayerCareerStats {
    totalGoals: Int!
    totalAssists: Int!
    totalMatches: Int!
    totalMinutes: Int!
    seasonsPlayed: Int!
    competitions: [String!]!
    avgGoalsPer90: Float!
    avgAssistsPer90: Float!
  }

  type Query {
    # Single entities
    player(id: ID, name: String): Player
    team(id: ID, name: String): Team
    
    # Lists with filtering
    players(
      teamId: ID
      competition: String
      seasonEndYear: Int
      position: String
      nation: String
      minMinutes: Int
      limit: Int = 20
      offset: Int = 0
    ): [Player!]!
    
    teams(
      competition: String
      limit: Int = 20
      offset: Int = 0
    ): [Team!]!
    
    # Search
    searchPlayers(query: String!): [Player!]!
    searchTeams(query: String!): [Team!]!
    
    # Analytics & Rankings
    topScorers(
      seasonEndYear: Int!
      competition: String
      position: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topAssists(
      seasonEndYear: Int!
      competition: String
      position: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topXG(
      seasonEndYear: Int!
      competition: String
      position: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topProgressivePasses(
      seasonEndYear: Int!
      competition: String
      position: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    # Team analytics
    teamLeaderboard(
      seasonEndYear: Int!
      competition: String!
      sortBy: TeamStatType = GOALS
      limit: Int = 20
    ): [Team!]!
    
    # Advanced queries
    playerComparison(playerIds: [ID!]!, seasonEndYear: Int!): [Player!]!
    
    # Stats
    competitions: [String!]!
    seasons: [Int!]!
  }

  enum TeamStatType {
    GOALS
    XG
    POSSESSION
    PROGRESSIVE_PASSES
  }
`;