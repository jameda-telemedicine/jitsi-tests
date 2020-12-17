import type { Task, TaskObject } from '../tasks/task';

export type BaseScenario = {
  name: string;
};

export type Scenario = BaseScenario & {
  tasks: Task[];
};

export type InternalScenario = BaseScenario & {
  tasks: TaskObject[];
};
