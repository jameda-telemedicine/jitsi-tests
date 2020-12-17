import type { InternalBrowser, Browser } from './browsers';
import type { InternalInstance } from './instances';
import type { InternalScenario } from './scenarios';

type BaseTest<B, I, S> = {
  name: string;
  instance: I;
  scenario: S;
  browsers: B[];
};

export type Test = BaseTest<Browser, string, string>;

export type InternalTest = BaseTest<InternalBrowser, InternalInstance, InternalScenario> & {
  participants: number
};
