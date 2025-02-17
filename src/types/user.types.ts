import { ObjectId } from "mongoose";

export type TUserSession = {
  id: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
}
