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

		it("should player1 set and remove tokens[0] for sell", async () => {
			await instance.offerTokenForSell(0, 2 * ether, {
				from: player1
			});

			let item0IsForSell = await instance.tokensForSell(0);
			assert.equal(item0IsForSell, true);

			await instance.removeTokenForSell(0, {
				from: player1
			});

			let item0IsNotForSell = await instance.tokensForSell(0);
			assert.equal(item0IsNotForSell, false);
		})
	})

	describe("Transfer/Receive", () => {
		it("should player1 give tokens[0] to player2", async () => {
			await instance.giveTokenTo(player2, 0, {
				from: player1
			});

			let tokenOwner = await instance.ownerOf(0);
			assert.equal(player2, tokenOwner);

			let balanceOfPlayer1 = await instance.balanceOf(player1);
			assert.equal(0, balanceOfPlayer1);

			let balanceOfPlayer2 = await instance.balanceOf(player2);
			assert.equal(1, balanceOfPlayer2);
		})
	})

	describe("Borrow/Lend", () => {
		it("should player1 create request to borrow tokens[0]", async () => {
			await instance.createBorrowRequest(0, {
				from: player1
			});

			let requestCreated = await instance.borrowRequestCreated(0, player1);
			assert.equal(true, requestCreated);
		})

		it("should player1 cancel request to borrow tokens[0]", async () => {
			await instance.cancelBorrowRequest(0, {
				from: player1
			});

			let requestCreated = await instance.borrowRequestCreated(0, player1);
			assert.equal(false, requestCreated);
		})

		it("should player1 create request and player2 accept borrow request", async () => {
			await instance.createBorrowRequest(0, {
				from: player1
			});

			let requestCreated = await instance.borrowRequestCreated(0, player1);
			assert.equal(true, requestCreated);

			await instance.acceptBorrowRequest(player1, 0, {
				from: player2
			});

			let borrower = await instance.tokenBorrower(0);
			assert.equal(player1, borrower);
		})

		it("should player1 return tokens[0] back to player2", async () => {
			await instance.createBorrowRequest(0, {
				from: player1
			});

			let requestCreated = await instance.borrowRequestCreated(0, player1);
			assert.equal(true, requestCreated);

			await instance.acceptBorrowRequest(player1, 0, {
				from: player2
			});

			let borrower = await instance.tokenBorrower(0);
			assert.equal(player1, borrower);

			await instance.returnTokenBack(0, {
				from: player1
			});

			let emptyBorrower = await instance.tokenBorrower(0);
			assert.equal(0, emptyBorrower);
		})

		it("should player2 take tokens[0] back from player1", async () => {
			await instance.createBorrowRequest(0, {
				from: player1
			});

			let requestCreated = await instance.borrowRequestCreated(0, player1);
			assert.equal(true, requestCreated);

			await instance.acceptBorrowRequest(player1, 0, {
				from: player2
			});

			let borrower = await instance.tokenBorrower(0);
			assert.equal(player1, borrower);

			await instance.takeBackTokenFromBorrower(0, {
				from: player2
			});

			let emptyBorrower = await instance.tokenBorrower(0);
			assert.equal(0, emptyBorrower);
		})
	})

})