const playBtn = document.querySelector(".play-btn");
const board = document.querySelector(".board");

const spanWallet = document.querySelector(".money");

class Game {
  constructor(money) {
    this.bidInput = document.querySelector(".bid");
    this.spanWallet = document.querySelector(".money");
    this.bidPlus = document.querySelector(".plus");
    this.bidMinus = document.querySelector(".minus");
    this.tier = document.querySelector(".difficulty-panel");

    this.bet = 0;
    this.playing = false;
    this.floor = 0;
    this.gamesNum = 0;

    this.newGame = new Result();
    this.stats = new Statistics(this.floor);
    this.wallet = new Wallet(money);

    playBtn.addEventListener("click", () =>
      this.playGame(settings.difficulty, this.bet)
    );

    this.bidInput.addEventListener("input", () => settings.updateBet("input"));

    this.bidPlus.addEventListener("click", () => settings.updateBet("+"));

    this.bidMinus.addEventListener("click", () => settings.updateBet("-"));

    this.tier.addEventListener("click", e => {
      if (this.playing) return;

      settings.difficulty = e.target.getAttribute("data-diff");
      [...this.tier.children].forEach(diff => {
        diff.classList.remove("active");
      });
      e.target.classList.add("active");

      settings.updateDiff();
    });
  }

  playGame(difficulty, bet) {
    if (this.bet > this.wallet.money && !this.playing) {
      return alert("Not enough funds!");
    }
    if (difficulty && bet != 0) {
      this.floor = 0;

      this.drawGame();
      this.newGame = new Result(true, this.bet);
    } else {
      if (difficulty) {
        return alert("You cant bet for less than 0.01$!");
      } else {
        return alert("Difficulty not set!");
      }
    }
  }

  drawGame() {
    playBtn.classList.toggle("active");
    board.classList.toggle("active");
    if (playBtn.classList.contains("active")) {
      settings.updateDiff();
      this.playing = true;
      this.bidInput.disabled = true;

      this.wallet.updateWallet(this.bet);

      updateGame();

      playBtn.textContent = "WITHDRAW";
    } else {
      this.playing = false;
      this.bidInput.disabled = false;
      this.gamesNum++;

      this.stats.updateStats(this.bet);
      this.stats.steps = 0;

      resetGame();

      this.wallet.updateWallet(this.newGame.checkResult());

      playBtn.textContent = "START";
    }
  }
}

const steps = e => {
  game.stats.steps++;

  if (settings.difficulty === "easy") {
    game.newGame.wonMoney *= 1.455;
  } else if (settings.difficulty === "medium") {
    game.newGame.wonMoney *= 1.94;
  } else if (settings.difficulty === "hard") {
    game.newGame.wonMoney *= 2.91;
  }
  playBtn.textContent = `Take ${game.newGame.wonMoney.toFixed(2)}$`;

  checkCell(e);

  game.floor++;
  updateGame();

  if (game.floor === settings.floorsNum) {
    alert(`Congratulation! You've won ${game.newGame.wonMoney.toFixed(2)}$`);
    game.drawGame();
  }
};

let arr = [undefined, undefined];
const checkCell = e => {
  const row = [...document.querySelectorAll(".row")];
  let bombsArray = [];

  if (game.floor < row.length) {
    do {
      for (let i = 0; i < settings.bombsNum; i++) {
        bombsArray[i] = Math.round(
          Math.random() * (row[game.floor].children.length - 1)
        );
      }
    } while (bombsArray[0] === bombsArray[1]);

    if (settings.bombsNum === 2) {
      if (
        e.target === row[game.floor].children[bombsArray[0]] ||
        e.target === row[game.floor].children[bombsArray[1]]
      ) {
        e.target.style.borderColor = "red";
        row[game.floor].children[bombsArray[0]].innerHTML =
          '<i class="fas fa-bomb"></i>';
        row[game.floor].children[bombsArray[1]].innerHTML =
          '<i class="fas fa-bomb"></i>';
        game.newGame.doWin = false;
        game.drawGame();
      } else {
        e.target.style.borderColor = "lime";
        e.target.innerHTML = '<i class="fas fa-dollar-sign"></i>';
      }
    } else {
      if (e.target === row[game.floor].children[bombsArray[0]]) {
        e.target.style.borderColor = "red";
        row[game.floor].children[bombsArray[0]].innerHTML =
          '<i class="fas fa-bomb"></i>';
        game.newGame.doWin = false;
        game.drawGame();
      } else {
        e.target.style.borderColor = "lime";
        e.target.innerHTML = '<i class="fas fa-dollar-sign"></i>';
      }
    }

    bombsArray = [];
  }
};

const resetGame = () => {
  game.floor = 10;
  updateGame();
};

const updateGame = () => {
  const row = [...document.querySelectorAll(".row")];

  row.forEach((element, rowIndex) => {
    [...row[rowIndex].children].forEach((cell, cellIndex) => {
      if (rowIndex === game.floor) {
        cell.addEventListener("click", steps);
        cell.classList.add("active");
        if (game.floor === settings.floorsNum) {
          cell.removeEventListener("click", steps);
          cell.classList.remove("active");
        }
      } else {
        cell.removeEventListener("click", steps);
        cell.classList.remove("active");
      }
    });
  });
};

