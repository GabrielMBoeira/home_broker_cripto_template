const express = require('express');
const api = require('./api');
const app = express();
const path = require('path');
const profitability = process.env.PROFITABILITY;
const symbol = process.env.SYMBOL;
const interval = process.env.CRAWLER_INTERVAL;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/data', async (req, res) => {

    const data = {};

    const mercado = await api.depth(symbol);    
    data.buy = mercado.bids.length ? mercado.bids[0][0] : 0;
    data.sell = mercado.asks.length ? mercado.asks[0][0] : 0;

    const carteira = await api.accountInfo();
    const coins = carteira.balances.filter(b => symbol.indexOf(b.asset) !== -1);
    data.coins = coins;

    const sellPrice = parseFloat(data.sell);

    //-----------------------//
    //Lógica do bot - INÍCIO //
    //-----------------------//

    ////--POSICIONANDO COMPRA
    console.log('Verificando se tenho grana...');
    //--COMPRAR  
    if (sellPrice && sellPrice < 400.40) {
        
        console.log('Consultar carteira - Bom de comprar');
        const carteira = await api.accountInfo();
        const coins = carteira.balances;
        //--const coins = carteira.balances.filter(b => b.asset === 'BUSD' || b.asset === 'BNBBUSD');
        // console.log('----------------Resultado da carteira----------------');
        // console.log(coins);
        // console.log('-----------------------------------------------------');
        
        
        ////--POSICIONANDO COMPRA
        console.log('Verificando se tenho grana...');
        // --const walletCoin = parseFloat(coins.find(c => c.asset.endsWith('USD')).free); // Em produção poderá dar diferença devido a nomes das moedas.
        const walletCoin = parseFloat(coins.find(c => c.asset === 'BUSD').free).toFixed(5);
        // const qty = parseFloat((walletCoin / sellPrice) - 0.00001).toFixed(5); //Cálculo para dividir quantity em fação.
        const qty = 1 //TESTE
        console.log(`Qty: ${qty}`);
        console.log(`Total Coin:  ${walletCoin}`);

        if (qty > 0) {
            //--Ordem de compra: console.log(await api.newOrder(symbol, 1)) //situação geral da operação
            const buyOrder = await api.newOrder(symbol, qty);
            data.buyOrder = buyOrder;   
            console.log(`orderId: ${buyOrder.orderId}`);
            console.log(`status: ${buyOrder.status}`);


            //--POSICIONANDO VENDA
            console.log('Posicionando venda futura!!!');
            const price = parseFloat(sellPrice * profitability).toFixed(5);

            console.log(`Vendendo por ${price} (${profitability})`);
            const sellOrder = await api.newOrder(symbol, qty, price, 'SELL', 'MARKET');
            data.sellOrder = sellOrder;
            console.log(`orderId: ${sellOrder.orderId}`);
            console.log(`status: ${sellOrder.status}`);
        }

        console.log('----------------Resultado da carteira----------------');
        console.log(coins);
        console.log('-----------------------------------------------------');

        //--VENDER
    } else if (buy && buy > 1000) {
        console.log('Bom para vender');

        //--AGUARDANDO MERCADO
    // } else {
        console.log('Aguardando mercado');
    }

    //-----------------------//
    //Lógica do bot - FIM //
    //-----------------------//

    res.json(data);

})

app.use('/', (req, res) => {
    console.log('Entrou');
    res.render('app', {
        symbol: symbol,
        profitability: profitability,
        lastUpdate: new Date(),
        interval: parseInt(interval)
    });
});


app.listen(process.env.PORT, () => {
    console.log('App rodando');
})