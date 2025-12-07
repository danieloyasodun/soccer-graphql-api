import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Team {
    id: ID!
    name: String!
    fbrefUrl: String
    
    # Standard stats
    seasonStats(seasonEndYear: Int!, competition: String): TeamSeasonStats
    allSeasonStats(competition: String): [TeamSeasonStats!]!
    
    # Additional stats (NEW)
    shootingStats(seasonEndYear: Int!, competition: String): TeamShootingStats
    passingStats(seasonEndYear: Int!, competition: String): TeamPassingStats
    defenseStats(seasonEndYear: Int!, competition: String): TeamDefenseStats
    gcaStats(seasonEndYear: Int!, competition: String): TeamGCAStats
    possessionStats(seasonEndYear: Int!, competition: String): TeamPossessionStats
    playingTimeStats(seasonEndYear: Int!, competition: String): TeamPlayingTimeStats
    miscStats(seasonEndYear: Int!, competition: String): TeamMiscStats
    keeperStats(seasonEndYear: Int!, competition: String): TeamKeeperStats
    keeperAdvancedStats(seasonEndYear: Int!, competition: String): TeamKeeperAdvancedStats
    passingTypeStats(seasonEndYear: Int!, competition: String): TeamPassingTypeStats
    
    players(seasonEndYear: Int, position: String): [Player!]!
  }

  type Player {
    id: ID!
    name: String!
    nation: String
    position: String
    age: Int
    fbrefUrl: String
    
    currentTeam: Team
    
    # Standard stats
    seasonStats(seasonEndYear: Int!, competition: String): PlayerSeasonStats
    allSeasonStats(competition: String): [PlayerSeasonStats!]!
    careerStats: PlayerCareerStats!
    
    # Additional stats (NEW)
    shootingStats(seasonEndYear: Int!, competition: String): PlayerShootingStats
    passingStats(seasonEndYear: Int!, competition: String): PlayerPassingStats
    defenseStats(seasonEndYear: Int!, competition: String): PlayerDefenseStats
    gcaStats(seasonEndYear: Int!, competition: String): PlayerGCAStats
    possessionStats(seasonEndYear: Int!, competition: String): PlayerPossessionStats
    playingTimeStats(seasonEndYear: Int!, competition: String): PlayerPlayingTimeStats
    miscStats(seasonEndYear: Int!, competition: String): PlayerMiscStats
    keeperStats(seasonEndYear: Int!, competition: String): PlayerKeeperStats
    keeperAdvancedStats(seasonEndYear: Int!, competition: String): PlayerKeeperAdvancedStats
    passingTypeStats(seasonEndYear: Int!, competition: String): PlayerPassingTypeStats
  }

  # Existing types remain the same...
  type PlayerSeasonStats {
    id: ID!
    player: Player!
    team: Team!
    seasonEndYear: Int!
    competition: String!
    age: Int
    position: String
    
    matchesPlayed: Int!
    starts: Int!
    minutes: Int!
    minutesPer90: Float!
    
    goals: Int!
    assists: Int!
    goalsAssists: Int!
    goalsPK: Int!
    penaltiesMade: Int!
    penaltiesAttempted: Int!
    yellowCards: Int!
    redCards: Int!
    
    xG: Float!
    npxG: Float!
    xAG: Float!
    npxGxAG: Float!
    
    progressiveCarries: Int!
    progressivePasses: Int!
    progressiveReceptions: Int!
    
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
    teamOrOpponent: String!
    
    numPlayers: Int
    averageAge: Float
    possessionPct: Float
    
    matchesPlayed: Int!
    minutes: Int!
    
    goals: Int!
    assists: Int!
    goalsAssists: Int!
    goalsPK: Int!
    penaltiesMade: Int!
    penaltiesAttempted: Int!
    yellowCards: Int!
    redCards: Int!
    
    xG: Float!
    npxG: Float!
    xAG: Float!
    npxGxAG: Float!
    
    progressiveCarries: Int!
    progressivePasses: Int!
    
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

  # ======================================
  # NEW STAT TYPES
  # ======================================

  # Shooting Stats
  type PlayerShootingStats {
    goalsStandard: Int!
    shotsStandard: Int!
    shotsOnTargetStandard: Int!
    shotsOnTargetPctStandard: Float!
    shotsPer90Standard: Float!
    shotsOnTargetPer90Standard: Float!
    goalsPerShotStandard: Float!
    goalsPerShotOnTargetStandard: Float!
    distanceStandard: Float!
    freeKicksStandard: Int!
    penaltiesStandard: Int!
    penaltiesAttemptedStandard: Int!
    xgExpected: Float!
    npxgExpected: Float!
    npxgPerShotExpected: Float!
    goalsMinusXgExpected: Float!
    npGoalsMinusXgExpected: Float!
  }

  type TeamShootingStats {
    goalsStandard: Int!
    shotsStandard: Int!
    shotsOnTargetStandard: Int!
    shotsOnTargetPctStandard: Float!
    shotsPer90Standard: Float!
    shotsOnTargetPer90Standard: Float!
    goalsPerShotStandard: Float!
    goalsPerShotOnTargetStandard: Float!
    distanceStandard: Float!
    freeKicksStandard: Int!
    penaltiesStandard: Int!
    penaltiesAttemptedStandard: Int!
    xgExpected: Float!
    npxgExpected: Float!
    npxgPerShotExpected: Float!
    goalsMinusXgExpected: Float!
    npGoalsMinusXgExpected: Float!
  }

  # Passing Stats
  type PlayerPassingStats {
    completedTotal: Int!
    attemptedTotal: Int!
    completionPctTotal: Float!
    totalDistance: Int!
    progressiveDistance: Int!
    completedShort: Int!
    attemptedShort: Int!
    completionPctShort: Float!
    completedMedium: Int!
    attemptedMedium: Int!
    completionPctMedium: Float!
    completedLong: Int!
    attemptedLong: Int!
    completionPctLong: Float!
    assists: Int!
    xag: Float!
    xaExpected: Float!
    assistsMinusXag: Float!
    keyPasses: Int!
    passesIntoFinalThird: Int!
    passesIntoPenaltyArea: Int!
    crossesIntoPenaltyArea: Int!
    progressivePasses: Int!
  }

  type TeamPassingStats {
    completedTotal: Int!
    attemptedTotal: Int!
    completionPctTotal: Float!
    totalDistance: Int!
    progressiveDistance: Int!
    completedShort: Int!
    attemptedShort: Int!
    completionPctShort: Float!
    completedMedium: Int!
    attemptedMedium: Int!
    completionPctMedium: Float!
    completedLong: Int!
    attemptedLong: Int!
    completionPctLong: Float!
    assists: Int!
    xag: Float!
    xaExpected: Float!
    assistsMinusXag: Float!
    keyPasses: Int!
    passesIntoFinalThird: Int!
    passesIntoPenaltyArea: Int!
    crossesIntoPenaltyArea: Int!
    progressivePasses: Int!
  }

  # Defense Stats
  type PlayerDefenseStats {
    tackles: Int!
    tacklesWon: Int!
    tacklesDef3rd: Int!
    tacklesMid3rd: Int!
    tacklesAtt3rd: Int!
    challengeTackles: Int!
    challengesAttempted: Int!
    challengeTacklesPct: Float!
    challengesLost: Int!
    blocks: Int!
    shotsBlocked: Int!
    passesBlocked: Int!
    interceptions: Int!
    tacklesPlusInterceptions: Int!
    clearances: Int!
    errors: Int!
  }

  type TeamDefenseStats {
    tackles: Int!
    tacklesWon: Int!
    tacklesDef3rd: Int!
    tacklesMid3rd: Int!
    tacklesAtt3rd: Int!
    challengeTackles: Int!
    challengesAttempted: Int!
    challengeTacklesPct: Float!
    challengesLost: Int!
    blocks: Int!
    shotsBlocked: Int!
    passesBlocked: Int!
    interceptions: Int!
    tacklesPlusInterceptions: Int!
    clearances: Int!
    errors: Int!
  }

  # GCA Stats
  type PlayerGCAStats {
    sca: Int!
    scaPer90: Float!
    scaPassLive: Int!
    scaPassDead: Int!
    scaTakeOn: Int!
    scaShot: Int!
    scaFouled: Int!
    scaDefense: Int!
    gca: Int!
    gcaPer90: Float!
    gcaPassLive: Int!
    gcaPassDead: Int!
    gcaTakeOn: Int!
    gcaShot: Int!
    gcaFouled: Int!
    gcaDefense: Int!
  }

  type TeamGCAStats {
    sca: Int!
    scaPer90: Float!
    scaPassLive: Int!
    scaPassDead: Int!
    scaTakeOn: Int!
    scaShot: Int!
    scaFouled: Int!
    scaDefense: Int!
    gca: Int!
    gcaPer90: Float!
    gcaPassLive: Int!
    gcaPassDead: Int!
    gcaTakeOn: Int!
    gcaShot: Int!
    gcaFouled: Int!
    gcaDefense: Int!
  }

  # Possession Stats
  type PlayerPossessionStats {
    touches: Int!
    touchesDefPen: Int!
    touchesDef3rd: Int!
    touchesMid3rd: Int!
    touchesAtt3rd: Int!
    touchesAttPen: Int!
    touchesLive: Int!
    takeOnsAttempted: Int!
    takeOnsSuccessful: Int!
    takeOnsSuccessPct: Float!
    takeOnsTackled: Int!
    takeOnsTackledPct: Float!
    carries: Int!
    carriesTotalDistance: Int!
    carriesProgressiveDistance: Int!
    progressiveCarries: Int!
    carriesIntoFinalThird: Int!
    carriesIntoPenaltyArea: Int!
    miscontrols: Int!
    dispossessed: Int!
    passesReceived: Int!
    progressivePassesReceived: Int!
  }

  type TeamPossessionStats {
    touches: Int!
    touchesDefPen: Int!
    touchesDef3rd: Int!
    touchesMid3rd: Int!
    touchesAtt3rd: Int!
    touchesAttPen: Int!
    touchesLive: Int!
    takeOnsAttempted: Int!
    takeOnsSuccessful: Int!
    takeOnsSuccessPct: Float!
    takeOnsTackled: Int!
    takeOnsTackledPct: Float!
    carries: Int!
    carriesTotalDistance: Int!
    carriesProgressiveDistance: Int!
    progressiveCarries: Int!
    carriesIntoFinalThird: Int!
    carriesIntoPenaltyArea: Int!
    miscontrols: Int!
    dispossessed: Int!
    passesReceived: Int!
    progressivePassesReceived: Int!
  }

  # Playing Time Stats
  type PlayerPlayingTimeStats {
    matchesPlayed: Int!
    minutes: Int!
    minutesPerMatch: Float!
    minutesPct: Float!
    minutesPer90: Float!
    starts: Int!
    minutesPerStart: Float!
    completeMatches: Int!
    subs: Int!
    minutesPerSub: Float!
    unusedSub: Int!
    pointsPerMatch: Float!
    onGoalsFor: Int!
    onGoalsAgainst: Int!
    plusMinus: Int!
    plusMinusPer90: Float!
    onOff: Float!
    onXg: Float!
    onXga: Float!
    xgPlusMinus: Float!
    xgPlusMinusPer90: Float!
    xgOnOff: Float!
  }

  type TeamPlayingTimeStats {
    matchesPlayed: Int!
    minutes: Int!
    minutesPerMatch: Float!
    minutesPct: Float!
    minutesPer90: Float!
    starts: Int!
    minutesPerStart: Float!
    completeMatches: Int!
    subs: Int!
    minutesPerSub: Float!
    unusedSub: Int!
    pointsPerMatch: Float!
    onGoalsFor: Int!
    onGoalsAgainst: Int!
    plusMinus: Int!
    plusMinusPer90: Float!
    onXg: Float!
    onXga: Float!
    xgPlusMinus: Float!
    xgPlusMinusPer90: Float!
  }

  # Misc Stats
  type PlayerMiscStats {
    yellowCards: Int!
    redCards: Int!
    secondYellow: Int!
    foulsCommitted: Int!
    foulsDrawn: Int!
    offsides: Int!
    crosses: Int!
    interceptions: Int!
    tacklesWon: Int!
    penaltyKicksWon: Int!
    penaltyKicksConceded: Int!
    ownGoals: Int!
    ballRecoveries: Int!
    aerialsWon: Int!
    aerialsLost: Int!
    aerialsWonPct: Float!
  }

  type TeamMiscStats {
    yellowCards: Int!
    redCards: Int!
    secondYellow: Int!
    foulsCommitted: Int!
    foulsDrawn: Int!
    offsides: Int!
    crosses: Int!
    interceptions: Int!
    tacklesWon: Int!
    penaltyKicksWon: Int!
    penaltyKicksConceded: Int!
    ownGoals: Int!
    ballRecoveries: Int!
    aerialsWon: Int!
    aerialsLost: Int!
    aerialsWonPct: Float!
  }

  # Keeper Stats
  type PlayerKeeperStats {
    matchesPlayed: Int!
    starts: Int!
    minutes: Int!
    minutesPer90: Float!
    goalsAgainst: Int!
    goalsAgainstPer90: Float!
    shotsOnTargetAgainst: Int!
    saves: Int!
    savePct: Float!
    wins: Int!
    draws: Int!
    losses: Int!
    cleanSheets: Int!
    cleanSheetPct: Float!
    penaltyKicksAttempted: Int!
    penaltyKicksAllowed: Int!
    penaltyKicksSaved: Int!
    penaltyKicksMissed: Int!
    penaltySavePct: Float!
  }

  type TeamKeeperStats {
    matchesPlayed: Int!
    starts: Int!
    minutes: Int!
    minutesPer90: Float!
    goalsAgainst: Int!
    goalsAgainstPer90: Float!
    shotsOnTargetAgainst: Int!
    saves: Int!
    savePct: Float!
    wins: Int!
    draws: Int!
    losses: Int!
    cleanSheets: Int!
    cleanSheetPct: Float!
    penaltyKicksAttempted: Int!
    penaltyKicksAllowed: Int!
    penaltyKicksSaved: Int!
    penaltyKicksMissed: Int!
    penaltySavePct: Float!
  }

  # Keeper Advanced Stats
  type PlayerKeeperAdvancedStats {
    goalsAgainst: Int!
    penaltyKicksAllowed: Int!
    freeKicksAgainst: Int!
    cornerKicksAgainst: Int!
    ownGoalsAgainst: Int!
    psxg: Float!
    psxgPerShotOnTarget: Float!
    psxgPlusMinus: Float!
    psxgPlusMinusPer90: Float!
    passesCompletedLaunched: Int!
    passesAttemptedLaunched: Int!
    passesPctLaunched: Float!
    passesAttemptedGk: Int!
    passesThrows: Int!
    pctPassesLaunched: Float!
    avgPassLength: Float!
    goalKicksAttempted: Int!
    pctGoalKicksLaunched: Float!
    avgGoalKickLength: Float!
    crossesFaced: Int!
    crossesStopped: Int!
    crossesStoppedPct: Float!
    defActionsOutsidePenArea: Int!
    defActionsOutsidePenAreaPer90: Float!
    avgDistanceDefActions: Float!
  }

  type TeamKeeperAdvancedStats {
    goalsAgainst: Int!
    penaltyKicksAllowed: Int!
    freeKicksAgainst: Int!
    cornerKicksAgainst: Int!
    ownGoalsAgainst: Int!
    psxg: Float!
    psxgPerShotOnTarget: Float!
    psxgPlusMinus: Float!
    psxgPlusMinusPer90: Float!
    passesCompletedLaunched: Int!
    passesAttemptedLaunched: Int!
    passesPctLaunched: Float!
    passesAttemptedGk: Int!
    passesThrows: Int!
    pctPassesLaunched: Float!
    avgPassLength: Float!
    goalKicksAttempted: Int!
    pctGoalKicksLaunched: Float!
    avgGoalKickLength: Float!
    crossesFaced: Int!
    crossesStopped: Int!
    crossesStoppedPct: Float!
    defActionsOutsidePenArea: Int!
    defActionsOutsidePenAreaPer90: Float!
    avgDistanceDefActions: Float!
  }

  # Passing Type Stats (NEW)
  type PlayerPassingTypeStats {
    live_pass: Int
    dead_pass: Int
    fk_pass: Int
    tb_pass: Int
    sw_pass: Int
    crs_pass: Int
    ti_pass: Int
    ck_pass: Int
    in_corner: Int
    out_corner: Int
    str_corner: Int
    cmp_outcomes: Int
    off_outcomes: Int
    blocks_outcomes: Int
    mins_per_90: Float
    att: Int
  }

  type TeamPassingTypeStats {
    live_pass: Int
    dead_pass: Int
    fk_pass: Int
    tb_pass: Int
    sw_pass: Int
    crs_pass: Int
    ti_pass: Int
    ck_pass: Int
    in_corner: Int
    out_corner: Int
    str_corner: Int
    cmp_outcomes: Int
    off_outcomes: Int
    blocks_outcomes: Int
    mins_per_90: Float
    att: Int
  }

  # Existing Query types...
  type Query {
    player(id: ID, name: String): Player
    team(id: ID, name: String): Team
    
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
    
    searchPlayers(query: String!): [Player!]!
    searchTeams(query: String!): [Team!]!
    
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
    
    # NEW: Additional top queries
    topShooters(
      seasonEndYear: Int!
      competition: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topPassers(
      seasonEndYear: Int!
      competition: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topDefenders(
      seasonEndYear: Int!
      competition: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topDribblers(
      seasonEndYear: Int!
      competition: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    topKeepers(
      seasonEndYear: Int!
      competition: String
      minMinutes: Int = 500
      limit: Int = 20
    ): [Player!]!
    
    teamLeaderboard(
      seasonEndYear: Int!
      competition: String!
      sortBy: TeamStatType = GOALS
      limit: Int = 20
    ): [Team!]!
    
    playerComparison(playerIds: [ID!]!, seasonEndYear: Int!): [Player!]!

    playerPassingTypeStats(playerSeasonStatId: Int!): PlayerPassingTypeStats
    teamPassingTypeStats(teamSeasonStatId: Int!): TeamPassingTypeStats
    
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