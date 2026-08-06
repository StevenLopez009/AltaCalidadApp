import bcrypt from "bcryptjs";

async function main() {
  const password = "Admin123*";

  const hash = await bcrypt.hash(password, 12);

  console.log("Contraseña:", password);
  console.log("Hash:", hash);
}

main().catch(console.error);
