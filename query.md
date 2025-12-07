# 📄 **GraphQL Query Examples for Football Stats API**

## **Basic Queries**

### **Get all available competitions and seasons**

```graphql
query {
  competitions
  seasons
}
```

### **Search for a specific player**

```graphql
query {
  searchPlayers(query: "Messi") {
    id
    name
    nation
    position
    birthYear
  }
}
```

### **Search for a team**

```graphql
query {
  searchTeams(query: "Barcelona") {
    id
    name
    fbrefUrl
  }
}
```

---

## **Player Statistics**

### **Top scorers in Premier League 2024**

```graphql
query {
  topScorers(seasonEndYear: 2024, competition: "Premier League", limit: 10) {
    name
    nation
    position
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      minutes
      xG
      npxG
      goalsPer90
    }
  }
}
```

### **Top assist providers in La Liga 2023**

```graphql
query {
  topAssists(seasonEndYear: 2023, competition: "La Liga", limit: 10) {
    name
    nation
    position
    seasonStats(seasonEndYear: 2023, competition: "La Liga") {
      assists
      goals
      xAG
      assistsPer90
      minutes
    }
  }
}
```

### **Players with highest xG**

```graphql
query {
  topXG(seasonEndYear: 2024, competition: "Premier League", minMinutes: 1000, limit: 15) {
    name
    position
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      xG
      goals
      npxG
      minutes
      xGPer90
    }
  }
}
```

### **Top progressive passers**

```graphql
query {
  topProgressivePasses(
    seasonEndYear: 2023
    competition: "Bundesliga"
    position: "MF"
    minMinutes: 900
    limit: 10
  ) {
    name
    nation
    seasonStats(seasonEndYear: 2023, competition: "Bundesliga") {
      progressivePasses
      progressiveCarries
      assists
      xAG
      minutes
    }
  }
}
```

---

## **Detailed Player Profiles**

### **Complete player profile with career stats**

```graphql
query {
  player(name: "Erling Haaland") {
    id
    name
    nation
    position
    birthYear
    
    currentTeam {
      name
    }
    
    careerStats {
      totalGoals
      totalAssists
      totalMatches
      totalMinutes
      seasonsPlayed
      competitions
      avgGoalsPer90
      avgAssistsPer90
    }
    
    allSeasonStats {
      seasonEndYear
      competition
      team {
        name
      }
      goals
      assists
      minutes
      xG
      npxG
    }
  }
}
```

### **Specific season stats**

```graphql
query {
  player(name: "Mohamed Salah") {
    name
    nation
    position
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      minutes
      matchesPlayed
      xG
      npxG
      xAG
      progressivePasses
      progressiveCarries
      goalsPer90
      assistsPer90
    }
  }
}
```

---

## **Team Queries**

### **Team profile with season stats**

```graphql
query {
  team(name: "Manchester City") {
    id
    name
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      xG
      npxG
      possessionPct
      progressivePasses
      matchesPlayed
      goalsPer90
    }
    
    players(seasonEndYear: 2024) {
      name
      position
      nation
    }
  }
}
```

### **Team leaderboard (goals)**

```graphql
query {
  teamLeaderboard(
    seasonEndYear: 2023
    competition: "La Liga"
    sortBy: GOALS
    limit: 10
  ) {
    name
    seasonStats(seasonEndYear: 2023, competition: "La Liga") {
      goals
      xG
      possessionPct
      matchesPlayed
    }
  }
}
```

### **Team leaderboard (possession)**

```graphql
query {
  teamLeaderboard(
    seasonEndYear: 2024
    competition: "Premier League"
    sortBy: POSSESSION
    limit: 20
  ) {
    name
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      possessionPct
      goals
      xG
      progressivePasses
    }
  }
}
```

---

## **Advanced Queries**

### **Compare multiple players**

```graphql
query {
  playerComparison(playerIds: ["1", "2", "3"], seasonEndYear: 2018) {
    name
    nation
    position
    seasonStats(seasonEndYear: 2018) {
      competition
      goals
      assists
      xG
      npxG
      xAG
      minutes
      goalsPer90
      assistsPer90
    }
  }
}
```

### **List all players from a team**

```graphql
query {
  players(
    teamId: 5
    seasonEndYear: 2023
    limit: 30
  ) {
    name
    position
    nation
    seasonStats(seasonEndYear: 2023) {
      goals
      assists
      minutes
      matchesPlayed
    }
  }
}
```

### **Filter players by position & nationality**

