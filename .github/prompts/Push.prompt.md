---
mode: agent
---

# Pre-Push Workflow Automation

Execute a comprehensive pre-push workflow that ensures code quality and runs all necessary checks before pushing changes to the repository. This workflow should be thorough but efficient, catching issues early and maintaining high code standards.

## Workflow Steps

### 1. Code Quality Checks
- Run Biome linting: `npm run lint`
- Run Biome formatting check: `npm run format:check`
- Run comprehensive Biome check: `npm run check`
- If any linting/formatting issues are found, attempt to auto-fix them: `npm run check:fix`
- Re-run checks after auto-fix to ensure all issues are resolved

### 2. Type Checking
- Run TypeScript type checking: `npm run type-check`
- Ensure no type errors exist before proceeding

### 3. Test Execution
- Run all tests: `npm run test:run`
- Ensure all tests pass before proceeding
- If tests fail, do NOT proceed with commit and push

### 4. Build Verification
- Run the build process: `npm run build`
- Ensure the project builds successfully

### 5. Git Operations
- Stage all changes: `git add .`
- Check git status to confirm what will be committed
- Create a concise, descriptive commit message following conventional commit format
- Commit the changes with the generated message
- Push to the current branch

## Commit Message Guidelines

Generate commit messages that:
- Follow conventional commit format: `type(scope): description`
- Are concise but descriptive (max 50 characters for title)
- Use present tense ("add" not "added")
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Include scope when relevant (e.g., `feat(auth): add user authentication`)

## Error Handling

- If any step fails, stop the workflow and report the error
- Provide clear guidance on how to fix common issues
- Do not proceed to git operations if code quality checks fail
- If auto-fix resolves issues, inform the user what was fixed

## Success Criteria

The workflow is successful when:
- ✅ All Biome checks pass (linting, formatting)
- ✅ TypeScript compilation succeeds
- ✅ All tests pass
- ✅ Build completes successfully
- ✅ Changes are committed with appropriate message
- ✅ Changes are pushed to remote branch

## Important Notes

- **DO NOT** create a pull request - this should be done manually
- **DO NOT** merge or push to main/master branch directly
- **DO** provide a summary of what was checked and completed
- **DO** inform the user if any files were auto-fixed during the process
- **DO** confirm the branch name before pushing

## Example Output Summary

After successful completion, provide a summary like:
```
✅ Pre-push workflow completed successfully!

Checks performed:
- Biome linting: PASSED
- Biome formatting: PASSED  
- TypeScript types: PASSED
- Tests: PASSED (X tests run)
- Build: PASSED

Git operations:
- Files staged: X files
- Commit: "feat(api): add user endpoint validation"
- Pushed to branch: feature/user-validation

Ready for manual pull request creation.
```