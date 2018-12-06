pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract KalanlaLand is ERC721Token {
  address public gameOwner;

  struct Token {
    string name;
    uint256 price;
  }

  Token[] public tokens;
  mapping (uint256 => bool) public tokensForSell;

  mapping (uint256 => mapping(address => bool)) public borrowRequestCreated;
  mapping (uint256 => address) public tokenBorrower;

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
  function createToken(string _name, address _owner) public onlyGameOwner() returns (uint256) {
    Token memory _token = Token({
      name: _name,
      price: 0
    });

    uint256 tokenID = tokens.push(_token) - 1;
    _mint(_owner, tokenID);

    return tokenID;
  }

  // Buy & Sell
  function offerTokenForSell(uint256 _tokenID, uint256 _price) public {
    require(msg.sender == ownerOf(_tokenID));
    require(_price > 0 ether);

    if (!_isTokenForSell(_tokenID)) {
      tokensForSell[_tokenID] = true;
    }
    
    tokens[_tokenID].price = _price;
  }

  function removeTokenForSell(uint256 _tokenID) public {
    require(msg.sender == ownerOf(_tokenID));

    tokensForSell[_tokenID] = false;
    tokens[_tokenID].price = 0;
  }

  function buyToken(uint256 _tokenID) public payable {
    require(msg.sender != ownerOf(_tokenID));
    require(msg.value >= tokens[_tokenID].price);
    require(!_isContract(msg.sender));
    
    address seller = ownerOf(_tokenID);
    address buyer = msg.sender;
    uint256 tokenPrice = tokens[_tokenID].price;
    uint256 excess = msg.value.sub(tokenPrice);

    // Remove token from sell
    tokensForSell[_tokenID] = false;
    tokens[_tokenID].price = 0;

    // Money move
    seller.transfer(tokenPrice);
    if (excess > 0) {
      buyer.transfer(excess);
    }

    // Token move
    _transferToken(seller, buyer, _tokenID);
  }

  function _transferToken(address _from, address _to, uint256 _tokenID) internal {
    removeTokenFrom(_from, _tokenID);
    addTokenTo(_to, _tokenID);
  }

  function giveTokenTo(address _to, uint256 _tokenID) public {
    if (_isTokenForSell(_tokenID)) {
      removeTokenForSell(_tokenID);
    }

    // Token move
    _transferToken(msg.sender, _to, _tokenID);
  }

  // Borrow & Lend
  function createBorrowRequest(uint256 _tokenID) public {
    require(!_isContract(msg.sender));
    require(!borrowRequestCreated[_tokenID][msg.sender]);

    borrowRequestCreated[_tokenID][msg.sender] = true;
  }

  function cancelBorrowRequest(uint256 _tokenID) public {
    require(!_isContract(msg.sender));
    require(borrowRequestCreated[_tokenID][msg.sender]);
    
    borrowRequestCreated[_tokenID][msg.sender] = false;
  }

  function acceptBorrowRequest(address _borrower, uint256 _tokenID) public {
    require(!_isContract(msg.sender));
    require(msg.sender == ownerOf(_tokenID));
    require(borrowRequestCreated[_tokenID][_borrower]);

    tokenBorrower[_tokenID] = _borrower;
    borrowRequestCreated[_tokenID][_borrower] = false;
  }

  function returnTokenBack(uint256 _tokenID) public {
    require(!_isContract(msg.sender));
    require(tokenBorrower[_tokenID] == msg.sender);

    tokenBorrower[_tokenID] = address(0);
  }

  function takeBackTokenFromBorrower(uint256 _tokenID) public {
    require(!_isContract(msg.sender));
    require(msg.sender == ownerOf(_tokenID));

    tokenBorrower[_tokenID] = address(0);
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
}