```graphql
query {
  players(
    position: "FW"
    nation: "BRA"
    seasonEndYear: 2024
    competition: "Premier League"
    minMinutes: 500
    limit: 20
  ) {
    name
    currentTeam {
      name
    }
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      xG
      minutes
    }
  }
}
```

### **Team with full season history**

```graphql
query {
  team(name: "Real Madrid") {
    name
    
    allSeasonStats(competition: "La Liga") {
      seasonEndYear
      goals
      xG
      possessionPct
      matchesPlayed
      goalsPer90
    }
  }
}
```

---

## **Analytics Queries**

### **xG overperformers**

```graphql
query {
  topScorers(seasonEndYear: 2024, competition: "Premier League", limit: 20) {
    name
    position
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      xG
      npxG
      minutes
    }
  }
}
```

*(Compute goals − xG on frontend)*

### **Young talents (U23)**

```graphql
query {
  players(
    seasonEndYear: 2024
    competition: "Bundesliga"
    minMinutes: 1000
    limit: 50
  ) {
    name
    birthYear
    position
    seasonStats(seasonEndYear: 2024, competition: "Bundesliga") {
      age
      goals
      assists
      xG
      xAG
      progressiveCarries
      minutes
    }
  }
}
```

### **Attacking defenders**

```graphql
query {
  players(
    position: "DF"
    seasonEndYear: 2023
    competition: "Serie A"
    minMinutes: 1000
    limit: 20
  ) {
    name
    currentTeam {
      name
    }
    seasonStats(seasonEndYear: 2023, competition: "Serie A") {
      goals
      assists
      progressivePasses
      progressiveCarries
      minutes
    }
  }
}
```

---

## **Complex Nested Query**

```graphql
query CompleteAnalysis {
  # Top team
  topTeam: teamLeaderboard(
    seasonEndYear: 2024
    competition: "Premier League"
    sortBy: GOALS
    limit: 1
  ) {
    name
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      xG
      possessionPct
    }
    
    # Team’s players
    players(seasonEndYear: 2024) {
      name
      seasonStats(seasonEndYear: 2024, competition: "Premier League") {
        goals
        assists
        xG
      }
    }
  }
  
  # Top scorer
  topScorer: topScorers(
    seasonEndYear: 2024
    competition: "Premier League"
    limit: 1
  ) {
    name
    currentTeam {
      name
    }
    careerStats {
      totalGoals
      seasonsPlayed
    }
  }
  
  # All competitions
  competitions
}
```

---

## **Example With Variables**

### **Query**

```graphql
query GetTopScorers($season: Int!, $league: String!, $limit: Int!) {
  topScorers(seasonEndYear: $season, competition: $league, limit: $limit) {
    name
    seasonStats(seasonEndYear: $season, competition: $league) {
      goals
      assists
    }
  }
}
```

### **Variables**

```json
{
  "season": 2024,
  "league": "Premier League",
  "limit": 10
}
```

---

## **Player Shooting Stats**

```graphql
query GetPlayerShootingStats {
  player(name: "Erling Haaland") {
    name
    position
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      minutes
    }
    
    shootingStats(seasonEndYear: 2024, competition: "Premier League") {
      shotsStandard
      shotsOnTargetStandard
      shotsOnTargetPctStandard
      shotsPer90Standard
      goalsPerShotStandard
      xgExpected
      goalsMinusXgExpected
    }
  }
}
```

---

## **Player Passing Stats**

```graphql
query GetPlayerPassingStats {
  player(name: "Kevin De Bruyne") {
    name
    position
    
    passingStats(seasonEndYear: 2024, competition: "Premier League") {
      completedTotal
      attemptedTotal
      completionPctTotal
      keyPasses
      passesIntoFinalThird
      passesIntoPenaltyArea
      progressivePasses
      xag
    }
  }
}
```

## **Basic Queries**

### **1. Get Available Data**
```graphql
query GetAvailableData {
  competitions
  seasons
}
```

### **2. Search for a Player**
```graphql
query SearchPlayer {
  searchPlayers(query: "Messi") {
    id
    name
    nation
    position
    birthYear
  }
}
```

### **3. Search for a Team**
```graphql
query SearchTeam {
  searchTeams(query: "Barcelona") {
    id
    name
    fbrefUrl
  }
}
```

---

## **Player Statistics Queries**

### **4. Get Player with Standard Stats**
```graphql
query GetPlayerStandardStats {
  player(name: "Cristiano Ronaldo") {
    id
    name
    nation
    position
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      minutes
      matchesPlayed
      xG
      npxG
      xAG
      goalsPer90
      assistsPer90
    }
  }
}
```

