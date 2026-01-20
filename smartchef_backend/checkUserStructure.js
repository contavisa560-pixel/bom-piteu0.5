const mongoose = require('mongoose');

const uri = 'mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority';

async function checkUserStructure() {
  await mongoose.connect(uri);
  
  const user = await mongoose.connection.db.collection('users')
    .findOne({ email: 'bgegs@gmail.com' });
  
  if (!user) {
    console.log('‚ùå Usu√°rio n√£o encontrado');
    return;
  }
  
  console.log('Ì¥ç ESTRUTURA COMPLETA DO USU√ÅRIO:');
  console.log('===================================\n');
  
  console.log('Ì±§ DADOS B√ÅSICOS:');
  console.log(`  Nome: ${user.name}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  ID: ${user._id}`);
  console.log(`  Premium: ${user.isPremium ? 'Sim' : 'N√£o'}`);
  console.log(`  N√≠vel: ${user.level || 1}`);
  console.log(`  Pontos: ${user.points || 0}`);
  
  console.log('\n‚öôÔ∏è  SETTINGS:');
  if (user.settings) {
    console.log(`  ‚Ä¢ Tema: ${user.settings.theme || 'N√£o definido'}`);
    console.log(`  ‚Ä¢ Idioma: ${user.settings.language || 'N√£o definido'}`);
    
    if (user.settings.experience) {
      console.log('\n  Ì∑ë‚ÄçÌΩ≥ EXPERI√äNCIA CULIN√ÅRIA:');
      const exp = user.settings.experience;
      console.log(`    ‚Ä¢ N√≠vel: ${exp.level || 'N√£o definido'}`);
      console.log(`    ‚Ä¢ Anos: ${exp.years || 0}`);
      console.log(`    ‚Ä¢ T√©cnicas: ${exp.techniques?.length || 0}`);
      console.log(`    ‚Ä¢ Equipamentos: ${exp.equipment?.length || 0}`);
      console.log(`    ‚Ä¢ Certifica√ß√µes: ${exp.certifications?.length || 0}`);
      
      if (exp.certifications?.length > 0) {
        console.log('\n    Ì≥ú CERTIFICA√á√ïES EM DETALHE:');
        exp.certifications.forEach((cert, i) => {
          console.log(`\n      ${i + 1}. ${cert.name}`);
          console.log(`        ID: ${cert.id}`);
          console.log(`        URL: ${cert.url?.substring(0, 80)}...`);
          console.log(`        Tipo: ${cert.type}`);
          console.log(`        Tamanho: ${cert.size} bytes (${(cert.size / 1024).toFixed(2)} KB)`);
          console.log(`        Data de upload: ${new Date(cert.uploadedAt).toISOString()}`);
          console.log(`        Data local: ${new Date(cert.uploadedAt).toLocaleString()}`);
        });
      }
    } else {
      console.log('  ‚ùå Sem experi√™ncia definida');
    }
  } else {
    console.log('  ‚ùå Sem settings definidos');
  }
  
  // Verificar tamanho do documento
  const userSize = JSON.stringify(user).length;
  console.log(`\nÌ≥è TAMANHO DO DOCUMENTO: ${userSize} bytes (${(userSize / 1024).toFixed(2)} KB)`);
  
  await mongoose.disconnect();
}

checkUserStructure().catch(console.error);
