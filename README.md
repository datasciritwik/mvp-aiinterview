## Sales
---
```mermaid
---
config:
  layout: dagre
---
flowchart LR
 subgraph Inputs["Inputs"]
        SV["Sales Velocity"]
        IL["Inventory Levels"]
        RR["Return Rates"]
        CR["Channel & Region Breakdown"]
        CB["Competitive Benchmarking"]
  end
 subgraph subGraph1["Analysis Techniques"]
        TS["Time-Series Trend Detection"]
        OA["Outlier & Anomaly Identification"]
        CS["Cohort Segmentation"]
        LC["Lifecycle Stage Classification"]
  end
 subgraph subGraph2["SKU Trend Agent"]
        DS["Data Aggregation & Cleansing"]
        subGraph1
  end
 subgraph Outputs["Outputs"]
        FM["Fast-Moving SKU List"]
        UL["Underleveraged SKU Alerts"]
        PO["Promotional Opportunities"]
        AO["Assortment Optimization"]
  end
    Inputs --> DS
    DS --> TS & OA & CS & LC
    TS --> FM
    OA --> UL
    CS --> PO
    LC --> AO

```

## Price
---
```mermaid
flowchart LR
  subgraph Inputs
    A[Historical Sales Volumes]
    B[COGS & Margins]
    C[Competitive Price Intelligence]
    D[Customer Sensitivity & Elasticity]
    E[Promotional & Discount Data]
  end

  subgraph Pricing_Agent
    F[Data Aggregation & Cleansing]
    subgraph Analysis
      G[Elasticity Modeling]
      H[Competitive Price Scanning]
      I[Conjoint Analysis]
      J[Dynamic Pricing Algorithms]
    end
  end

  subgraph Outputs
    K[Tiered Price Recommendations]
    L[Promotional Triggers]
    M[Bundling & Discount Structures]
    N[Price Fence Strategies]
  end

  A & B & C & D & E --> F
  F --> G & H & I & J
  G & H & I & J --> K & L & M & N
```
## Marketing
---
```mermaid
flowchart LR
    A[Data Ingestion] --> B[Data Cleaning]
    B --> C[Feature Engineering]
    C --> D[Segmentation Modeling]
    D --> E[Predictive Scoring]
    E --> F[Gap Analysis]
    F --> G[Attribution Modeling]
    G --> H[Insight & Actions]
    H --> I[API Integration & Sync]
```

## Messaging
---
```mermaid
flowchart TB
  subgraph Data Inputs
    A[Creative Performance Metrics]
    B[Customer Persona Profiles]
    C[A/B & Multivariate Test Results]
    D[Social Listening & Sentiment Analysis]
    E[Competitive Creative Libraries]
  end

  subgraph Analysis Techniques
    F[Messaging Performance Analysis]
    G[A/B & Multivariate Testing]
    H[Sentiment & Trend Mining]
    I[Persona Alignment Scoring]
  end

  subgraph Outputs & Actions
    J[Top Performing Hooks]
    K[Persona Messaging Frameworks]
    L[Channel-Specific Creative Formats]
    M[Occasion & Seasonality Themes]
  end

  A --> F
  B --> I
  C --> G
  D --> H
  E --> F

  F --> N[Aggregate Insights]
  G --> N
  H --> N
  I --> N

  N --> J
  N --> K
  N --> L
  N --> M
  ```

## Product/Assortment Agent
---
```mermaid
flowchart LR
  subgraph Inputs
    A[Product Catalog Metadata]
    B[Historical Sales & Demand Signals]
    C[Supply Chain Constraints]
    D[Consumer Feedback]
    E[Competitive Assortment Benchmarks]
  end

  subgraph Ingestion
    F[Data Extraction & Cleansing]
    G[Feature Engineering]
  end

  subgraph Analysis
    H[Demand Forecasting]
    I[ABC/XYZ Classification]
    J[Attribute Preference Modeling]
    K[Cannibalization & Complementarity Analysis]
  end

  subgraph Outputs
    L[Assortment Prioritization List]
    M[Out-of-Stock Risk Alerts]
    N[Rationalization Suggestions]
    O[Bundle & Cross-Sell Ideas]
  end

  subgraph Integration & Feedback Loop
    P[ERP/PIM Sync]
    Q[Dashboard Alerts to Merchandisers]
    R[Model Retraining]
  end

  %% Data flow arrows
  A --> F
  B --> F
  C --> F
  D --> F
  E --> F

  F --> G

  G --> H
  G --> I
  G --> J
  G --> K

  H --> L
  I --> L
  J --> L
  K --> L

  H --> M
  I --> N
  K --> O

  L --> P
  M --> Q
  N --> Q
  O --> Q

  P --> R
  Q --> R
  R --> F
```

## Complete flow
---
```mermaid
flowchart LR
  %% Data Sources
  subgraph Data_Sources [Data Sources]
    A1[Product Catalog]
    A2[Sales & Demand Data]
    A3[Supply Chain Info]
    A4[Customer Behavior & Feedback]
    A5[Market Benchmarks]
  end

  %% Core Agents
  subgraph Agents [AI Agents]
    B1[Product / Assortment Agent]
    B2[Pricing Agent]
    B3[Merchandising Agent]
    B4[Messaging Agent]
    B5[Personalization & Recommender Agent]
  end

  %% Orchestration Layer
  subgraph Orchestration [Orchestration Layer]
    C1[Decision Engine]
    C2[Content & Layout Manager]
    C3[API Gateway]
  end

  %% Landing Page Components
  subgraph Landing_Page [Landing Page]
    D1[Personalized Hero Banner]
    D2[Recommended Products Carousel]
    D3[Dynamic Pricing & Offers]
    D4[Targeted Messaging Blocks]
    D5[Cross-sell Bundles]
  end

  %% Data flows into Agents
  A1 --> B1
  A2 --> B1
  A3 --> B1
  A4 --> B1
  A5 --> B1

  A1 --> B2
  A2 --> B2
  A3 --> B2

  A1 --> B3
  B1 --> B3

  A4 --> B4

  B1 --> B5
  B2 --> B5
  B3 --> B5
  B4 --> B5

  %% Agents feed Orchestration
  B1 --> C1
  B2 --> C1
  B3 --> C1
  B4 --> C1
  B5 --> C1

  C1 --> C2
  C2 --> C3

  %% Orchestration to Landing Page
  C3 --> D1
  C3 --> D2
  C3 --> D3
  C3 --> D4
  C3 --> D5
```