### **5. Get Player with Shooting Stats**
```graphql
query GetPlayerShootingStats {
  player(name: "Erling Haaland") {
    name
    position
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      minutes
    }
    
    shootingStats(seasonEndYear: 2024, competition: "Premier League") {
      shotsStandard
      shotsOnTargetStandard
      shotsOnTargetPctStandard
      shotsPer90Standard
      goalsPerShotStandard
      xgExpected
      goalsMinusXgExpected
    }
  }
}
```

### **6. Get Player with Passing Stats**
```graphql
query GetPlayerPassingStats {
  player(name: "Kevin De Bruyne") {
    name
    position
    
    passingStats(seasonEndYear: 2024, competition: "Premier League") {
      completedTotal
      attemptedTotal
      completionPctTotal
      keyPasses
      passesIntoFinalThird
      passesIntoPenaltyArea
      progressivePasses
      xag
    }
  }
}
```

### **7. Get Player with Defense Stats**
```graphql
query GetPlayerDefenseStats {
  player(name: "Virgil van Dijk") {
    name
    position
    
    defenseStats(seasonEndYear: 2024, competition: "Premier League") {
      tackles
      tacklesWon
      interceptions
      blocks
      clearances
      tacklesPlusInterceptions
      errors
    }
  }
}
```

### **8. Get Player Career Stats**
```graphql
query GetPlayerCareerStats {
  player(name: "Lionel Messi") {
    name
    nation
    
    careerStats {
      totalGoals
      totalAssists
      totalMatches
      totalMinutes
      seasonsPlayed
      competitions
      avgGoalsPer90
      avgAssistsPer90
    }
    
    allSeasonStats(competition: "La Liga") {
      seasonEndYear
      competition
      goals
      assists
      minutes
    }
  }
}
```

### **9. Get Player with ALL Stats Types**
```graphql
query GetPlayerCompleteProfile {
  player(name: "Mohamed Salah") {
    name
    nation
    position
    birthYear
    
    currentTeam {
      name
    }
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      minutes
      xG
    }
    
    shootingStats(seasonEndYear: 2024, competition: "Premier League") {
      shotsStandard
      shotsOnTargetStandard
      goalsMinusXgExpected
    }
    
    passingStats(seasonEndYear: 2024, competition: "Premier League") {
      keyPasses
      progressivePasses
    }
    
    possessionStats(seasonEndYear: 2024, competition: "Premier League") {
      touches
      takeOnsSuccessful
      carries
      progressiveCarries
    }
    
    gcaStats(seasonEndYear: 2024, competition: "Premier League") {
      sca
      scaPer90
      gca
      gcaPer90
    }
  }
}
```

---

## **Top Player Queries**

### **10. Top Scorers**
```graphql
query GetTopScorers {
  topScorers(
    seasonEndYear: 2024
    competition: "Premier League"
    limit: 10
  ) {
    name
    nation
    position
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      minutes
      xG
      goalsPer90
    }
  }
}
```

### **11. Top Assists**
```graphql
query GetTopAssists {
  topAssists(
    seasonEndYear: 2023
    competition: "La Liga"
    limit: 10
  ) {
    name
    nation
    seasonStats(seasonEndYear: 2023, competition: "La Liga") {
      assists
      goals
      xAG
      keyPasses
    }
  }
}
```

### **12. Top xG Players**
```graphql
query GetTopXG {
  topXG(
    seasonEndYear: 2024
    competition: "Bundesliga"
    minMinutes: 1000
    limit: 15
  ) {
    name
    position
    seasonStats(seasonEndYear: 2024, competition: "Bundesliga") {
      goals
      xG
      npxG
      minutes
    }
  }
}
```

### **13. Top Progressive Passers**
```graphql
query GetTopProgressivePasses {
  topProgressivePasses(
    seasonEndYear: 2024
    competition: "Premier League"
    position: "MF"
    minMinutes: 900
    limit: 10
  ) {
    name
    nation
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      progressivePasses
      assists
      xAG
    }
  }
}
```

### **14. Top Shooters**
```graphql
query GetTopShooters {
  topShooters(
    seasonEndYear: 2024
    competition: "Serie A"
    minMinutes: 500
    limit: 10
  ) {
    name
    shootingStats(seasonEndYear: 2024, competition: "Serie A") {
      shotsStandard
      shotsOnTargetStandard
      shotsOnTargetPctStandard
      shotsPer90Standard
    }
  }
}
```

