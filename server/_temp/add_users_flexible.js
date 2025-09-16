const { MongoClient } = require('mongodb');
const crypt = require('../libs/crypt');

// Configuration: Add your users here
const USERS_TO_CREATE = [
    // Super Admins
    {
        email: 'vikash@parasim.com',
        password: 'admin123',
        name: 'Vikash Lanjhikar',
        role: 'superadmin',
        database: 'parasim'
    },
    {
        email: 'vikash@bizlab.com',
        password: 'admin123',
        name: 'Vikash Lanjhikar',
        role: 'superadmin',
        database: 'bizlab'
    },
    
    // Admins
    {
        email: 'admin1@parasim.com',
        password: 'admin123',
        name: 'Admin One',
        role: 'admin',
        database: 'parasim'
    },
    {
        email: 'admin1@bizlab.com',
        password: 'admin123',
        name: 'Admin One',
        role: 'admin',
        database: 'bizlab'
    },
    
    // Regular Users
    {
        email: 'student1@parasim.com',
        password: 'student123',
        name: 'Student One',
        role: 'user',
        database: 'parasim',
        roll_no: 'STU001'
    },
    {
        email: 'student2@parasim.com',
        password: 'student123',
        name: 'Student Two',
        role: 'user',
        database: 'parasim',
        roll_no: 'STU002'
    },
    {
        email: 'student1@bizlab.com',
        password: 'student123',
        name: 'Student One',
        role: 'user',
        database: 'bizlab',
        roll_no: 'BIZ001'
    },
    {
        email: 'student2@bizlab.com',
        password: 'student123',
        name: 'Student Two',
        role: 'user',
        database: 'bizlab',
        roll_no: 'BIZ002'
    }
];

// Generate a simple UUID function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function getOrCreateInstitute(db, instituteName, instituteDisplayName) {
    const institutesCollection = db.collection('institutes');
    
    let institute = await institutesCollection.findOne({ name: instituteDisplayName });
    
    if (!institute) {
        institute = {
            key: generateUUID(),
            name: instituteDisplayName,
            address: `${instituteDisplayName} Address`,
            city: 'Test City',
            state: 'Test State',
            licenses: [{
                key: generateUUID(),
                start_date: '2024-01-01',
                end_date: '2025-12-31',
                no_of_licenses: 100,
                used: 0,
                status: 'active'
            }]
        };
        
        await institutesCollection.insertOne(institute);
        console.log(`Created institute: ${instituteDisplayName}`);
    }
    
    return institute;
}

async function createUsersForDatabase(dbName) {
    const client = new MongoClient(`mongodb://127.0.0.1:27017/${dbName}`);
    
    try {
        await client.connect();
        console.log(`\n=== Processing ${dbName.toUpperCase()} Database ===`);
        
        const database = client.db();
        const usersCollection = database.collection('users');
        
        // Get or create institute for this database
        const instituteName = dbName === 'parasim' ? 'Test Institute' : 
                            dbName === 'bizlab' ? 'Bizlab Test Institute' :
                            `${dbName} Institute`;
        const institute = await getOrCreateInstitute(database, dbName, instituteName);
        
        // Filter users for this database
        const usersForThisDb = USERS_TO_CREATE.filter(user => user.database === dbName);
        
        let createdCount = 0;
        let existingCount = 0;
        
        for (const userData of usersForThisDb) {
            const existingUser = await usersCollection.findOne({ email: userData.email });
            
            if (!existingUser) {
                const newUser = {
                    key: generateUUID(),
                    email: userData.email,
                    password: crypt.hash(userData.password),
                    name: userData.name,
                    role: userData.role,
                    institute_key: institute.key,
                    licenses: [institute.licenses[0].key]
                };
                
                // Add roll_no for students
                if (userData.roll_no) {
                    newUser.roll_no = userData.roll_no;
                }
                
                await usersCollection.insertOne(newUser);
                console.log(`✅ Created: ${userData.email} (${userData.role}) - ${userData.name}`);
                createdCount++;
            } else {
                console.log(`⚠️  Already exists: ${userData.email}`);
                existingCount++;
            }
        }
        
        console.log(`\n${dbName} Summary: ${createdCount} created, ${existingCount} already existed`);
        
        // Show total user count
        const totalUsers = await usersCollection.countDocuments();
        console.log(`Total users in ${dbName}: ${totalUsers}`);
        
    } catch (error) {
        console.error(`Error processing ${dbName}:`, error.message);
    } finally {
        await client.close();
    }
}

async function main() {
    console.log('🚀 Starting flexible user creation process...\n');
    
    // Get unique databases from user config
    const databases = [...new Set(USERS_TO_CREATE.map(user => user.database))];
    console.log(`Will process databases: ${databases.join(', ')}`);
    
    // Process each database
    for (const dbName of databases) {
        await createUsersForDatabase(dbName);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 User creation process completed!');
    console.log('\n🔐 LOGIN CREDENTIALS CREATED:');
    
    // Group and display credentials by database
    const dbGroups = {};
    USERS_TO_CREATE.forEach(user => {
        if (!dbGroups[user.database]) {
            dbGroups[user.database] = [];
        }
        dbGroups[user.database].push(user);
    });
    
    Object.keys(dbGroups).forEach(dbName => {
        console.log(`\n📁 ${dbName.toUpperCase()} Database:`);
        dbGroups[dbName].forEach(user => {
            console.log(`  ${user.role.padEnd(10)} | ${user.email.padEnd(25)} | ${user.password} | ${user.name}`);
        });
    });
    
    console.log('\n🌐 Access the application at:');
    console.log('  - Parasim: http://localhost:3000 (port 3000)');
    console.log('  - Bizlab: http://localhost:3500 (port 3500) or http://localhost:4000 (port 4000)');
    console.log('\n✅ You can now login with any of the credentials above!');
}

main();
