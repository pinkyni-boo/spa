const mongoose = require('mongoose');
const Service = require('./models/Service');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('✅ Connected DB');
    
    const services = await Service.find({});
    console.log(`Found ${services.length} services.`);
    
    console.log('--- PRODUCTS (type="product") ---');
    const products = services.filter(s => s.type === 'product');
    products.forEach(p => console.log(`- ${p.name} (${p.price})`));

    console.log('--- OTHERS ---');
    const others = services.filter(s => s.type !== 'product');
    if (others.length > 0) {
        console.log(`First 3 others:`);
        others.slice(0, 3).forEach(o => console.log(`- ${o.name} [Type: ${o.type}]`));
    }
    
    process.exit();
  })
  .catch(err => console.error(err));
