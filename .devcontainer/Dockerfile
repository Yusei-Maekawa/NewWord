FROM mcr.microsoft.com/devcontainers/javascript-node:18

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /workspaces

# Node.jsのグローバルパッケージ（必要に応じて）
RUN npm install -g nodemon

# デフォルトシェルをbashに設定
ENV SHELL /bin/bash
