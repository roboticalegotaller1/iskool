---
title: "Manejadores de Estado de Gamificación (Zustand)"
description: "Documentación detallada de las acciones y estado global en el cliente para la gamificación, RPG y progresión del estudiante."
type: "concept-doc"
tags:
  - store
  - zustand
  - estado
  - gamificacion
  - acciones
zustand_stores:
  - useGamificationStore
  - useStudentStore
  - usePortfolioStore
last_sync: 2026-06-21T05:34:02.143Z
---

# Manejadores de Estado de Gamificación (Zustand)

> [!NOTE]
> Documentación detallada de las acciones y estado global en el cliente para la gamificación, RPG y progresión del estudiante.

## 🧠 Manejadores de Estado (Zustand Stores)

### Store `useGamificationStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`GamificationStoreState`):

```typescript
interface GamificationStoreState {
  missionsList: Mission[];
  questAttempts: QuestAttempt[];
  studentBadges: StudentBadge[];
  guildBoss: GuildBoss;
  guildSubmissions: GuildMemberSubmission[];
  shopArtifacts: ShopArtifact[];
  isLoadingMissions: boolean;
  syncError: string | null;

  // Actions
  submitQuiz: (questId: string, score: number, answers: Record<string, string | number>) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;
  
  submitExam: (
    questId: string,
    score: number,
    answers: Record<string, string | number>,
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;
  
  saveQuest: (subjectId: string, questData: Omit<Quest, 'created_at'> & { id?: string }) => Promise<void>;
  triggerGuildAttack: (damage: number) => Promise<void>;
  resetGuildBoss: () => void;
  submitGuildHomework: (studentId: string, onTime: boolean) => void;
  createArtifact: (artifactData: Omit<ShopArtifact, 'id'>) => Promise<void>;
  unlockBadge: (studentId: string, badgeId: string) => Promise<void>;
  fetchMissions: () => Promise<void>;
  fetchActiveGuildBoss: () => Promise<void>;
  subscribeToGuildChanges: () => () => void;
  resetGamificationStore: () => void;
}
```

### Store `useStudentStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`StudentStoreState`):

```typescript
interface StudentStoreState {
  activeStudentId: string;
  allStats: Record<string, StudentStats>;
  allAvatars: Record<string, StudentAvatar>;
  studentInventoryMap: Record<string, string[]>;
  studentMessages: StudentMessage[];
  isLoadingStats: boolean;
  
  // Actions
  switchStudent: (studentId: string) => Promise<void>;
  changeAvatar: (config: Partial<StudentAvatar>) => void;
  feedPet: () => void;
  playWithPet: () => void;
  levelUpAttribute: (statName: 'strength' | 'intelligence' | 'defense') => Promise<void>;
  purchaseArtifact: (studentId: string, artifactId: string) => Promise<void>;
  grantArtifact: (studentId: string, artifactId: string) => Promise<void>;
  revokeArtifact: (studentId: string, artifactId: string, reason: string) => Promise<void>;
  markStudentMessageAsRead: (messageId: string) => void;
  fetchStats: (groupId?: string) => Promise<void>;
  
  // Cross-store helpers
  addXpAndCoins: (studentId: string, xpEarned: number, coinsEarned: number, levelUpCallback?: (leveledUp: boolean) => void) => void;
  updateStatsAfterExam: (
    studentId: string, 
    xpEarned: number, 
    coinsEarned: number, 
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => void;
  initializeNewStudent: (studentId: string, firstName: string) => void;
  resetStudentStore: () => void;
}
```

### Store `usePortfolioStore`

Gestiona el estado en cliente y sincronización asíncrona mediante políticas de seguridad (RLS).

#### Interfaz del Almacén (`PortfolioStoreState`):

```typescript
interface PortfolioStoreState {
  portfolioItems: PortfolioItem[];
  isLoadingPortfolio: boolean;
  
  // Actions
  submitPortfolioItem: (
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => void;
  
  submitPortfolioItemOnBehalf: (
    studentId: string,
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => void;
  
  addPortfolioFeedback: (itemId: string, text: string, role: FeedbackAuthorRole, authorId: string) => void;
  addReaction: (itemId: string, roleCategory: string, emoji: string) => void;
  
  reviewPortfolioItem: (
    itemId: string,
    status: PortfolioItemStatus,
    comment: string,
    xpAward?: number,
    campos_formativos?: string[],
    pdas?: string[],
    ejes_articuladores?: string[],
    xp_breakdown?: {
      scientific?: number;
      critical?: number;
      collaborative?: number;
      communication?: number;
    }
  ) => void;
  
  linkPortfolioItemToQuest: (itemId: string, questId: string) => void;
  submitPeerReview: (itemId: string, score: number, comment: string) => void;
  fetchPortfolioItems: (groupId?: string) => Promise<void>;
  resetPortfolioStore: () => void;
}
```

