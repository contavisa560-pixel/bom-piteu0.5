const mongoose = require('mongoose');

const uri = 'mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Ì¥ó Testando conex√£o com Atlas...');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('‚úÖ Conex√£o bem-sucedida!');
    
    // Listar bancos de dados
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('\nÌ≥Å Bancos de dados dispon√≠veis:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Ver cole√ß√µes no bompiteu_db
    const collections = await mongoose.connection.db.collections();
    console.log('\nÌ∑ÇÔ∏è Cole√ß√µes no banco atual:');
    collections.forEach(col => {
      console.log(`  - ${col.collectionName}`);
    });
    
    // Contar documentos na cole√ß√£o users
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\nÌ±§ Total de usu√°rios: ${userCount}`);
    
    // Ver um documento de exemplo
    const sampleUser = await mongoose.connection.db.collection('users').findOne({});
    if (sampleUser) {
      console.log('\nÌ≥Ñ Documento de exemplo:');
      console.log(JSON.stringify(sampleUser, null, 2).substring(0, 500) + '...');
    }
    
    mongoose.disconnect();
    console.log('\n‚úÖ Teste conclu√≠do!');
    
  } catch (error) {
    console.error('‚ùå Erro:', error.message);
  }
}

testConnection();
