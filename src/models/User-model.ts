import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model<IUser>("User", userSchema);

export default User;
