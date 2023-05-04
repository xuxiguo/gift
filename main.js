const form = document.getElementById('redeem-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const redeemCode = document.getElementById('redeem-code').value;
    const address = document.getElementById('eth-address').value;

    if (!ethers.utils.isAddress(address)) {
        alert('Invalid Ethereum address');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/redeem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ redeemCode, address })
        });

        const data = await response.json();
        if (data.success) {
            alert('Gift redeemed successfully! Transaction hash: ' + data.txHash);
        } else {
            alert('Failed to redeem gift: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to redeem gift');
    }
});
