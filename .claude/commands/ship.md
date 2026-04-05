Add, commit, and push all current changes by following these steps in order:

1. Run `git status` to see what files have changed.
2. Run `git diff --stat` to summarize the changes.
3. Stage all modified files by name (avoid `git add -A` or `git add .`).
4. Write a concise commit message that describes what changed and why.
5. Commit with the message.
6. Run `git push`. If rejected due to remote changes, run `git pull --rebase` then `git push` again.

Always show the list of staged files and the commit message before committing so the user can confirm.
