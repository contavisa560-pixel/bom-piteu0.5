const mongoose = require('mongoose');

const uri = 'mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Ì¥ó Testando conex√£o com Atlas...');
    
    // Conex√£o simplificada para Mongoose 6+
    await mongoose.connect(uri);
    
    console.log('‚úÖ Conex√£o bem-sucedida!');
    
    // Verificar conex√£o
    console.log('\nÌ≥ä Status da conex√£o:');
    console.log('  Host:', mongoose.connection.host);
    console.log('  Port:', mongoose.connection.port);
    console.log('  Database:', mongoose.connection.name);
    console.log('  Estado:', mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado');
    
    // Listar bancos de dados (usando driver nativo)
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\nÌ≥Å Bancos de dados dispon√≠veis:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Ver cole√ß√µes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nÌ∑ÇÔ∏è Cole√ß√µes no banco atual:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Contar usu√°rios
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\nÌ±§ Total de usu√°rios: ${userCount}`);
    
    if (userCount > 0) {
      // Ver um usu√°rio com experi√™ncia
      const userWithExp = await mongoose.connection.db.collection('users')
        .findOne({
          'settings.experience': { $exists: true }
        });
      
      if (userWithExp) {
        console.log('\nÌ¥ç Usu√°rio com experi√™ncia encontrado:');
        console.log(`  Nome: ${userWithExp.name || 'N√£o definido'}`);
        console.log(`  Email: ${userWithExp.email || 'N√£o definido'}`);
        
        if (userWithExp.settings?.experience) {
          const exp = userWithExp.settings.experience;
          console.log(`  N√≠vel: ${exp.level || 'N√£o definido'}`);
          console.log(`  Anos: ${exp.years || 0}`);
          console.log(`  T√©cnicas: ${exp.techniques?.length || 0}`);
          console.log(`  Equipamentos: ${exp.equipment?.length || 0}`);
          console.log(`  Certifica√ß√µes: ${exp.certifications?.length || 0}`);
          
          if (exp.certifications?.length > 0) {
            console.log('\nÌ≥ú Certifica√ß√µes armazenadas:');
            exp.certifications.forEach((cert, i) => {
              console.log(`\n  ${i + 1}. ${cert.name || 'Sem nome'}`);
              console.log(`     ID: ${cert.id || 'Sem ID'}`);
              console.log(`     Tipo: ${cert.type || 'N√£o especificado'}`);
              console.log(`     Tamanho: ${cert.size ? `${cert.size} bytes` : 'Desconhecido'}`);
              if (cert.uploadedAt) {
                console.log(`     Data: ${new Date(cert.uploadedAt).toLocaleString()}`);
              }
            });
          }
        }
      } else {
        console.log('\n‚ö†Ô∏è  Nenhum usu√°rio com settings.experience encontrado.');
      }
      
      // Mostrar todos os usu√°rios (nomes apenas)
      console.log('\nÌ±• Lista de usu√°rios:');
      const allUsers = await mongoose.connection.db.collection('users')
        .find({}, { projection: { name: 1, email: 1 } })
        .limit(10)
        .toArray();
      
      allUsers.forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.name || 'Sem nome'} (${user.email || 'Sem email'})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n‚úÖ Verifica√ß√£o conclu√≠da com sucesso!');
    
  } catch (error) {
    console.error('\n‚ùå Erro:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\nÌ¥ê Problema de autentica√ß√£o:');
      console.log('  1. Verifique usu√°rio e senha');
      console.log('  2. Verifique se o usu√°rio tem permiss√µes no banco');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\nÌºê Problema de DNS/resolu√ß√£o:');
      console.log('  1. Verifique sua conex√£o com a internet');
      console.log('  2. O dom√≠nio "cluster.jfrxvdu.mongodb.net" existe?');
    } else if (error.message.includes('timed out')) {
      console.log('\n‚è∞ Timeout na conex√£o:');
      console.log('  1. Verifique firewall/antiv√≠rus');
      console.log('  2. Adicione seu IP √† whitelist do Atlas');
    }
    
    console.log('\nÌ≤° String de conex√£o usada:');
    console.log(uri.replace(/\/\/[^@]+@/, '//***:***@'));
  }
}

testConnection();
