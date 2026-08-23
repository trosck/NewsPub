import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";

import { appConfig } from "../../config/constants";

export interface UserDocument extends Document<Types.ObjectId> {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  _id: Types.ObjectId;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, trim: true, required: [true, "Name is required"] })
  name: string;

  @Prop({
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  })
  email: string;

  @Prop({
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
  })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, appConfig().bcryptSaltRounds);
});

UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.password;
    delete obj.__v;
    return ret;
  },
});

export type UserModel = Model<UserDocument>;