### **15. Top Passers**
```graphql
query GetTopPassers {
  topPassers(
    seasonEndYear: 2024
    competition: "Premier League"
    minMinutes: 1000
    limit: 10
  ) {
    name
    position
    passingStats(seasonEndYear: 2024, competition: "Premier League") {
      completedTotal
      attemptedTotal
      completionPctTotal
      progressivePasses
    }
  }
}
```

### **16. Top Defenders**
```graphql
query GetTopDefenders {
  topDefenders(
    seasonEndYear: 2024
    competition: "Premier League"
    minMinutes: 1000
    limit: 10
  ) {
    name
    position
    defenseStats(seasonEndYear: 2024, competition: "Premier League") {
      tackles
      tacklesWon
      interceptions
      tacklesPlusInterceptions
      blocks
    }
  }
}
```

### **17. Top Dribblers**
```graphql
query GetTopDribblers {
  topDribblers(
    seasonEndYear: 2024
    competition: "Ligue 1"
    minMinutes: 500
    limit: 10
  ) {
    name
    position
    possessionStats(seasonEndYear: 2024, competition: "Ligue 1") {
      takeOnsAttempted
      takeOnsSuccessful
      takeOnsSuccessPct
      progressiveCarries
    }
  }
}
```

### **18. Top Keepers**
```graphql
query GetTopKeepers {
  topKeepers(
    seasonEndYear: 2024
    competition: "Premier League"
    minMinutes: 1000
    limit: 10
  ) {
    name
    nation
    keeperStats(seasonEndYear: 2024, competition: "Premier League") {
      saves
      savePct
      cleanSheets
      cleanSheetPct
      goalsAgainst
      goalsAgainstPer90
    }
  }
}
```

---

## **Team Queries**

### **19. Get Team with Stats**
```graphql
query GetTeamStats {
  team(name: "Manchester City") {
    name
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      xG
      possessionPct
      matchesPlayed
    }
    
    shootingStats(seasonEndYear: 2024, competition: "Premier League") {
      shotsStandard
      shotsOnTargetStandard
      shotsOnTargetPctStandard
    }
    
    passingStats(seasonEndYear: 2024, competition: "Premier League") {
      completedTotal
      completionPctTotal
      progressivePasses
    }
  }
}
```

### **20. Get Team with Players**
```graphql
query GetTeamWithPlayers {
  team(name: "Real Madrid") {
    name
    
    seasonStats(seasonEndYear: 2024, competition: "La Liga") {
      goals
      xG
      possessionPct
    }
    
    players(seasonEndYear: 2024) {
      name
      position
      nation
      seasonStats(seasonEndYear: 2024, competition: "La Liga") {
        goals
        assists
        minutes
      }
    }
  }
}
```

### **21. Team Leaderboard by Goals**
```graphql
query GetTeamLeaderboardByGoals {
  teamLeaderboard(
    seasonEndYear: 2024
    competition: "Premier League"
    sortBy: GOALS
    limit: 20
  ) {
    name
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      xG
      matchesPlayed
    }
  }
}
```

### **22. Team Leaderboard by xG**
```graphql
query GetTeamLeaderboardByXG {
  teamLeaderboard(
    seasonEndYear: 2023
    competition: "La Liga"
    sortBy: XG
    limit: 10
  ) {
    name
    seasonStats(seasonEndYear: 2023, competition: "La Liga") {
      xG
      goals
      goalsMinusXgExpected: xG
    }
  }
}
```

### **23. Team Leaderboard by Possession**
```graphql
query GetTeamLeaderboardByPossession {
  teamLeaderboard(
    seasonEndYear: 2024
    competition: "Premier League"
    sortBy: POSSESSION
    limit: 20
  ) {
    name
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      possessionPct
      goals
      xG
    }
  }
}
```

---

## **Advanced Filtering Queries**

### **24. Filter Players by Multiple Criteria**
```graphql
query FilterPlayers {
  players(
    competition: "Premier League"
    seasonEndYear: 2024
    position: "FW"
    minMinutes: 1000
    limit: 20
  ) {
    name
    nation
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      minutes
      xG
    }
  }
}
```

### **25. Young Players with High Output**
```graphql
query GetYoungTalents {
  players(
    competition: "Bundesliga"
    seasonEndYear: 2024
    minMinutes: 900
    limit: 50
  ) {
    name
    birthYear
    position
    seasonStats(seasonEndYear: 2024, competition: "Bundesliga") {
      age
      goals
      assists
      xG
      minutes
    }
  }
}
```

