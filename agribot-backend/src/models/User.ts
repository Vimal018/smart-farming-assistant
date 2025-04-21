import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string; // Changed username to name
  email: string;
  password: string;
  _id: any;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true }, // Changed username to name, unique constraint removed
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model<IUser>('User', userSchema);

export default User;
export { IUser};