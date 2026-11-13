export interface RandomSource {
  next(): number;
}

export class MathRandomSource implements RandomSource {
  next(): number {
    return Math.random();
  }
}

export class SequenceRandomSource implements RandomSource {
  private index = 0;

  constructor(private readonly values: readonly number[]) {
    if (values.length === 0) throw new Error("SequenceRandomSourceには1個以上の値が必要です。");
  }

  next(): number {
    const value = this.values[Math.min(this.index, this.values.length - 1)];
    this.index += 1;
    return Math.max(0, Math.min(0.999999999, value));
  }
}
