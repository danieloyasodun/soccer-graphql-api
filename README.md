# ⚽ Soccer Analytics GraphQL API

A high-performance GraphQL API providing comprehensive soccer statistics for Europe's top 5 leagues (2017-2024).

## 🚀 Features

- **100K+ player records** across 500+ teams
- **11 stat categories**: Standard, Shooting, Passing, Defense, Possession, GCA, Playing Time, Misc, Keeper stats
- **Advanced metrics**: xG, xAG, progressive passes, defensive actions
- **Optimized queries**: DataLoader batching, Redis caching, PostgreSQL indexing
- **Real-time analytics**: Top scorers, passers, defenders, keepers

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript, GraphQL (Apollo Server)
- **Database**: PostgreSQL (normalized schema with 20+ tables)
- **Cache**: Redis (TTL-based caching)
- **Infrastructure**: Docker, Docker Compose
- **Data Source**: FBref (7 years of match data)

## 📊 Sample Queries


## 🏗️ Architecture


## 🚀 Getting Started


## 📈 Performance

- Average query response: <100ms
- Cache hit rate: 85%
- Supports 100+ concurrent requests