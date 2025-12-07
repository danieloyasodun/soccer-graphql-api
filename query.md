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
