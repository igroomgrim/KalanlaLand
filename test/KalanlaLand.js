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
	})
})