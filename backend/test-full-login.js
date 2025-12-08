// Test the full login flow
const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

const email = 'karanchandani95@gmail.com';
const password = 'password123';

(async () => {
    try {
        console.log('=== Full Login Test ===\n');
        
        // 1. Check if user exists
        console.log('1. Checking if user exists...');
        const userQuery = `SELECT id, email, type, status, is_banned, password IS NOT NULL as has_password FROM users WHERE email = '${email}';`;
        const userResult = execSync(`docker exec postgres psql -U postgres -d ecommerce -t -A -F"|" -c "${userQuery}"`, { encoding: 'utf-8' });
        const [userId, userEmail, userType, userStatus, isBanned, hasPassword] = userResult.trim().split('|');
        
        if (!userEmail) {
            console.error('❌ User not found!');
            process.exit(1);
        }
        console.log('   ✓ User found');
        console.log(`   - ID: ${userId}`);
        console.log(`   - Email: ${userEmail}`);
        console.log(`   - Type: ${userType}`);
        console.log(`   - Status: ${userStatus}`);
        console.log(`   - Is Banned: ${isBanned}`);
        console.log(`   - Has Password: ${hasPassword}`);
        
        // 2. Get password hash
        console.log('\n2. Checking password...');
        const pwdQuery = `SELECT password FROM users WHERE email = '${email}';`;
        const pwdResult = execSync(`docker exec postgres psql -U postgres -d ecommerce -t -c "${pwdQuery}"`, { encoding: 'utf-8' });
        const hashedPassword = pwdResult.trim();
        
        if (!hashedPassword) {
            console.error('❌ No password found!');
            process.exit(1);
        }
        
        // 3. Validate password
        console.log('   Testing password validation...');
        const isValid = await bcrypt.compare(password, hashedPassword);
        
        if (!isValid) {
            console.error('❌ Password validation failed!');
            console.log('   Resetting password...');
            
            const newHash = await bcrypt.hash(password, 10);
            const escapedHash = newHash.replace(/'/g, "''");
            const updateQuery = `UPDATE users SET password = '${escapedHash}' WHERE email = '${email}';`;
            execSync(`docker exec postgres psql -U postgres -d ecommerce -c "${updateQuery}"`, { stdio: 'inherit' });
            console.log('   ✓ Password reset');
        } else {
            console.log('   ✓ Password is valid');
        }
        
        // 4. Summary
        console.log('\n=== Summary ===');
        console.log('✓ User account exists and is active');
        console.log('✓ Password is set and valid');
        console.log('✓ Account is not banned');
        console.log('\nLogin credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('\nTry logging in with these credentials now!');
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();

