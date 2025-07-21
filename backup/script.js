class StudyApp {
    constructor() {
        this.terms = JSON.parse(localStorage.getItem('studyTerms')) || [];
        this.currentTermIndex = 0;
        this.currentCategory = 'all';
        this.currentStudyTerms = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateTermsList();
        this.updateTermCount();
        
        // カテゴリボタンの初期状態
        this.filterTerms('all');
    }

    bindEvents() {
        // フォーム送信
        document.getElementById('addTermForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTerm();
        });

        document.getElementById('editTermForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTerm();
        });

        // カテゴリボタン
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.setActiveCategory(btn);
                this.filterTerms(category);
            });
        });

        // 学習コントロール
        document.getElementById('randomTermBtn').addEventListener('click', () => {
            this.startStudySession();
        });

        document.getElementById('showAnswerBtn').addEventListener('click', () => {
            this.showAnswer();
        });

        document.getElementById('nextTermBtn').addEventListener('click', () => {
            this.nextTerm();
        });

        document.getElementById('endStudyBtn').addEventListener('click', () => {
            this.endStudySession();
        });

        // 検索
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerms(e.target.value);
        });

        // モーダル
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        // モーダル外クリックで閉じる
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });
    }

    addTerm() {
        const category = document.getElementById('category').value;
        const term = document.getElementById('term').value.trim();
        const meaning = document.getElementById('meaning').value.trim();
        const example = document.getElementById('example').value.trim();

        if (!term || !meaning) {
            alert('用語と意味は必須項目です。');
            return;
        }

        const newTerm = {
            id: Date.now(),
            category,
            term,
            meaning,
            example,
            createdAt: new Date().toISOString()
        };

        this.terms.push(newTerm);
        this.saveTerms();
        this.updateTermsList();
        this.updateTermCount();
        
        // フォームリセット
        document.getElementById('addTermForm').reset();
        
        // 成功メッセージ
        this.showNotification('語句が追加されました！');
    }

    updateTerm() {
        const id = parseInt(document.getElementById('editId').value);
        const category = document.getElementById('editCategory').value;
        const term = document.getElementById('editTerm').value.trim();
        const meaning = document.getElementById('editMeaning').value.trim();
        const example = document.getElementById('editExample').value.trim();

        if (!term || !meaning) {
            alert('用語と意味は必須項目です。');
            return;
        }

        const termIndex = this.terms.findIndex(t => t.id === id);
        if (termIndex !== -1) {
            this.terms[termIndex] = {
                ...this.terms[termIndex],
                category,
                term,
                meaning,
                example,
                updatedAt: new Date().toISOString()
            };

            this.saveTerms();
            this.updateTermsList();
            this.closeModal();
            this.showNotification('語句が更新されました！');
        }
    }

    deleteTerm(id) {
        if (confirm('この語句を削除してもよろしいですか？')) {
            this.terms = this.terms.filter(term => term.id !== id);
            this.saveTerms();
            this.updateTermsList();
            this.updateTermCount();
            this.showNotification('語句が削除されました。');
        }
    }

    editTerm(id) {
        const term = this.terms.find(t => t.id === id);
        if (!term) return;

        document.getElementById('editId').value = term.id;
        document.getElementById('editCategory').value = term.category;
        document.getElementById('editTerm').value = term.term;
        document.getElementById('editMeaning').value = term.meaning;
        document.getElementById('editExample').value = term.example || '';

        document.getElementById('editModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    setActiveCategory(activeBtn) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    filterTerms(category) {
        this.currentCategory = category;
        let filteredTerms = category === 'all' 
            ? this.terms 
            : this.terms.filter(term => term.category === category);
        
        this.displayTerms(filteredTerms);
        this.updateTermCount();
    }

    searchTerms(searchText) {
        const filtered = this.getFilteredTerms().filter(term => 
            term.term.toLowerCase().includes(searchText.toLowerCase()) ||
            term.meaning.toLowerCase().includes(searchText.toLowerCase()) ||
            (term.example && term.example.toLowerCase().includes(searchText.toLowerCase()))
        );
        this.displayTerms(filtered);
    }

    getFilteredTerms() {
        return this.currentCategory === 'all' 
            ? this.terms 
            : this.terms.filter(term => term.category === this.currentCategory);
    }

    displayTerms(terms) {
        const container = document.getElementById('termsList');
        
        if (terms.length === 0) {
            container.innerHTML = '<div class="text-center" style="grid-column: 1 / -1; padding: 40px;"><p style="font-size: 1.2rem; color: #666;">該当する語句がありません。</p></div>';
            return;
        }

        container.innerHTML = terms.map(term => `
            <div class="term-item" data-category="${term.category}">
                <h4>${this.escapeHtml(term.term)}</h4>
                <span class="category category-${term.category}">${this.getCategoryName(term.category)}</span>
                <p><strong>意味:</strong> ${this.escapeHtml(term.meaning)}</p>
                ${term.example ? `<p><strong>例文:</strong> ${this.escapeHtml(term.example)}</p>` : ''}
                <div class="term-actions">
                    <button class="edit-btn" onclick="app.editTerm(${term.id})">編集</button>
                    <button class="delete-btn" onclick="app.deleteTerm(${term.id})">削除</button>
                </div>
            </div>
        `).join('');
    }

    updateTermsList() {
        const filteredTerms = this.getFilteredTerms();
        this.displayTerms(filteredTerms);
    }

    updateTermCount() {
        const count = this.getFilteredTerms().length;
        document.getElementById('termCount').textContent = `${count}個の語句`;
    }

    startStudySession() {
        const availableTerms = this.getFilteredTerms();
        
        if (availableTerms.length === 0) {
            alert('学習できる語句がありません。まず語句を追加してください。');
            return;
        }

        this.currentStudyTerms = [...availableTerms];
        this.shuffleArray(this.currentStudyTerms);
        this.currentTermIndex = 0;
        
        this.updateStudyProgress();
        this.showCurrentTerm();
        
        document.getElementById('randomTermBtn').style.display = 'none';
        document.getElementById('showAnswerBtn').style.display = 'inline-block';
        document.getElementById('endStudyBtn').style.display = 'inline-block';
        document.getElementById('studyCard').style.display = 'block';
    }

    showCurrentTerm() {
        if (this.currentTermIndex >= this.currentStudyTerms.length) {
            this.endStudySession();
            return;
        }

        const term = this.currentStudyTerms[this.currentTermIndex];
        
        document.getElementById('currentTerm').textContent = term.term;
        document.getElementById('currentCategory').textContent = this.getCategoryName(term.category);
        document.getElementById('currentCategory').className = `category-tag category-${term.category}`;
        document.getElementById('currentMeaning').textContent = term.meaning;
        document.getElementById('currentExample').textContent = term.example || '例文なし';

        // カードを表にする
        document.querySelector('.card-front').style.display = 'block';
        document.querySelector('.card-back').style.display = 'none';
        
        document.getElementById('showAnswerBtn').style.display = 'inline-block';
        document.getElementById('nextTermBtn').style.display = 'none';
    }

    showAnswer() {
        document.querySelector('.card-front').style.display = 'none';
        document.querySelector('.card-back').style.display = 'block';
        
        document.getElementById('showAnswerBtn').style.display = 'none';
        document.getElementById('nextTermBtn').style.display = 'inline-block';
    }

    nextTerm() {
        this.currentTermIndex++;
        this.updateStudyProgress();
        this.showCurrentTerm();
    }

    updateStudyProgress() {
        const current = this.currentTermIndex + 1;
        const total = this.currentStudyTerms.length;
        const category = this.getCategoryName(this.currentCategory);
        document.getElementById('studyProgress').textContent = 
            `${category} - ${current}/${total} (${Math.round(current/total*100)}%)`;
    }

    endStudySession() {
        document.getElementById('studyCard').style.display = 'none';
        document.getElementById('randomTermBtn').style.display = 'inline-block';
        document.getElementById('showAnswerBtn').style.display = 'none';
        document.getElementById('nextTermBtn').style.display = 'none';
        document.getElementById('endStudyBtn').style.display = 'none';
        document.getElementById('studyProgress').textContent = '学習する語句を選択してください';
        
        const completedTerms = this.currentTermIndex;
        const totalTerms = this.currentStudyTerms.length;
        
        if (completedTerms === totalTerms) {
            this.showNotification(`🎉 学習セッション完了！${totalTerms}個の語句を確認しました。`);
        } else {
            this.showNotification(`学習セッション終了。${completedTerms}/${totalTerms}個の語句を確認しました。`);
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getCategoryName(category) {
        const categoryNames = {
            'english': '英語',
            'applied': '応用情報',
            'advanced': '高度情報',
            'gkentei': 'G検定'
        };
        return categoryNames[category] || category;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTerms() {
        localStorage.setItem('studyTerms', JSON.stringify(this.terms));
    }

    showNotification(message) {
        // 簡単な通知システム
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // データのエクスポート
    exportData() {
        const dataStr = JSON.stringify(this.terms, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'study-terms-backup.json';
        link.click();
    }

    // データのインポート
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTerms = JSON.parse(e.target.result);
                if (confirm(`${importedTerms.length}個の語句をインポートしますか？既存のデータは保持されます。`)) {
                    // IDの重複を避けるため、新しいIDを割り当て
                    const maxId = Math.max(...this.terms.map(t => t.id), 0);
                    importedTerms.forEach((term, index) => {
                        term.id = maxId + index + 1;
                    });
                    
                    this.terms = [...this.terms, ...importedTerms];
                    this.saveTerms();
                    this.updateTermsList();
                    this.updateTermCount();
                    this.showNotification('データをインポートしました！');
                }
            } catch (error) {
                alert('ファイルの形式が正しくありません。');
            }
        };
        reader.readAsText(file);
    }

    // 初期データの追加（デモ用）
    addSampleData() {
        const sampleTerms = [
            {
                id: Date.now() + 1,
                category: 'english',
                term: 'Artificial Intelligence',
                meaning: '人工知能。人間の知的機能をコンピュータで実現する技術',
                example: 'AI is transforming various industries.',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                category: 'applied',
                term: 'アルゴリズム',
                meaning: '問題を解決するための手順や方法を明確に定義したもの',
                example: 'ソートアルゴリズムにはクイックソートやマージソートがある',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                category: 'advanced',
                term: 'クラウドコンピューティング',
                meaning: 'インターネットを通じてコンピューティングサービスを提供する仕組み',
                example: 'AWS、Azure、GCPなどがクラウドプロバイダーの例',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 4,
                category: 'gkentei',
                term: '機械学習',
                meaning: 'データから自動的にパターンを学習し、予測や判断を行う技術',
                example: '教師あり学習、教師なし学習、強化学習がある',
                createdAt: new Date().toISOString()
            }
        ];

        this.terms = [...this.terms, ...sampleTerms];
        this.saveTerms();
        this.updateTermsList();
        this.updateTermCount();
        this.showNotification('サンプルデータを追加しました！');
    }
}

// fadeOut アニメーションの追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

// アプリケーションの初期化
const app = new StudyApp();

// 開発者コンソール用のヘルパー関数
window.studyApp = {
    exportData: () => app.exportData(),
    addSampleData: () => app.addSampleData(),
    clearAll: () => {
        if (confirm('全てのデータを削除しますか？この操作は取り消せません。')) {
            localStorage.removeItem('studyTerms');
            location.reload();
        }
    },
    getStats: () => {
        const stats = {
            total: app.terms.length,
            english: app.terms.filter(t => t.category === 'english').length,
            applied: app.terms.filter(t => t.category === 'applied').length,
            advanced: app.terms.filter(t => t.category === 'advanced').length,
            gkentei: app.terms.filter(t => t.category === 'gkentei').length
        };
        console.table(stats);
        return stats;
    }
};

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                document.getElementById('term').focus();
                break;
            case 's':
                e.preventDefault();
                document.getElementById('randomTermBtn').click();
                break;
        }
    }
    
    // 学習中のキーボード操作
    if (document.getElementById('studyCard').style.display !== 'none') {
        switch(e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                if (document.getElementById('showAnswerBtn').style.display !== 'none') {
                    document.getElementById('showAnswerBtn').click();
                } else if (document.getElementById('nextTermBtn').style.display !== 'none') {
                    document.getElementById('nextTermBtn').click();
                }
                break;
            case 'Escape':
                app.endStudySession();
                break;
        }
    }
});
