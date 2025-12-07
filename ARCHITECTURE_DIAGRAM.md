# Architecture Comparison: Before vs After

## BEFORE (Conditional Rendering)

```
┌─────────────────────────────────────────────────┐
│              Home Page (/)                      │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Component State                         │  │
│  │  • showResults: false                    │  │
│  │  • testResults: null                     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Conditional Rendering:                  │  │
│  │                                          │  │
│  │  {showResults ? (                        │  │
│  │    <Results ... />                       │  │
│  │  ) : (                                   │  │
│  │    <TypingParagraph ... />               │  │
│  │  )}                                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │
                     │ User clicks profile
                     ↓
┌─────────────────────────────────────────────────┐
│         Profile Page (/profile/user)            │
│         • Component unmounts                    │
│         • State is LOST ❌                      │
└─────────────────────────────────────────────────┘
                     │
                     │ User goes back
                     ↓
┌─────────────────────────────────────────────────┐
│              Home Page (/)                      │
│         • Fresh mount                           │
│         • showResults = false                   │
│         • Results GONE ❌                       │
└─────────────────────────────────────────────────┘
```

**Problem**: State stored in component memory is lost on unmount

---

## AFTER (Route-Based + sessionStorage)

```
┌─────────────────────────────────────────────────┐
│              Home Page (/)                      │
│         Only Typing Interface                   │
│                                                 │
│  User completes test                            │
│         ↓                                       │
│  handleTestComplete()                           │
│         ↓                                       │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Save to backend (if authenticated)    │  │
│  │ 2. Save to sessionStorage ✅             │  │
│  │ 3. router.push('/results')               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │
                     │ Navigate to /results
                     ↓
┌─────────────────────────────────────────────────┐
│           Results Page (/results)               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Load from sessionStorage              │  │
│  │ 2. If no data → redirect to /            │  │
│  │ 3. Display results                       │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [← Back]  [Profile]  [Theme]                  │
└─────────────────────────────────────────────────┘
                     │
                     │ User clicks profile
                     ↓
┌─────────────────────────────────────────────────┐
│         Profile Page (/profile/user)            │
│         • sessionStorage persists ✅            │
│         • Results still available               │
└─────────────────────────────────────────────────┘
                     │
                     │ User goes back (browser back button)
                     ↓
┌─────────────────────────────────────────────────┐
│           Results Page (/results)               │
│         • Load from sessionStorage ✅           │
│         • Results STILL THERE ✅                │
│         • Can click back arrow to home          │
└─────────────────────────────────────────────────┘
```

**Solution**: State stored in sessionStorage persists across navigation

---

## Data Flow Diagram

```
                    ┌──────────────────────┐
                    │   User Types Test    │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │  handleTestComplete  │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ↓                             ↓
    ┌───────────────────────┐    ┌────────────────────┐
    │  Backend API          │    │  sessionStorage    │
    │  (if authenticated)   │    │  (all users)       │
    └───────────┬───────────┘    └─────────┬──────────┘
                │                           │
                │                           ↓
                │                ┌────────────────────┐
                │                │  router.push()     │
                │                │  → /results        │
                │                └─────────┬──────────┘
                │                           │
                └───────────────────────────┤
                                            ↓
                            ┌───────────────────────────┐
                            │   Results Page Loads      │
                            │   from sessionStorage     │
                            └───────────────────────────┘
```

---

## sessionStorage Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    sessionStorage                        │
│                                                          │
│  Persists:                                               │
│  ✅ Across page navigations (within same tab)           │
│  ✅ Across page refreshes                               │
│  ✅ When browser back/forward buttons used              │
│                                                          │
│  Cleared:                                                │
│  ❌ When tab/window is closed                           │
│  ❌ After 30 minutes (auto-expiration)                  │
│  ❌ When clearTestResults() is called                   │
│                                                          │
│  NOT Shared:                                             │
│  ⚠️  Not shared between tabs                            │
│  ⚠️  Not shared between windows                         │
└─────────────────────────────────────────────────────────┘
```

---

## Future PWA Architecture (Phase 2)

```
                    ┌──────────────────────┐
                    │   User Types Test    │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │  handleTestComplete  │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┬────────────────┐
                │              │              │                │
                ↓              ↓              ↓                ↓
    ┌──────────────┐  ┌──────────────┐  ┌─────────┐  ┌──────────────┐
    │   Backend    │  │  IndexedDB   │  │  Cache  │  │ Service      │
    │   API        │  │  (offline)   │  │ Storage │  │ Worker       │
    └──────┬───────┘  └──────┬───────┘  └────┬────┘  └──────┬───────┘
           │                 │               │              │
           │ (if online)     │ (always)      │ (page shell) │
           │                 │               │              │
           └─────────────────┴───────────────┴──────────────┤
                                                             │
                            ┌────────────────────────────────┘
                            │
                            ↓
                ┌────────────────────────┐
                │   Offline Support      │
                │   Background Sync      │
                │   Fast Loading         │
                └────────────────────────┘
```

**Next Evolution**: Upgrade to IndexedDB + Service Worker for full offline support
