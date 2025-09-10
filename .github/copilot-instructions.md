# GitHub Copilot Instructions - 学習用語句振り返りアプリ

## 🏗️ Architecture Overview

This is a **React + Express + MySQL** vocabulary learning app with **dual database support** (Docker MySQL on port 3307, XAMPP MySQL on port 3306). The app is transitioning from XAMPP to Docker for stability.

**Key architectural decisions:**
- **Dual DB strategy**: Docker MySQL (primary, port 3307) + XAMPP MySQL (fallback, port 3306)
- **Component-based React**: Each feature is a separate component with clear responsibilities
- **Express REST API**: Simple CRUD operations with MySQL2 driver
- **Batch automation**: Windows .bat files for common operations
- **3-layer data protection**: Automated backups + Docker persistence + XAMPP fallback

## 🛠️ Development Workflows

### Essential Commands (use these instead of generic ones)
```bash
# Development startup (recommended)
docker-compose up -d                    # Start MySQL container
npm run dev                             # Starts both server.js and React concurrently

# Alternative: separate processes
node server.js                          # API server on port 4000
npm start                              # React dev server on port 3000

# Database operations
docker exec studying_mysql mysql -u app_user -papppassword -D studying_app -e "SELECT * FROM terms;"

# Batch scripts (Windows-specific)
batch-scripts\start-server.bat         # Quick server startup
batch-scripts\reset-and-start.bat      # Full environment reset
```

### Database Connection Pattern
Always check `server.js` for current DB config. The app uses **two connection strategies**:
```javascript
// Docker MySQL (primary, port 3307)
host: 'localhost', user: 'app_user', password: 'apppassword', port: 3307

// XAMPP fallback (port 3306) 
host: 'localhost', user: 'root', password: '', port: 3306
```

## 📁 Critical File Patterns

### Component Architecture
- **`src/components/`**: Each component handles one feature (AddTermForm, TermsList, CategoryManager)
- **`src/hooks/`**: Custom hooks for data fetching (`useTerms.ts`, `useStudySession.ts`)
- **`src/types.ts`**: Central type definitions with detailed JSDoc
- **State management**: React useState in `App.tsx`, no external state management

### Database Schema (important for API modifications)
```sql
-- Core tables (see mysql-init/ for full schema)
terms: id, word, meaning, example, category, created_at
categories: id, category_key, category_name, parent_id, is_favorite, display_order
```

### API Endpoints Pattern
```javascript
// Follow this pattern in server.js
app.get('/api/terms', ...)           // List with optional category filter
app.post('/api/terms', ...)          // Create with validation
app.put('/api/terms/:id', ...)       // Update existing
app.delete('/api/terms/:id', ...)    // Soft delete preferred
```

## 🔧 Project-Specific Conventions

### Japanese Comments & Documentation
- **All comments in Japanese** - this is intentional for the Japanese developer
- **JSDoc format required** - see existing files for examples
- **File headers** must include @fileoverview, @author, @version

### Data Protection Mindset
- **Never directly drop tables** - use batch-scripts for dangerous operations  
- **Always backup before schema changes** - use `scripts/backup_mysql.ps1`
- **Test on both databases** - Docker and XAMPP when making DB changes

### Component Props Pattern
```typescript
// Follow this interface pattern (see types.ts)
interface ComponentProps {
  data: Term[];                    // Primary data
  onUpdate: (data: Term[]) => void;  // Update callback  
  notification: (message: string, type: 'success'|'error') => void; // Consistent notifications
}
```

## 🚨 Critical Integration Points

### MySQL Initialization
- **`mysql-init/`** directory contains Docker startup SQL scripts
- **Order matters**: `01-create-categories.sql` → `02-hierarchical-categories.sql` → `03-create-terms.sql`
- **Schema changes** require container rebuild: `docker-compose down && docker-compose up -d`

### Batch Scripts (Windows-specific)
- **Use batch scripts** for common operations instead of manual commands
- **`batch-scripts/`** contains pre-configured automation for development tasks
- **Always run from project root** - scripts use absolute paths

### CSS/Styling Approach
- **Single CSS file**: `src/styles/App.css` contains all styles
- **No CSS frameworks** - custom CSS with Japanese comments
- **Component-specific classes**: `.category-nav`, `.terms-list`, etc.

## 🎯 When Making Changes

### Adding New Features
1. **Create component** in `src/components/`
2. **Add to App.tsx** state and component tree  
3. **Update types.ts** if new data structures needed
4. **Add API endpoint** in server.js following existing patterns

### Database Modifications  
1. **Create SQL script** in `database/sql/`
2. **Test on Docker first**: `docker exec studying_mysql mysql...`
3. **Update mysql-init/** if schema change affects fresh installs
4. **Document in README.md** database section

### Debugging Database Issues
```bash
# Check container status
docker ps

# View MySQL logs  
docker logs studying_mysql

# Test connection
docker exec studying_mysql mysql -u app_user -papppassword -e "SHOW DATABASES;"
```

## 📝 Original Development Guidelines

### Code Quality & Documentation
- **日本語で書く** - All comments and documentation in Japanese
- **変数名や関数名は意味のある名前を使う** - Use meaningful variable and function names
- **コメントは簡潔かつ具体的に記述する** - Write concise and specific comments
- **Step by step でのコード記述** - Write code step by step
- **次にやることの提案をしてほしい** - Always suggest next steps
- **コミットメッセージは具体的かつ説明的に書く** - Write specific and descriptive commit messages

### Change Management
- **変更を加えた場合は、その理由と影響を明確に説明する** - Clearly explain reasons and impacts of changes
- **開発技術スタックや、リポジトリ構成等変わった内容をREADMEに追記する** - Update README with tech stack or repository changes
- **エラーやバグの修正を行った場合は、READMEにその内容と解決方法を記載する** - Document error fixes and solutions in README
- **新しい機能を追加した場合は、その使い方や設定方法をREADMEに記載する** - Document new features and usage in README
- **常にバックアップを取ることを忘れないでください** - Never forget to take backups

This codebase prioritizes **stability over complexity** - prefer simple, well-documented solutions over advanced patterns.-

-日本語で書く
- 変数名や関数名は意味のある名前を使う。
- コメントは簡潔かつ具体的に記述する。
- コードの可読性を高めるために適切なインデントと空白を使用する。
- 冗長なコードを避け、DRY（Don't Repeat Yourself）の原則に従う。
- step by step でのコード記述をするようにしてほしい
- 次にやることの提案をしてほしい
- コードの変更履歴を明確にするために、コミットメッセージは具体的かつ説明的に書く。

- 変更を加えた場合は、その理由と影響を明確に説明する。

- 開発技術スタックや、リポジトリ構成等変わった内容をREADMEに追記する。
-エラーやバグの修正を行った場合は、READMEにその内容と解決方法を記載する。
- 新しい機能を追加した場合は、その使い方や設定方法をREADMEに記載する。
- 既存の機能に変更を加えた場合は、その変更点と影響範囲をREADMEに記載する。
- 重要な設定や依存関係の変更があった場合は、READMEにその詳細を記載する。

- 常にバックアップを取ることを忘れないでください。

--- end ---