---

## **Player Comparison**

### **26. Compare Multiple Players**
```graphql
query ComparePlayers {
  playerComparison(
    playerIds: ["123", "456", "789"]
    seasonEndYear: 2024
  ) {
    name
    position
    nation
    
    seasonStats(seasonEndYear: 2024) {
      competition
      goals
      assists
      xG
      npxG
      minutes
      goalsPer90
    }
    
    shootingStats(seasonEndYear: 2024) {
      shotsStandard
      shotsOnTargetPctStandard
      goalsMinusXgExpected
    }
  }
}
```

---

## **Complex Multi-Stats Query**

### **27. Complete Player Analysis**
```graphql
query CompletePlayerAnalysis {
  player(name: "Harry Kane") {
    name
    nation
    position
    birthYear
    
    currentTeam {
      name
    }
    
    # Standard Performance
    seasonStats(seasonEndYear: 2024, competition: "Bundesliga") {
      goals
      assists
      minutes
      matchesPlayed
      xG
      npxG
      xAG
    }
    
    # Shooting Analysis
    shootingStats(seasonEndYear: 2024, competition: "Bundesliga") {
      shotsStandard
      shotsOnTargetStandard
      shotsOnTargetPctStandard
      shotsPer90Standard
      goalsPerShotStandard
      distanceStandard
      goalsMinusXgExpected
    }
    
    # Passing Contribution
    passingStats(seasonEndYear: 2024, competition: "Bundesliga") {
      keyPasses
      passesIntoFinalThird
      passesIntoPenaltyArea
      progressivePasses
      completionPctTotal
    }
    
    # Possession & Dribbling
    possessionStats(seasonEndYear: 2024, competition: "Bundesliga") {
      touches
      touchesAttPen
      takeOnsSuccessful
      takeOnsSuccessPct
      progressiveCarries
    }
    
    # Chance Creation
    gcaStats(seasonEndYear: 2024, competition: "Bundesliga") {
      sca
      scaPer90
      gca
      gcaPer90
    }
    
    # Career Overview
    careerStats {
      totalGoals
      totalAssists
      totalMatches
      seasonsPlayed
      avgGoalsPer90
    }
  }
}
```

---

## **Goalkeeper Specific Queries**

### **28. Goalkeeper Analysis**
```graphql
query GetKeeperAnalysis {
  player(name: "Alisson") {
    name
    position
    
    keeperStats(seasonEndYear: 2024, competition: "Premier League") {
      saves
      savePct
      cleanSheets
      cleanSheetPct
      goalsAgainst
      goalsAgainstPer90
      penaltyKicksSaved
      penaltySavePct
    }
    
    keeperAdvancedStats(seasonEndYear: 2024, competition: "Premier League") {
      psxg
      psxgPlusMinus
      crossesFaced
      crossesStopped
      crossesStoppedPct
      defActionsOutsidePenArea
      avgDistanceDefActions
    }
  }
}
```

---

## **Test All Stat Types**

### **29. Test All Player Stat Types**
```graphql
query TestAllPlayerStatTypes {
  player(id: "1") {
    name
    
    seasonStats(seasonEndYear: 2024) { goals }
    shootingStats(seasonEndYear: 2024) { shotsStandard }
    passingStats(seasonEndYear: 2024) { completedTotal }
    defenseStats(seasonEndYear: 2024) { tackles }
    gcaStats(seasonEndYear: 2024) { sca }
    possessionStats(seasonEndYear: 2024) { touches }
    playingTimeStats(seasonEndYear: 2024) { minutes }
    miscStats(seasonEndYear: 2024) { yellowCards }
    keeperStats(seasonEndYear: 2024) { saves }
    keeperAdvancedStats(seasonEndYear: 2024) { psxg }
  }
}
```

---

## **Performance Testing Query**

### **30. Large Data Fetch (Test DataLoader)**
```graphql
query TestDataLoaderPerformance {
  topScorers(seasonEndYear: 2024, competition: "Premier League", limit: 50) {
    name
    
    currentTeam {
      name
    }
    
    seasonStats(seasonEndYear: 2024, competition: "Premier League") {
      goals
      assists
      xG
    }
    
    shootingStats(seasonEndYear: 2024, competition: "Premier League") {
      shotsStandard
    }
    
    passingStats(seasonEndYear: 2024, competition: "Premier League") {
      keyPasses
    }
  }
}
```
