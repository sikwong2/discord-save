const ranks: any = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
  'A': 11
};
const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class GameState {
  dealer_hand: string[];
  hand_1: string[];
  hand_2: string[];
  score: number;
  dealer_score: number;

  constructor() {

    this.dealer_hand = [cards[getRandomInt(0, 12)]];
    this.hand_1 = [cards[getRandomInt(0, 12)], cards[getRandomInt(0, 12)]];
    this.hand_2 = [];
    this.score = 0;
    this.dealer_score = 0;
  }

  get_score(hand: string[]) {
    let score = 0;
    hand.forEach(x => {
      score += ranks[x];
    });

    hand.forEach(x => {
      if (score > 21 && x == 'A') {
        score -= 10;
      }
    });

    return score;
  }

  hit() {
    this.hand_1.push(cards[getRandomInt(0, 12)]);

    if (this.used_split) {
      this.hand_2.push(cards[getRandomInt(0, 12)]);
    }
    this.score = this.get_score(this.hand_1);
  }

  stand() {
    let score = this.get_score(this.dealer_hand);

    while (score < 17) {
      this.dealer_hand.push(cards[getRandomInt(0, 12)]);
      score = this.get_score(this.dealer_hand);
    }
    this.dealer_score = score;
  }

}

