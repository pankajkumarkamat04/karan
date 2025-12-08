// Test login with the reset password
const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

const email = 'karanchandani95@gmail.com';
const password = 'password123';

(async () => {
    try {
        // Get the hashed password from database
        const query = `SELECT password FROM users WHERE email = '${email}';`;
        const result = execSync(`docker exec postgres psql -U postgres -d ecommerce -t -c "${query}"`, { encoding: 'utf-8' });
        const hashedPassword = result.trim();
        
        if (!hashedPassword || hashedPassword === '') {
            console.error('❌ No password found for user');
            process.exit(1);
        }
        
        console.log('Testing password validation...');
        console.log('Email:', email);
        console.log('Password to test:', password);
        console.log('Hashed password (first 30 chars):', hashedPassword.substring(0, 30) + '...');
        
        // Test if password matches
        const isValid = await bcrypt.compare(password, hashedPassword);
        
        if (isValid) {
            console.log('\n✓ Password validation successful!');
            console.log('The password is correct.');
        } else {
            console.log('\n✗ Password validation failed!');
            console.log('The password does not match the hash.');
            console.log('\nResetting password again...');
            
            // Reset again
            const newHash = await bcrypt.hash(password, 10);
            const escapedHash = newHash.replace(/'/g, "''");
            const escapedEmail = email.replace(/'/g, "''");
            const updateQuery = `UPDATE users SET password = '${escapedHash}' WHERE email = '${escapedEmail}';`;
            execSync(`docker exec postgres psql -U postgres -d ecommerce -c "${updateQuery}"`, { stdio: 'inherit' });
            console.log('\n✓ Password has been reset again. Please try logging in now.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();

