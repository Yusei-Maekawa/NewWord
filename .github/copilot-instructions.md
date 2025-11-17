---
applyTo: "**"
---

## 📝 Original Development Guidelines

### Code Quality & Documentation
- **日本語で書く** - All comments and documentation in Japanese
- **変数名や関数名は意味のある名前を使う** - Use meaningful variable and function names
- **コメントは簡潔かつ具体的に記述する** - Write concise and specific comments
- **各ファイルの最初にこのファイルの書いている概要を記載する** - Include a summary of this file's content at the top of each file
- **追加したコードについては、その目的と使用方法をコメントで説明する** - Explain the purpose and usage of added code in comments
- **Step by step でのコード記述** - Write code step by step
- **次にやることの提案をしてほしい** - Always suggest next steps
- **コミットメッセージは具体的かつ説明的に書く** - Write specific and descriptive commit messages

- **新しい機能を追加する際は、その設計と使用方法をREADMEに記載する** - Document design and usage of new features in README

- **新しい機能であったり、勉強になる部分は記事としてはてなブログにまとめるため、その補助をお願いしたい** - Summarize new features or learning points in a Hatena Blog article

- **その際、具体的なコード例や使用シーンを交えて説明してほしい** - Include specific code examples and usage scenarios in the article

- **その記事の内容は、後でわかりやすく辿れるように、README等にその作業の手順が進んだら、追記してほしい** - Update README with a link to the article once the work is done

### Change Management
- **変更を加えた場合は、その理由と影響を明確に説明する** - Clearly explain reasons and impacts of changes
- **追加した変数、関数、コンポーネント等はその記載しているファイルの上部に一覧としてまとめる** - List added variables, functions, components, etc. at the top of the file where they are defined

- **開発技術スタックや、リポジトリ構成等変わった内容をREADMEに追記する** - Update README with tech stack or repository changes

- **毎回サーバを動かしながら、開発すると動作が重くなったり、Dockerのメモリ不足等が起きるため、開発中はサーバを停止してからコードを書くことを推奨する** - Stop the server during development to avoid performance issues

- **エラーやバグの修正を行った場合は、BUG_FIXES.mdにその内容と解決方法を記載する** - Document error fixes and solutions in BUG_FIXES.md

- **常にバックアップを取ることを忘れないでください** - Never forget to take backups

This codebase prioritizes **stability over complexity** - prefer simple, well-documented solutions over advanced patterns.
--- end ---