import mongoose from 'mongoose';
mongoose.set('strictQuery', false);

const connection = {};

async function connectDB() {
  if (connection.isConnected) {
    console.log('Already connected to the DB');
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log('Use previous DB connection');
      return;
    }

    await mongoose.disconnect();
  }

  const db = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('New DB connection');
  connection.isConnected = db.connections[0].readyState;
}

async function disconnectDB() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('not disconnecting from the DB');
    }
  }
}

const db = { connectDB, disconnectDB };
export default db;
