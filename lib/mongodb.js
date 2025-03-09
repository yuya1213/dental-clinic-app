import { MongoClient } from 'mongodb';

// MongoDB接続URI
// 実際のデプロイ時には環境変数から取得するようにしてください
const uri = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority";
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // 開発環境では、グローバル変数を使用してMongoDBクライアントの接続を維持
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 本番環境では、新しいMongoDBクライアントを作成
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
