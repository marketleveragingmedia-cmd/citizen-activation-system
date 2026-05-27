const bcrypt = require('bcryptjs');

const passwords = {
  'MasterAdmin2026!': null,
  'MainAdmin2026!': null
};

async function generateHashes() {
  console.log('Generating bcrypt hashes...\n');
  
  for (const [password, _] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    passwords[password] = hash;
    console.log(`Password: ${password}`);
    console.log(`Hash:     ${hash}`);
    console.log();
  }
  
  console.log('Use these hashes in CREATE-ADMIN-ACCOUNTS.sql');
}

generateHashes();
