var KalanlaLand = artifacts.require("./KalanlaLand.sol");

contract('KalanlaLand', async (accounts) => {
	let instance;
	let gameOwner;
	let player1;
	let player2;
	let ether = Math.pow(10, 18);

	before('setup contract for each test', async function () {
        instance = await KalanlaLand.deployed();
        gameOwner = accounts[0];
        player1 = accounts[1];
        player2 = accounts[2];
    })

	describe("Initial contract", () => {
	    it("should accounts[0] is gameOwner", async () => {
	     	let _gameOwner = await instance.gameOwner();
	     	assert.equal(_gameOwner, gameOwner);
		})

		it("should gameOwner create token to the land", async () => {
			await instance.createToken("TOKEN_0", gameOwner, {
				from: gameOwner
			});

			let tokenOwner = await instance.ownerOf(0);
			assert.equal(gameOwner, tokenOwner);

			let totalSupply = await instance.totalSupply.call();
			assert.equal(1, totalSupply);

			let item0 = await instance.tokens(0);
			assert.equal("TOKEN_0", item0[0]);
			assert.equal(0, item0[1]);

			let balance = await instance.balanceOf(gameOwner);
			assert.equal(1, balance);
		})
	})

	describe("Buy/Sell", () => {
		it("should gameOwner set tokens[0] for sell", async () => {
			await instance.offerTokenForSell(0, 1 * ether, {
				from: gameOwner
			});

			let item0IsForSell = await instance.tokensForSell(0);
			assert.equal(item0IsForSell, true);

			let item0 = await instance.tokens(0);
			assert.equal(1 * ether, item0[1]);
		})

		it("should player1 buy tokens[0] from the market(gameOwner)", async () => {
			await instance.buyToken(0, {
				from: player1,
				value: 1.1 * ether
			});

			let tokenOwner = await instance.ownerOf(0);
			assert.equal(player1, tokenOwner);

			let balanceOfGameOwner = await instance.balanceOf(gameOwner);
			assert.equal(0, balanceOfGameOwner);

			let balanceOfPlayer1 = await instance.balanceOf(player1);
			assert.equal(1, balanceOfPlayer1);
		})
	})
})