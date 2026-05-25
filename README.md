# X Clone

シンプルなX（Twitter）風SNS。Supabase + バニラJS製。

## セットアップ

### 1. Supabase 設定

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. SQL Editor で `supabase_setup.sql` の内容を実行
3. Project Settings → API から URL と anon key をコピー

### 2. ローカル開発

```bash
cp config.example.js config.js
# config.js を編集して Supabase の URL と anon key を入れる
```

`index.html` をブラウザで直接開けばOK（サーバー不要）。

### 3. GitHub へデプロイ

1. このリポジトリを GitHub に push
2. GitHub のリポジトリ Settings → Secrets → Actions で以下を追加：
   - `SUPABASE_URL` : SupabaseのProject URL
   - `SUPABASE_ANON_KEY` : Supabaseのanon key
3. Settings → Pages → Source を「GitHub Actions」に設定
4. main ブランチに push すると自動デプロイ

### 注意

- `config.js` は `.gitignore` に入っています。**絶対にコミットしないでください**
- Supabase の anon key は RLS ポリシーで保護されています
