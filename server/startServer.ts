import express from 'express';
import mongoose from 'mongoose';

export const startServer = async (app: express.Express, port: number) => {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('MongoDB connection successful!');
  } catch (dbError) {
    console.warn('MongoDB connection failed, continuing anyway:', dbError);
  }

  const HOST = process.env.HOST || '0.0.0.0';

  try {
    app.listen(Number(port), HOST, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Local: http://localhost:${port}`);
      console.log(`Network: http://192.168.0.116:${port}`);
      console.log(`API available at: http://192.168.0.116:${port}/api/services`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
