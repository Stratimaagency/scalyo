# Scalyo — Database Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    COMPANY {
        BIGINT id PK
        VARCHAR name
        VARCHAR plan "Starter - Growth - Elite"
        DECIMAL arr "Annual Recurring Revenue"
        DECIMAL churn "Churn percentage"
        INTEGER nps "Net Promoter Score"
        VARCHAR color "Brand color hex"
        DATETIME created_at
        DATETIME updated_at
    }

    USER {
        BIGINT id PK
        INTEGER company_id FK "Company CASCADE nullable"
        VARCHAR username
        VARCHAR email
        VARCHAR password "hashed"
        VARCHAR role "manager or csm"
        VARCHAR display_name
        VARCHAR language "fr - en - kr"
        VARCHAR theme "dark - light"
        VARCHAR currency "EUR - USD - GBP - CHF - CAD"
    }

    NOTIFICATION_PREFERENCES {
        BIGINT id PK
        INTEGER user_id FK "User OneToOne CASCADE"
        BOOLEAN churn_alerts "default True"
        BOOLEAN weekly_report "default True"
        BOOLEAN wellbeing_alerts "default True"
        BOOLEAN renewal_alerts "default True"
    }

    ACCOUNT {
        BIGINT id PK
        INTEGER company_id FK "Company CASCADE"
        VARCHAR name
        VARCHAR csm "CSM name assigned"
        DECIMAL arr "Monthly Recurring Revenue"
        INTEGER health "0-100 health score"
        VARCHAR risk "low - medium - critical"
        VARCHAR plan "Client plan"
        VARCHAR contact "Primary contact name"
        VARCHAR contact_email
        JSON issues "Array of issue objects"
        TEXT notes
        DATE onboarding_date "nullable"
        DATE renewal_date "nullable"
        DATETIME created_at
        DATETIME updated_at
    }

    ACCOUNT_TODO {
        BIGINT id PK
        INTEGER account_id FK "Account CASCADE"
        INTEGER company_id FK "Company CASCADE"
        VARCHAR text "Todo description"
        BOOLEAN done "default False"
        DATETIME created_at
    }

    KPI_DATA {
        BIGINT id PK
        INTEGER company_id FK "Company CASCADE"
        VARCHAR period "e.g. 2025-03"
        JSON kpis "mrr churned nps etc"
        JSON goals "mrr churned nps etc"
        JSON custom_kpis "Array of custom KPI objects"
        JSON history "Historical tracking data"
        DATETIME created_at
        DATETIME updated_at
    }

    TASK_BOARD {
        BIGINT id PK
        INTEGER company_id FK "Company OneToOne CASCADE"
        JSON tasks "Array of task objects"
        DATETIME created_at
        DATETIME updated_at
    }

    CALENDAR_EVENTS {
        BIGINT id PK
        INTEGER company_id FK "Company OneToOne CASCADE"
        JSON events "Array of event objects"
        DATETIME created_at
        DATETIME updated_at
    }

    WELLBEING {
        BIGINT id PK
        INTEGER company_id FK "Company OneToOne CASCADE"
        INTEGER score "0-100 team wellbeing score"
        VARCHAR burnout "none - low - moderate - high"
        INTEGER charge "0-100 workload percentage"
        VARCHAR trend "e.g. plus5 minus3"
        JSON alerts "Array of alert objects"
        JSON team "Array of team member data"
        DATETIME created_at
        DATETIME updated_at
    }

    ROADMAP {
        BIGINT id PK
        INTEGER company_id FK "Company OneToOne CASCADE"
        VARCHAR phase "e.g. Phase 1 Launch"
        INTEGER progress "0-100 percentage"
        JSON items "Array of text and done"
        DATETIME created_at
        DATETIME updated_at
    }

    COACH_CONVERSATION {
        BIGINT id PK
        INTEGER user_id FK "User CASCADE"
        JSON messages "Array of role and content"
        DATETIME created_at
        DATETIME updated_at
    }

    FEEDBACK {
        BIGINT id PK
        INTEGER user_id FK "User CASCADE"
        VARCHAR category "bug - feature - improvement - other"
        INTEGER rating "1-5"
        TEXT description
        DATETIME created_at
    }

    COMPANY ||--o{ USER : "has many"
    COMPANY ||--o{ ACCOUNT : "has many"
    COMPANY ||--o{ KPI_DATA : "has many"
    COMPANY ||--|| TASK_BOARD : "has one"
    COMPANY ||--|| CALENDAR_EVENTS : "has one"
    COMPANY ||--|| WELLBEING : "has one"
    COMPANY ||--|| ROADMAP : "has one"

    ACCOUNT ||--o{ ACCOUNT_TODO : "has many"

    USER ||--|| NOTIFICATION_PREFERENCES : "has one"
    USER ||--o{ COACH_CONVERSATION : "has many"
    USER ||--o{ FEEDBACK : "has many"
```

## Relationships Summary

| Parent | Relation | Child |
|--------|----------|-------|
| Company | 1 : N | User |
| Company | 1 : N | Account |
| Company | 1 : N | KPI_Data |
| Company | 1 : 1 | Task_Board |
| Company | 1 : 1 | Calendar_Events |
| Company | 1 : 1 | Wellbeing |
| Company | 1 : 1 | Roadmap |
| Account | 1 : N | Account_Todo |
| User | 1 : 1 | Notification_Preferences |
| User | 1 : N | Coach_Conversation |
| User | 1 : N | Feedback |
