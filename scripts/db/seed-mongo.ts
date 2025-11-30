import { command, run, string, number, option, flag } from 'cmd-ts';
import { faker, fakerEN_US } from '@faker-js/faker'
import { getObjectId, Seeder } from 'mongo-seeding'
import { randomInt } from 'node:crypto';
import { IRole, Role } from '@/models/Role';
import { IUser, User } from '@/models/User';
import { IDocumentUpdate, DocumentUpdate } from '@/models/DocumentUpdate';
import { IPermission, Permission } from '@/models/Permission';
import { OnboardingStage } from '@/util/stage'

const statePing: IPermission = new Permission({
    name: 'state_ping',
});
const banUser: IPermission = new Permission({
    name: 'ban_user',
});
const read: IPermission = new Permission({
    name: 'read',
});
const codingBuddies: IPermission = new Permission({
    name: 'coding_buddies',
});

const roles: IRole[] = [
    new Role({
        name: 'State Lead',
        permissions: [ statePing, banUser, read ],
    }),
    new Role({
        name: 'Massachusetts',
        permissions: [ read ],
    }),
    new Role({
        name: 'Admin',
        permissions: [ banUser, read ],
    }),
    new Role({
        name: 'Moderator',
        permissions: [ banUser ],
    }),
    new Role({
        name: 'Software Engineer',
        permissions: [ read, codingBuddies ],
    }),
];

function getUsers(roles: IRole[]): IUser[] {
    return Array.from(Array(10))
        .map(() => {
            // Assign up to 3 random roles per user
            const userRoles: IRole[] = Array.from(Array(randomInt(3)))
                .map(() => roles[randomInt(roles.length)]);
            const state = fakerEN_US.location.state({ abbreviated: true });
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const userId = getObjectId(`${firstName} ${lastName}`);

            return new User({
                id: userId,
                firstName,
                lastName,
                email: faker.internet.email({ firstName, lastName }),
                discordId: faker.string.numeric({ length: 19, allowLeadingZeros: true }),
                dateOfBirth: faker.date.past({ years: 18 }),
                roles: userRoles,
                state,
                zipCode: fakerEN_US.location.zipCode({ state }),
                city: fakerEN_US.location.city(),
                acceptedAlerts: randomInt(2) != 0,
                verified: true,
                phoneNumber: fakerEN_US.phone.number({ style: 'national' }),
                onboardingStage: OnboardingStage.JOINED,
            });
        });
}

function getUpdateHistory(users: IUser[]): IDocumentUpdate[] {
    return users.flatMap(user => {
        // Generate a random number of updates for the user
        const numUpdates = randomInt(3);
        const updateHistory: IDocumentUpdate[] = Array.from(Array(numUpdates))
            .map((i: number) => new DocumentUpdate({
                collection_name: 'users',
                document_id: user._id,
                field_name: 'firstName',
                previous_value: faker.person.firstName(),
                // Use the actual firstName to make the last update match up nicely
                new_value: i == (numUpdates - 1) ? user.firstName : faker.person.firstName(),
                updated_by: user._id,
            }));

        user.updateHistory = updateHistory;

        return updateHistory;
    });
}

const cmd = command({
    name: 'seed-mongo',
    description: 'Seed a local MongoDB server with test data',
    version: '1.0.0',
    args: {
        host: option({
            long: 'host',
            short: 'u',
            description: 'The host of the MongoDB server',
            type: string,
            defaultValue: () => '127.0.0.1',
        }),
        port: option({
            long: 'port',
            short: 'p',
            description: 'The port of the MongoDB server',
            type: number,
            defaultValue: () => 27017,
        }),
        databaseName: option({
            long: 'database-name',
            description: 'The name of the database to connect to',
            type: string,
            defaultValue: () => 'test',
        }),
        dropDatabase: flag({
            long: 'drop-database',
            description: 'Purge the database before seeding it',
            defaultValue: () => false,
        }),
        roles: flag({
            long: 'roles',
            short: 'r',
            description: 'Seed the local DB with permissions and roles',
            defaultValue: () => false,
        }),
        users: flag({
            long: 'users',
            short: 'u',
            description: 'Seed the local DB with users and update history',
            defaultValue: () => false,
        }),
        all: flag({
            long: 'all',
            short: 'a',
            description: 'Seed the local DB with permissions, roles, users, and update history',
            defaultValue: () => false,
        }),
    },
    handler: (args) => {
        if (!(args.roles || args.users || args.all)) {
            console.error('Must specify how to seed the database. Run pnpm run seed-db -h for instructions.');
            process.exit(1);
        }

        const shouldSeedRoles = args.roles || args.all;
        const shouldSeedUsers = args.users || args.all;

        const seeder: Seeder = new Seeder({
            database: {
                host: args.host,
                port: args.port,
                name: args.databaseName,
                protocol: 'mongodb',
            },
            dropDatabase: args.dropDatabase,
        });

        if (shouldSeedRoles) {
            console.info("Seeding roles and permissions...");

            seeder.import([
                {
                    name: 'permissions',
                    documents: [ statePing, read, banUser, codingBuddies ],
                },
                {
                    name: 'roles',
                    documents: roles,
                }
            ])
            .then(() => {
                console.info('Successfully seeded roles');
            })
            .catch((err) => {
                console.error('Failed to seed roles:', err);
            })
        }

        if (shouldSeedUsers) {
            console.info("Seeding users and update history...");
            const users = getUsers(roles);
            const updateHistory = getUpdateHistory(users);

            seeder.import([
                ...(updateHistory.length > 0 ? [{
                    name: 'document_updates',
                    documents: updateHistory,
                }] : []),
                {
                    name: 'users',
                    documents: users,
                },
            ])
            .then(() => {
                console.info('Successfully seeded users and update history');
            })
            .catch((err) => {
                console.error('Failed to seed users and update history:', err);
            })
        }
    },
})

await run(cmd, process.argv.slice(2));
