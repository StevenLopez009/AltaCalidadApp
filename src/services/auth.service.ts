import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { getAdminByUsername } from "../repositories/admins.repositories";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function login(username: string, password: string) {
  const admin = await getAdminByUsername(username);

  if (!admin) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, admin.password);

  if (!validPassword) {
    return null;
  }

  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return token;
}
