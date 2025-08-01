import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

async function listStripePrices() {
  try {
    console.log('🔍 Listando todos os preços do Stripe...\n');
    
    // Listar todos os preços
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ['data.product']
    });

    console.log(`📊 Total de preços encontrados: ${prices.data.length}\n`);

    // Agrupar por produto
    const pricesByProduct = {};
    
    for (const price of prices.data) {
      const productName = price.product.name;
      if (!pricesByProduct[productName]) {
        pricesByProduct[productName] = [];
      }
      pricesByProduct[productName].push({
        price_id: price.id,
        product_id: price.product.id,
        amount: price.unit_amount / 100,
        currency: price.currency,
        recurring: price.recurring,
        active: price.active
      });
    }

    // Exibir preços organizados por produto
    for (const [productName, productPrices] of Object.entries(pricesByProduct)) {
      console.log(`🏷️  Produto: ${productName}`);
      console.log(`   Product ID: ${productPrices[0].product_id}`);
      
      productPrices.forEach(price => {
        const interval = price.recurring ? `${price.recurring.interval_count} ${price.recurring.interval}(s)` : 'one-time';
        console.log(`   💰 Price ID: ${price.price_id}`);
        console.log(`      Valor: R$ ${price.amount.toFixed(2)}`);
        console.log(`      Recorrência: ${interval}`);
        console.log(`      Ativo: ${price.active ? '✅' : '❌'}`);
        console.log('');
      });
      console.log('---\n');
    }

  } catch (error) {
    console.error('❌ Erro ao listar preços:', error.message);
  }
}

listStripePrices();