class GameSettings {
  constructor(floorsNum, difficulty) {
    this.floorsNum = floorsNum;
    this.difficulty = difficulty;
    this.bombsNum = 1;
  }

  updateBet(symbol) {
    if (game.playing) return;

    if (symbol === "+") {
      game.bet += 5;
    } else if (symbol === "-") {
      game.bet -= 5;
    } else if (symbol === "input") {
      game.bet = parseInt(game.bidInput.value);
    }

    if (game.bet > 1250000) {
      game.bet = 1250000;
    } else if (!game.bet || game.bet < 0) {
      game.bet = 0;
    }

    game.bidInput.value = parseInt(game.bet);

    if (this.difficulty) {
      this.updateDiff();
    }
  }

  updateDiff() {
    if (game.playing) return;

    this.updateFloors();

    let _easyBet = game.bet * 1.455;
    let _mediumBet = game.bet * 1.94;
    let _hardBet = game.bet * 2.91;

    document.querySelector(".floors").innerHTML = "";

    if (this.difficulty === "easy") {
      this.bombsNum = 1;
      for (let i = 0; i < this.floorsNum; i++) {
        document.querySelector(".floors").innerHTML += `
        <div class="row">
          <div class="cell">${_easyBet.toFixed(2)} $</div>
          <div class="cell">${_easyBet.toFixed(2)} $</div>
          <div class="cell">${_easyBet.toFixed(2)} $</div>
        </div>`;
        _easyBet = _easyBet * 1.455;
      }
    }

    if (this.difficulty === "medium") {
      this.bombsNum = 1;
      for (let i = 0; i < this.floorsNum; i++) {
        document.querySelector(".floors").innerHTML += `
      <div class="row">
      <div class="cell">${_mediumBet.toFixed(2)} $</div>
      <div class="cell">${_mediumBet.toFixed(2)} $</div>
      </div>`;
        _mediumBet = _mediumBet * 1.94;
      }
      document.querySelectorAll(".row").forEach(row => {
        row.style.gridTemplateColumns = "1fr 1fr";
      });
    }

    if (this.difficulty === "hard") {
      this.bombsNum = 2;
      for (let i = 0; i < this.floorsNum; i++) {
        document.querySelector(".floors").innerHTML += `
        <div class="row">
          <div class="cell">${_hardBet.toFixed(2)} $</div>
          <div class="cell">${_hardBet.toFixed(2)} $</div>
          <div class="cell">${_hardBet.toFixed(2)} $</div>
        </div>`;
        _hardBet = _hardBet * 2.91;
      }
    }
  }

  updateFloors() {
    if (game.bet <= 15) {
      this.floorsNum = 10;
    } else if (game.bet > 15 && game.bet <= 23) {
      this.floorsNum = 8;
    } else if (game.bet > 23 && game.bet <= 30) {
      this.floorsNum = 7;
    } else if (game.bet > 30 && game.bet <= 38) {
      this.floorsNum = 6;
    } else if (game.bet > 38 && game.bet <= 77) {
      this.floorsNum = 5;
    } else if (game.bet > 77 && game.bet <= 84) {
      this.floorsNum = 4;
    } else if (game.bet > 84) {
      this.floorsNum = 3;
    }
  }
}

class Wallet {
  constructor(money) {
    this.money = money;
  }

  updateWallet(value) {
    if (game.playing) {
      this.money -= value;
    } else {
      this.money += value;
    }
    game.spanWallet.textContent = this.money.toFixed(2);
  }
}

class Result {
  constructor(doWin, wonMoney) {
    this.doWin = doWin;
    this.wonMoney = wonMoney;
  }

  checkResult() {
    if (this.doWin) {
      return this.wonMoney;
    } else {
      return 0;
    }
  }
}

class Statistics {
  constructor() {
    this.profit = 0;
    this.steps = 0;
  }

  updateStats(bet) {
    const betDiv = document.createElement("div");
    const profitDiv = document.createElement("div");
    const stepsDiv = document.createElement("div");

    if (game.newGame.doWin) {
      profitDiv.style.color = "lime";
      this.profit = game.newGame.wonMoney - game.bet;
    } else {
      profitDiv.style.color = "red";
      this.profit = game.bet;
    }

    if (document.querySelector(".bet-elements").children.length > 25) {
      document.querySelector(".bet-elements").innerHTML = "";
      document.querySelector(".profit-elements").innerHTML = "";
      document.querySelector(".wager-elements").innerHTML = "";
    }

    document
      .querySelector(".bet-elements")
      .appendChild(betDiv).textContent = `${bet}$`;
    document
      .querySelector(".profit-elements")
      .appendChild(profitDiv).textContent = `${
      game.newGame.doWin ? "+" : "-"
    } ${this.profit.toFixed(2)}$`;
    document
      .querySelector(".wager-elements")
      .appendChild(stepsDiv).textContent = `${this.steps}`;

    document.querySelector(".games").textContent = game.gamesNum;
  }
}

const game = new Game(spanWallet.textContent);
const settings = new GameSettings(undefined, undefined);
