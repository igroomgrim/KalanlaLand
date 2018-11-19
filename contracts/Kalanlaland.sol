pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract KalanlaLand is ERC721Token {
  address public gameOwner;

  struct Token {
    string name;
    uint256 price;
  }

  Token[] tokens;
  mapping (uint256 => bool) public tokensForSell;

  constructor() ERC721Token("KalanlaLand", "KLT") public {
    gameOwner = msg.sender;
  }

  function () public payable {
    revert("Do not waste your money here!");
  }

  // Modifier
  modifier onlyGameOwner() {
    require(msg.sender == gameOwner);
    _;
  }

  // Create Token
  function createToken(string _name, uint _price, address _owner) public onlyGameOwner() returns (uint256) {
    require(_price > 0 ether);

    Token memory _token = Token({
      name: _name,
      price: _price
    });

    uint256 tokenID = tokens.push(_token) - 1;
    _mint(_owner, tokenID);

    return tokenID;
  }

  // Buy & Sell
  function offerTokenForSell(uint256 _tokenID, uint256 _price) public {
    require(msg.sender == ownerOf(_tokenID));
    require(_price > 0 ether);

    tokensForSell[_tokenID] = true;
    tokens[_tokenID].price = _price;
  }

  function removeTokenForSell(uint256 _tokenID) public {
    require(msg.sender == ownerOf(_tokenID));

    tokensForSell[_tokenID] = false;
    tokens[_tokenID].price = 0;
  }

  function buyItem(uint256 _tokenID) public payable {
    require(msg.sender != ownerOf(_tokenID));
    require(msg.value >= tokens[_tokenID].price);
    require(!_isContract(msg.sender));
    
    address seller = ownerOf(_tokenID);
    address buyer = msg.sender;
    uint256 tokenPrice = tokens[_tokenID].price;
    uint256 excess = msg.value.sub(tokenPrice);

    // Remvoe token from sell
    tokensForSell[_tokenID] = false;

    // Money move
    seller.transfer(tokenPrice);
    if (excess > 0) {
      buyer.transfer(excess);
    }

    // Token move
    _transferToken(seller, buyer, _tokenID);
  }

  function _transferToken(address _from, address _to, uint256 _tokenID) internal {
    transferFrom(_from, _to, _tokenID);
  }

  // Utils
  function _isContract(address _addr) internal view returns (bool) {
      uint256 size;
      assembly { size := extcodesize(_addr) }
      return size > 0;
  }

  function _isTokenForSell(uint256 _tokenID) internal view returns (bool) {
    return tokensForSell[_tokenID];
  }

  /*
  function requestItemForLoan(uint256 _tokenID) public payable {

  }

  function removeLoanRequest(uint256 _tokenID) public {

  }

  function acceptLoanRequest(uint256 _tokenID, address _borrower) public {

  }

  function returnTokenFromLoan(uint256 _tokenID) public {

  }

  function takeBackTokenFromLoan(uint256 _tokenID) public {

  }
  */
}
