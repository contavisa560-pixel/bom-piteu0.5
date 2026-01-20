const mongoose = require('mongoose');

const uri = 'mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority';

async function checkAllCertifications() {
  await mongoose.connect(uri);
  
  const users = await mongoose.connection.db.collection('users')
    .find({
      'settings.experience.certifications.0': { $exists: true }
    })
    .project({
      name: 1,
      email: 1,
      'settings.experience.certifications': 1
    })
    .toArray();
  
  console.log(`Ì≥ä Usu√°rios com certifica√ß√µes: ${users.length}\n`);
  
  let totalCerts = 0;
  
  users.forEach((user, userIndex) => {
    const certs = user.settings?.experience?.certifications || [];
    totalCerts += certs.length;
    
    console.log(`Ì±§ ${userIndex + 1}. ${user.name} (${user.email})`);
    console.log(`   Ì≥ú Certifica√ß√µes: ${certs.length}`);
    
    certs.forEach((cert, certIndex) => {
      const date = cert.uploadedAt ? new Date(cert.uploadedAt).toLocaleString() : 'Data desconhecida';
      const sizeKB = cert.size ? (cert.size / 1024).toFixed(2) : '?';
      console.log(`      ${certIndex + 1}. ${cert.name}`);
      console.log(`         Tipo: ${cert.type || 'N√£o especificado'}`);
      console.log(`         Tamanho: ${sizeKB} KB`);
      console.log(`         Data: ${date}`);
      console.log(`         ID: ${cert.id}`);
    });
    console.log('');
  });
  
  console.log(`Ì≥à TOTAL GERAL: ${totalCerts} certifica√ß√µes armazenadas no MongoDB Atlas`);
  
  await mongoose.disconnect();
}

checkAllCertifications().catch(console.error);
