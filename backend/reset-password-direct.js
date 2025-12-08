// Direct password reset - no prompts
const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

const email = process.argv[2] || 'karanchandani95@gmail.com';
const newPassword = process.argv[3] || 'password123';

(async () => {
    try {
        console.log(`Resetting password for: ${email}`);
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const escapedHash = hashedPassword.replace(/'/g, "''");
        const escapedEmail = email.replace(/'/g, "''");
        
        const sqlQuery = `UPDATE users SET password = '${escapedHash}' WHERE email = '${escapedEmail}';`;
        const cmd = `docker exec postgres psql -U postgres -d ecommerce -c "${sqlQuery}"`;
        
        execSync(cmd, { stdio: 'inherit' });
        
        console.log('\n✓ Password reset successfully!');
        console.log(`Email: ${email}`);
        console.log(`New Password: ${newPassword}`);
        console.log('\nPlease change this password after logging in.');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();

