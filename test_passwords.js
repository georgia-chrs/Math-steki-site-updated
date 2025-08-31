import bcrypt from 'bcryptjs';

// Το hash που βλέπουμε στη βάση
const storedHash = '$2b$10$Jgugq7famjoLDGhsGxum9u/LYPhd6MpDoPkLUlpKsDHCYJ3SoiPcK';

// Δοκιμή διαφόρων κωδικών
const passwords = ['123', '123456', 'admin123', 'maria123', 'kostas123'];

console.log('🔍 Ελέγχω ποιος κωδικός ταιριάζει με το hash...\n');

for (const password of passwords) {
    const isMatch = bcrypt.compareSync(password, storedHash);
    console.log(`Password: "${password}" -> ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
}

console.log('\n📝 Δημιουργώ νέα hashes για σιγουριά:');
console.log(`Hash για "123": ${bcrypt.hashSync('123', 10)}`);
console.log(`Hash για "123456": ${bcrypt.hashSync('123456', 10)}`);
console.log(`Hash για "kostasd": ${bcrypt.hashSync('kostasd', 10)}`);
