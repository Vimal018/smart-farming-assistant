import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
      {
      // No need for `useNewUrlParser` and `useUnifiedTopology` in the latest Mongoose versions
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

export default connectDB;
