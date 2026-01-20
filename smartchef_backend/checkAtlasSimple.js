const mongoose = require('mongoose');

// SUA STRING DO .env (substitua com a real)
const uri = 'mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority';

console.log('Ì¥ó Tentando conectar ao Atlas...');
console.log('URI:', uri.replace(/\/\/[^@]+@/, '//***:***@')); // Esconde credenciais

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('‚úÖ Conectado ao MongoDB Atlas!');
  
  // Carregar o modelo User
  const User = require('./models/User');
  
  // Contar usu√°rios
  const count = await User.countDocuments();
  console.log(`Ì≥ä Total de usu√°rios: ${count}`);
  
  // Buscar um usu√°rio com certifica√ß√µes
  const user = await User.findOne({
    'settings.experience.certifications': { $exists: true, $not: { $size: 0 } }
  }).select('name email settings.experience.certifications');
  
  if (user) {
    console.log('\nÌ±§ Usu√°rio encontrado com certifica√ß√µes:');
    console.log(`Nome: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`N√∫mero de certifica√ß√µes: ${user.settings?.experience?.certifications?.length || 0}`);
    
    if (user.settings?.experience?.certifications) {
      console.log('\nÌ≥ú Lista de certifica√ß√µes:');
      user.settings.experience.certifications.forEach((cert, i) => {
        console.log(`\n  ${i + 1}. ${cert.name}`);
        console.log(`     ID: ${cert.id}`);
        console.log(`     Tipo: ${cert.type}`);
        console.log(`     Tamanho: ${cert.size} bytes`);
        console.log(`     Data: ${new Date(cert.uploadedAt).toLocaleString()}`);
      });
    }
  } else {
    console.log('\n‚ùå Nenhum usu√°rio com certifica√ß√µes encontrado.');
  }
  
  // Ver todos os usu√°rios rapidamente
  console.log('\nÌ±• Lista r√°pida de usu√°rios:');
  const allUsers = await User.find({})
    .select('name email')
    .limit(5);
  
  allUsers.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.name} (${u.email})`);
  });
  
  await mongoose.disconnect();
  console.log('\n‚úÖ Verifica√ß√£o conclu√≠da!');
})
.catch(err => {
  console.error('‚ùå Erro de conex√£o:', err.message);
  console.log('\nÌ≤° Poss√≠veis problemas:');
  console.log('   1. String de conex√£o incorreta');
  console.log('   2. IP n√£o est√° na whitelist do Atlas');
  console.log('   3. Problemas de rede/firewall');
});
