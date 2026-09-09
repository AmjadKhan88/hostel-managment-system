import '../config/env.js'; // loads & validates .env as a side effect
import { logger } from '../config/logger.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Role } from '../models/Role.model.js';
import { User } from '../models/User.model.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    logger.error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env before running this script');
    process.exit(1);
  }

  await connectDB();

  let role = await Role.findOne({ slug: 'super-admin', hostelId: null });
  if (!role) {
    role = await Role.create({
      name: 'Super Admin',
      slug: 'super-admin',
      hostelId: null,
      permissions: [SUPER_ADMIN_WILDCARD],
      isSystem: true,
    });
    logger.info('Created Super Admin role');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    logger.warn(`User ${email} already exists — skipping`);
  } else {
    const passwordHash = await User.hashPassword(password);
    await User.create({ name, email, passwordHash, roleId: role._id, hostelId: null, status: 'active' });
    logger.info(`Created Super Admin user: ${email}`);
  }

  await disconnectDB();
  process.exit(0);
}

seedSuperAdmin().catch((err) => {
  logger.error({ err }, 'Failed to seed Super Admin');
  process.exit(1);
});