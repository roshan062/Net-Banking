'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Roshan Yadav',
  movements: [200, 450, -400, 3000, -650, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Amit Singh',
  movements: [5000, 3400, -150, -790, -3210, 1400],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Aarav Yadav',
  movements: [200, -200, 340, 50, 4000, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Rahul Prasad',
  movements: [430, 1000, 700, 50, -10],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////


let currentAccount, timer;  //global scope variable

//Checking the credentials, login the user and showing all the details.
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  containerApp.style.opacity = 0;
  labelWelcome.textContent = "Login to get started.";

  calcUserNames(accounts);
  currentAccount = accounts.find(acc => acc.userName === inputLoginUsername.value);

  if (currentAccount) {
    if (currentAccount.pin === Number(inputLoginPin.value)) {
      labelWelcome.textContent = "Welcome back, " + currentAccount.owner.split(' ')[0];
      containerApp.style.opacity = 100;
      updateUI(currentAccount);

      if (timer) {
        clearInterval(timer);
      }

      timer = countDownTimer();
    }
    else
      alert("Wrong PIN !!! ❌");
  }
  else
    alert("Username doesn't exist. 🙅‍♂️");

  //Clearing the login fields
  inputLoginUsername.value = inputLoginPin.value = '';

})



//Providing loan to the user (Max 10% of the the total balance available)
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);
  const availBal = currentAccount.balance;
  if (loanAmount > 0 && loanAmount <= availBal * 0.1) {
    currentAccount.movements.push(loanAmount);
    updateUI(currentAccount);
  }
  else if (loanAmount > currentAccount.balance * 0.1) {
    alert("Maximum 10% of Your balance will be granted as loan. TRY Again.");
  }
  else
    alert("Enter legit or positive number.");

  inputLoanAmount.value = '';  //resetting loan amount entry field

  //resetting the auto logout timer
  clearInterval(timer);

  timer = countDownTimer();
})





// Transfer money event listener
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const creditAccount = accounts.find(acc => acc.userName === inputTransferTo.value);
  const creditAmount = Number(inputTransferAmount.value);
  if (creditAmount > 0 && currentAccount.balance >= creditAmount && creditAccount.owner !== currentAccount.owner) {
    creditAccount.movements.push(creditAmount);
    currentAccount.movements.push(-creditAmount);
    updateUI(currentAccount);
  }
  else {
    alert("Please try with legit entries.");
  }

  inputTransferAmount.value = inputTransferTo.value = ''; // resetting the transfer details fields.

 //resetting the auto logout timer
 clearInterval(timer);
 timer = countDownTimer();
})



//sorting the movements
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;

 //resetting the auto logout timer
 clearInterval(timer);
 timer = countDownTimer();
})





//Deleting the account
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin) {
    const closingAccIndex = accounts.findIndex(acc =>
      acc.userName === currentAccount.userName);
    console.log("closing account index: " + closingAccIndex);

    accounts.splice(closingAccIndex, 1);
    containerApp.style.opacity = 0;   //hiding the UI

    labelWelcome.textContent = "Login to get started.";
  }
  else
    alert("Please enter correct credentials to close the account.")

  inputCloseUsername.value = inputClosePin.value = '';

})



/////////////////////////////////////Functions//////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// Printing transactions of the account holder.
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (move, i) {
    const transactionType = move > 0 ? "deposit" : "withdrawal";
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${transactionType}">${transactionType}</div>
          <div class="movements__value">${move}₹ </div>
          </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}




// Calculating account holder's total balance.
const calcDisplayBalance = function (account) {
  const totalBal = account.movements.reduce(function (acc, move) {
    return acc + move;
  }, 0);
  account.balance = totalBal;
  labelBalance.textContent = ` ${totalBal}₹ `;

  const date = new Date();
  const today = date.getDate();
  const month = date.getMonth() +1;
  const year = date.getFullYear();
  const presentDate = today +"/"+month+"/"+year;
  console.log("today's date: "+ presentDate);

  labelDate.textContent = presentDate;
}




// Calculating and printing the summary.
const calcDisplaySummary = function (acc) {

  const income = acc.movements.filter(move => move > 0).reduce((acc, move) => acc + move);
  labelSumIn.textContent = `${income}₹`;

  const out = acc.movements.filter(move => move < 0).reduce((acc, move) => acc + move);
  labelSumOut.textContent = `${Math.abs(out)}₹`;

  const interest = (((income - out) * acc.interestRate) / 100).toFixed(2);
  labelSumInterest.textContent = interest + "₹";

}





// Computing the initials of the account owner as username
const calcUserNames = function (accHolder) {
  accHolder.forEach(function (accHolder) {

    const userName = (accHolder.owner).toLowerCase().split(" ").map(function (ownerName) {
      return ownerName[0];
    }).join("");
    accHolder.userName = userName;
  })

}

// updating the whole UI
const updateUI = function (currentAccount) {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
}




// Countdown timer function
const countDownTimer = function (time = 300) {
  const timer = setInterval(function () {
    const min = Math.trunc(time / 60);
    const sec = `${time % 60}`.padStart(2, 0);

    labelTimer.textContent = (`${min}:${sec}`);
    time--;
    console.log(min + ":" + sec);
    if (time == 0)
      location.reload();
  }, 1000);

  return timer;
}

