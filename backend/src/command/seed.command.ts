// external imports
import { Command, CommandRunner } from 'nest-commander';
import { StringHelper } from '../common/helper/string.helper';
import * as bcrypt from 'bcryptjs';
// internal imports
import appConfig from '../config/app.config';
import { UserRepository } from '../common/repository/user/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Command({ name: 'seed', description: 'prisma db seed' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async run(passedParam: string[]): Promise<void> {
    await this.seed(passedParam);
  }

  async seed(param: string[]) {
    try {
      console.log('Starting database seeding...');

      // begin transaaction
      await this.prisma.$transaction(async ($tx) => {
        console.log('Creating roles...');
        await this.roleSeed($tx);
        console.log('Roles created successfully');

        console.log('Creating permissions...');
        await this.permissionSeed($tx);
        console.log('Permissions created successfully');

        console.log('Creating system admin user...');
        await this.userSeed($tx);
        console.log('System admin user created successfully');

        console.log('Assigning permissions to roles...');
        await this.permissionRoleSeed($tx);
        console.log('Permissions assigned successfully');
      });

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding:', error.message);
      console.error(error);
      throw error;
    }
  }

  //---- user section ----
  async userSeed($tx?: any) {
    const prisma = $tx || this.prisma;

    // Check if system user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: appConfig().defaultUser.system.email },
    });

    if (existingUser) {
      console.log('⚠️  System admin user already exists');

      // Update password to match current SYSTEM_PASSWORD
      const hashedPassword = await bcrypt.hash(
        appConfig().defaultUser.system.password,
        appConfig().security.salt,
      );

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          first_name: appConfig().defaultUser.system.username,
        },
      });

      console.log('✅ Password updated to match current SYSTEM_PASSWORD');
      console.log(`   Email: ${appConfig().defaultUser.system.email}`);
      console.log(`   Username: ${appConfig().defaultUser.system.username}`);
      console.log(`   Password: ${appConfig().defaultUser.system.password}`);

      // Still assign role if not already assigned
      const existingRole = await prisma.roleUser.findFirst({
        where: {
          role_id: '1',
          user_id: existingUser.id,
        },
      });

      if (!existingRole) {
        await prisma.roleUser.create({
          data: {
            user_id: existingUser.id,
            role_id: '1',
          },
        });
        console.log('✅ Super Admin role assigned to existing user');
      } else {
        console.log('✅ Super Admin role already assigned');
      }
      return;
    }

    // Validate environment variables
    if (!appConfig().defaultUser.system.username ||
      !appConfig().defaultUser.system.email ||
      !appConfig().defaultUser.system.password) {
      throw new Error('Missing system user configuration. Please set SYSTEM_USERNAME, SYSTEM_EMAIL, and SYSTEM_PASSWORD in your .env file');
    }

    // system admin, user id: 1
    const systemUser = await UserRepository.createSuAdminUser({
      username: appConfig().defaultUser.system.username,
      email: appConfig().defaultUser.system.email,
      password: appConfig().defaultUser.system.password,
    });

    await prisma.roleUser.create({
      data: {
        user_id: systemUser.id,
        role_id: '1',
      },
    });

    console.log(`✅ System admin user created:`);
    console.log(`   Email: ${appConfig().defaultUser.system.email}`);
    console.log(`   Username: ${appConfig().defaultUser.system.username}`);
    console.log(`   Password: ${appConfig().defaultUser.system.password}`);
  }

  async permissionSeed($tx?: any) {
    const prisma = $tx || this.prisma;

    // Check if permissions already exist
    const existingPermissions = await prisma.permission.findMany();
    if (existingPermissions.length > 0) {
      console.log('⚠️  Permissions already exist, skipping creation');
      return;
    }

    let i = 0;
    const permissions = [];
    const permissionGroups = [
      // (system level )super admin level permission
      { title: 'system_tenant_management', subject: 'SystemTenant' },
      // end (system level )super admin level permission
      { title: 'user_management', subject: 'User' },
      { title: 'role_management', subject: 'Role' },
      // Project
      { title: 'Project', subject: 'Project' },
      // Task
      {
        title: 'Task',
        subject: 'Task',
        scope: ['read', 'create', 'update', 'show', 'delete', 'assign'],
      },
      // Comment
      { title: 'Comment', subject: 'Comment' },
    ];

    for (const permissionGroup of permissionGroups) {
      if (permissionGroup['scope']) {
        for (const permission of permissionGroup['scope']) {
          permissions.push({
            id: String(++i),
            title: permissionGroup.title + '_' + permission,
            action: StringHelper.cfirst(permission),
            subject: permissionGroup.subject,
          });
        }
      } else {
        for (const permission of [
          'read',
          'create',
          'update',
          'show',
          'delete',
        ]) {
          permissions.push({
            id: String(++i),
            title: permissionGroup.title + '_' + permission,
            action: StringHelper.cfirst(permission),
            subject: permissionGroup.subject,
          });
        }
      }
    }

    await prisma.permission.createMany({
      data: permissions,
    });
  }

  async permissionRoleSeed($tx?: any) {
    const prisma = $tx || this.prisma;

    // Check if permission roles already exist
    const existingPermissionRoles = await prisma.permissionRole.findMany();
    if (existingPermissionRoles.length > 0) {
      console.log('⚠️  Permission roles already exist, skipping creation');
      return;
    }

    const all_permissions = await prisma.permission.findMany();
    const su_admin_permissions = all_permissions.filter(function (permission) {
      return permission.title.substring(0, 25) == 'system_tenant_management_';
    });
    // const su_admin_permissions = all_permissions;

    // -----su admin permission---
    const adminPermissionRoleArray = [];
    for (const su_admin_permission of su_admin_permissions) {
      adminPermissionRoleArray.push({
        role_id: '1',
        permission_id: su_admin_permission.id,
      });
    }
    await prisma.permissionRole.createMany({
      data: adminPermissionRoleArray,
    });
    // -----------

    // ---admin---
    const project_admin_permissions = all_permissions.filter(
      function (permission) {
        return permission.title.substring(0, 25) != 'system_tenant_management_';
      },
    );

    const projectAdminPermissionRoleArray = [];
    for (const admin_permission of project_admin_permissions) {
      projectAdminPermissionRoleArray.push({
        role_id: '2',
        permission_id: admin_permission.id,
      });
    }
    await prisma.permissionRole.createMany({
      data: projectAdminPermissionRoleArray,
    });
    // -----------

    // ---project manager---
    const project_manager_permissions = all_permissions.filter(
      function (permission) {
        return (
          permission.title == 'project_read' ||
          permission.title == 'project_show' ||
          permission.title == 'project_update' ||
          permission.title.substring(0, 4) == 'Task' ||
          permission.title.substring(0, 7) == 'Comment'
        );
      },
    );

    const projectManagerPermissionRoleArray = [];
    for (const project_manager_permission of project_manager_permissions) {
      projectManagerPermissionRoleArray.push({
        role_id: '3',
        permission_id: project_manager_permission.id,
      });
    }
    await prisma.permissionRole.createMany({
      data: projectManagerPermissionRoleArray,
    });
    // -----------

    // ---member---
    const member_permissions = all_permissions.filter(function (permission) {
      return (
        permission.title == 'project_read' ||
        permission.title == 'project_show' ||
        permission.title == 'task_read' ||
        permission.title == 'task_show' ||
        permission.title == 'task_update' ||
        permission.title.substring(0, 7) == 'comment'
      );
    });

    const memberPermissionRoleArray = [];
    for (const project_manager_permission of member_permissions) {
      memberPermissionRoleArray.push({
        role_id: '4',
        permission_id: project_manager_permission.id,
      });
    }
    await prisma.permissionRole.createMany({
      data: memberPermissionRoleArray,
    });
    // -----------

    // ---viewer---
    const viewer_permissions = all_permissions.filter(function (permission) {
      return (
        permission.title == 'project_read' ||
        permission.title == 'project_show' ||
        permission.title == 'task_read' ||
        permission.title == 'comment_read'
      );
    });

    const viewerPermissionRoleArray = [];
    for (const viewer_permission of viewer_permissions) {
      viewerPermissionRoleArray.push({
        role_id: '5',
        permission_id: viewer_permission.id,
      });
    }
    await prisma.permissionRole.createMany({
      data: viewerPermissionRoleArray,
    });
    // -----------
  }

  async roleSeed($tx?: any) {
    const prisma = $tx || this.prisma;

    // Check if roles already exist
    const existingRoles = await prisma.role.findMany();
    if (existingRoles.length > 0) {
      console.log('⚠️  Roles already exist, skipping creation');
      return;
    }

    await prisma.role.createMany({
      data: [
        // system role
        {
          id: '1',
          title: 'Super Admin', // system admin, do not assign to a tenant/user
          name: 'su_admin',
        },
        // organization role
        {
          id: '2',
          title: 'Admin',
          name: 'admin',
        },
        {
          id: '3',
          title: 'Project Manager',
          name: 'project_manager',
        },
        {
          id: '4',
          title: 'Member',
          name: 'member',
        },
        {
          id: '5',
          title: 'Viewer',
          name: 'viewer',
        },
      ],
    });
  }
}
