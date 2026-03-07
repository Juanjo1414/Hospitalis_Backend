/**
 * ─────────────────────────────────────────────────────────────────
 *  SEED: Crear usuario Administrador
 *
 *  ¿Qué hace?
 *  - Conecta directamente a MongoDB (sin levantar el servidor HTTP)
 *  - Verifica si ya existe un admin con el email configurado
 *  - Si NO existe → lo crea con password hasheado
 *  - Si YA existe → muestra un mensaje y termina sin duplicar
 *
 *  ¿Cómo correrlo?
 *    npm run seed
 *
 *  Variables de entorno requeridas en .env:
 *    MONGO_URI        = mongodb://localhost:27017/hospitalis
 *    ADMIN_EMAIL      = admin@hospitalis.com
 *    ADMIN_PASSWORD   = Admin1234!
 *    ADMIN_FULLNAME   = Administrador Sistema
 * ─────────────────────────────────────────────────────────────────
 */

import 'reflect-metadata';              // requerido por NestJS / decoradores
import * as dotenv from 'dotenv';       // para leer el .env
import * as bcrypt from 'bcrypt';       // para hashear el password
import mongoose from 'mongoose';        // conexión directa a MongoDB

// ── 1. Cargar variables de entorno ────────────────────────────────────────────
dotenv.config();                        // lee el archivo .env de la raíz

const MONGO_URI      = process.env.MONGO_URI;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME ?? 'Administrador';

// Validar que las variables necesarias existen
if (!MONGO_URI)      throw new Error('❌  MONGO_URI no está definido en .env');
if (!ADMIN_EMAIL)    throw new Error('❌  ADMIN_EMAIL no está definido en .env');
if (!ADMIN_PASSWORD) throw new Error('❌  ADMIN_PASSWORD no está definido en .env');

// ── 2. Definir el schema de User directamente (sin importar módulos de NestJS)
//  Usamos mongoose puro para no necesitar bootear todo el framework.
//  El schema debe coincidir exactamente con src/users/user.schema.ts
const UserSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['admin', 'medico'], default: 'medico' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },   // agrega createdAt y updatedAt automáticamente
);

// ── 3. Función principal ──────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  Iniciando seed de administrador...\n');

  // 3a. Conectar a MongoDB
  console.log(`📡  Conectando a: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI!);
  console.log('✅  Conexión establecida\n');

  // 3b. Obtener el modelo de User
  //  Si el modelo ya fue registrado (en pruebas), reutilizarlo
  const UserModel = mongoose.models['User']
    ?? mongoose.model('User', UserSchema);

  // 3c. Verificar si el admin ya existe (idempotencia)
  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(`⚠️   Ya existe un usuario con email: ${ADMIN_EMAIL}`);
    console.log(`     Rol actual: ${existing.role}`);

    if (existing.role !== 'admin') {
      // Si existe pero no es admin, lo promovemos
      await UserModel.findByIdAndUpdate(existing._id, { role: 'admin' });
      console.log('🔄  Usuario actualizado a rol ADMIN');
    } else {
      console.log('ℹ️   El usuario ya tiene rol ADMIN. No se realizaron cambios.');
    }
  } else {
    // 3d. Crear el admin
    console.log(`👤  Creando usuario admin: ${ADMIN_EMAIL}`);

    // Hashear el password con salt de 10 rondas
    // bcrypt.hash toma el password en texto plano y devuelve el hash seguro
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD!, 10);

    await UserModel.create({
      fullname: ADMIN_FULLNAME,
      email:    ADMIN_EMAIL,
      password: hashedPassword,
      role:     'admin',
      isActive: true,
    });

    console.log('✅  Usuario administrador creado exitosamente');
    console.log(`\n   📧  Email:    ${ADMIN_EMAIL}`);
    console.log(`   🔑  Password: ${ADMIN_PASSWORD}`);
    console.log(`   🛡️  Rol:      admin\n`);
    console.log('   ⚠️  Guarda estas credenciales en un lugar seguro.');
  }

  // 3e. Cerrar conexión y terminar el proceso
  await mongoose.disconnect();
  console.log('\n🔌  Conexión cerrada. Seed finalizado.\n');
  process.exit(0);   // salir con código 0 = éxito
}

// ── 4. Ejecutar y capturar errores ───────────────────────────────────────────
seed().catch((err) => {
  console.error('\n❌  Error durante el seed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));  // salir con código 1 = error
});