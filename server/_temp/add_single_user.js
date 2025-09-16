const { MongoClient } = require('mongodb');
const crypt = require('../libs/crypt');

// ============================================
// CONFIGURATION: Modify these values to create a new user
// ============================================
const NEW_USER = {
    email: 'v@bizlab.com',        // Change this email
    password: '123',              // Change this password
    name: 'vikash',                // Change this name
    role: 'superadmin',                         // Options: 'user', 'admin', 'superadmin'
    database: 'bizlab',                  // Options: 'parasim', 'bizlab', 'parasim_demo', 'bizlab_demo'
    roll_no: 'USER001'                    // Optional: Only for 'user' role
};

// Generate a simple UUID function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function createSingleUser() {
    const client = new MongoClient(`mongodb://127.0.0.1:27017/${NEW_USER.database}`);
    
    try {
        await client.connect();
        console.log(`Connected to ${NEW_USER.database} database successfully!`);
        
        const database = client.db();
        const usersCollection = database.collection('users');
        const institutesCollection = database.collection('institutes');
        
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: NEW_USER.email });
        if (existingUser) {
            console.log(`❌ User with email ${NEW_USER.email} already exists!`);
            console.log(`   Existing user: ${existingUser.name} (${existingUser.role})`);
            return;
        }
        
        // Get any existing institute (or create a default one)
        let institute = await institutesCollection.findOne({});
        
        if (!institute) {
            console.log('No institute found, creating a default one...');
            institute = {
                key: generateUUID(),
                name: `${NEW_USER.database} Default Institute`,
                address: 'Default Address',
                city: 'Default City',
                state: 'Default State',
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
            console.log(`Created default institute: ${institute.name}`);
        }
        
        // Create the new user
        const newUser = {
            key: generateUUID(),
            email: NEW_USER.email,
            password: crypt.hash(NEW_USER.password),
            name: NEW_USER.name,
            role: NEW_USER.role,
            institute_key: institute.key,
            licenses: [institute.licenses[0].key]
        };
        
        // Add roll_no for users (students)
        if (NEW_USER.role === 'user' && NEW_USER.roll_no) {
            newUser.roll_no = NEW_USER.roll_no;
        }
        
        await usersCollection.insertOne(newUser);
        
        console.log('\n✅ USER CREATED SUCCESSFULLY!');
        console.log('================================');
        console.log(`Database: ${NEW_USER.database}`);
        console.log(`Email: ${NEW_USER.email}`);
        console.log(`Password: ${NEW_USER.password}`);
        console.log(`Name: ${NEW_USER.name}`);
        console.log(`Role: ${NEW_USER.role}`);
        if (NEW_USER.roll_no) {
            console.log(`Roll No: ${NEW_USER.roll_no}`);
        }
        console.log(`Institute: ${institute.name}`);
        
        // Show total user count
        const totalUsers = await usersCollection.countDocuments();
        console.log(`\nTotal users in ${NEW_USER.database} database: ${totalUsers}`);
        
        console.log('\n🌐 LOGIN INSTRUCTIONS:');
        console.log('========================');
        if (NEW_USER.database === 'parasim') {
            console.log('1. Go to: http://localhost:3000');
        } else if (NEW_USER.database === 'bizlab') {
            console.log('1. Go to: http://localhost:3500 or http://localhost:4000');
        } else {
            console.log(`1. Go to the appropriate URL for ${NEW_USER.database}`);
        }
        console.log(`2. Login with: ${NEW_USER.email} / ${NEW_USER.password}`);
        
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        console.error(error.stack);
    } finally {
        await client.close();
    }
}

// Validation
console.log('🔧 CREATING USER WITH FOLLOWING DETAILS:');
console.log('========================================');
console.log(`Email: ${NEW_USER.email}`);
console.log(`Name: ${NEW_USER.name}`);
console.log(`Role: ${NEW_USER.role}`);
console.log(`Database: ${NEW_USER.database}`);
if (NEW_USER.roll_no) {
    console.log(`Roll No: ${NEW_USER.roll_no}`);
}
console.log('');

// Validate role
if (!['user', 'admin', 'superadmin'].includes(NEW_USER.role)) {
    console.error('❌ Invalid role! Must be: user, admin, or superadmin');
    process.exit(1);
}

// Validate database
if (!['parasim', 'bizlab', 'parasim_demo', 'bizlab_demo', 'parasim_test', 'bizlab_test'].includes(NEW_USER.database)) {
    console.error('❌ Invalid database! Must be: parasim, bizlab, parasim_demo, bizlab_demo, parasim_test, bizlab_test');
    process.exit(1);
}

createSingleUser();
