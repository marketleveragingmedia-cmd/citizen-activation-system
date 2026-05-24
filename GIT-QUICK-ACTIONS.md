# Git Quick Actions

## Undo Last Commit (Keep Changes)
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git reset --soft HEAD~1
```
This keeps your changes but removes the last commit.

## Undo Last Commit (Discard Changes)
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git reset --hard HEAD~1
git push -f origin main
```
⚠️ This DELETES the last commit and all changes permanently.

## Undo Last 2 Commits
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git reset --hard HEAD~2
git push -f origin main
```

## Undo Last 3 Commits
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git reset --hard HEAD~3
git push -f origin main
```

## Revert to Specific Commit
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git log --oneline -10  # Find the commit hash
git reset --hard <commit-hash>
git push -f origin main
```

## View Recent Commits
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git log --oneline -10
```

## Current Status
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git status
git log --oneline -5
```
