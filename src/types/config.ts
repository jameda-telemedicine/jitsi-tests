import { Instance } from './instances';
import { Provider } from './providers';
import { Scenario } from './scenarios';
import { Test, InternalTest } from './tests';

export type ConfigurationFile = {
  providers: Provider[];
  instances: Instance[];
  scenarios: Scenario[];
  tests: Test[];
};

export type Configuration = {
  providers: Provider[];
  tests: InternalTest[];
};
