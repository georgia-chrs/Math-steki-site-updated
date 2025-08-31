import bcrypt from 'bcryptjs';

// Δημιουργία διαφορετικών κωδικών για διαφορετικούς χρήστες
console.log('=== HASHING PASSWORDS ===');

// Για admin
const adminPassword = "admin123";
const adminHash = bcrypt.hashSync(adminPassword, 10);
console.log(`Admin: username='admin', password='${adminPassword}', hash='${adminHash}'`);

// Για mariaio
const mariaPassword = "maria123";
const mariaHash = bcrypt.hashSync(mariaPassword, 10);
console.log(`Maria: username='mariaio', password='${mariaPassword}', hash='${mariaHash}'`);

// Για giannisp
const giannisPassword = "giannis123";
const giannisHash = bcrypt.hashSync(giannisPassword, 10);
console.log(`Giannis: username='giannisp', password='${giannisPassword}', hash='${giannisHash}'`);

// Για kostasd
const kostasPassword = "kostas123";
const kostasHash = bcrypt.hashSync(kostasPassword, 10);
console.log(`Kostas: username='kostasd', password='${kostasPassword}', hash='${kostasHash}'`);

console.log('\n=== COPY THESE TO SQL ===');
console.log('UPDATE Admins SET password_hash = "' + adminHash + '" WHERE username = "admin";');
console.log('UPDATE Admins SET password_hash = "' + mariaHash + '" WHERE username = "mariaio";');
console.log('UPDATE Students SET password_hash = "' + mariaHash + '" WHERE username = "mariaio";');
console.log('UPDATE Students SET password_hash = "' + giannisHash + '" WHERE username = "giannisp";');
console.log('UPDATE Students SET password_hash = "' + kostasHash + '" WHERE username = "kostasd";');