const api = require('./api');
const symbol = process.env.SYMBOL;
const profitability = parseFloat(process.env.PROFITABILITY);

console.log('Iniciando monitoramento!');
setInterval(async () => {

    let buy = 0, sellPrice = 0;

    console.log('Mercado');
    const mercado = await api.depth('BNBBUSD');
    console.log(mercado.bids.length ? `Compra (Maior bids): ${mercado.bids[0][0]}` : 'Sem Compras'); //Maior preço de compras
    console.log(mercado.asks.length ? `Venda (Menor asks): ${mercado.asks[0][0]}` : 'Sem Vendas'); //Menor preço de vendas

    mercado.bids ? buy = parseFloat(mercado.bids[0][0]) : buy = 0;
    mercado.asks ? sellPrice = parseFloat(mercado.asks[0][0]) : asks = 0;

    console.log('*-*-*-*-*-*-*-*-*-*-*-*-*');
    console.log(`Preco ask (sellPrice): ${sellPrice}`);
    console.log('*-*-*-*-*-*-*-*-*-*-*-*-*');


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
        const walletCoin = parseFloat(coins.find(c => c.asset === 'BUSD').free).toFixed(5);
        const qty = parseFloat((walletCoin / sellPrice) - 0.00001).toFixed(5); //Cálculo para dividir quantity em fação.
        console.log(`Qty: ${qty}`);
        console.log(`Total Coin:  ${walletCoin}`);

        if (qty > 0) {
            //--Ordem de compra: console.log(await api.newOrder(symbol, 1)) //situação geral da operação
            // const buyOrder = await api.newOrder(symbol, qty)
            // console.log(`orderId: ${buyOrder.orderId}`)
            // console.log(`status: ${buyOrder.status}`)


            //--POSICIONANDO VENDA
            // console.log('Posicionando venda futura!!!');
            // const price = parseFloat(sellPrice * profitability).toFixed(5);

            // console.log(`Vendendo por ${price} (${profitability})`);
            // const sellOrder = await api.newOrder(symbol, qty, price, 'SELL', 'MARKET');
            // console.log(`orderId: ${sellOrder.orderId}`);
            // console.log(`status: ${sellOrder.status}`);
        }

        console.log('----------------Resultado da carteira----------------');
        console.log(coins);
        console.log('-----------------------------------------------------');

        //--VENDER
    } else if (buy && buy > 1000) {
        console.log('Bom para vender');

        //--AGUARDANDO MERCADO
    } else {
        console.log('Aguardando mercado');
    }

}, process.env.CRAWLER_INTERVAL);