import { ThenableWebDriver } from 'selenium-webdriver';
import synchro, { BarrierArgs, BarrierPromise } from '../lib/synchro';
import { BrowserTask } from '../types/browsers';
import { InternalInstance } from '../types/instances';

export type TaskParams = Record<string, string | number>;
export type Task = string | { [taskName: string]: TaskParams };
export type TaskObject = {
  name: string;
  params: TaskParams;
};
export type TaskSystem = {
  barrier: (args: BarrierArgs) => BarrierPromise;
  storage: Map<string, string>;
  defaultTimeout: number;
};

export type TaskArgs = {
  name: string;
  params: TaskParams;
  participants: number;
  driver: ThenableWebDriver;
  browser: BrowserTask;
  debug: boolean;
  instance: InternalInstance;
  browserIndex: number;
  taskIndex: number;
  storage: Map<string, string>;
};

export interface TaskInterface {
  args: TaskArgs;
  system: TaskSystem;

  run(params?: TaskParams): Promise<void>;
  getBrowserRole(): string;
  getStringArg(name: string, defaultValue?: string): string;
  getNumericArg(name: string, defaultValue?: number): number;
  getBooleanArg(name: string, defaultValue: boolean): boolean;
}

export type TaskConstructor = new (
  args: TaskArgs,
  system: TaskSystem
) => TaskInterface;

/**
 * Create a task using a constructor `C` and arguments `args`.
 *
 * @param C {TaskConstructor} constructor for the task.
 * @param args {TaskArgs} arguments for the task.
 */
export const createTask = (
  C: TaskConstructor,
  args: TaskArgs,
  system: TaskSystem,
): TaskInterface => new C(args, system);

/**
 * Resolve to a task using the name of the task.
 *
 * @param taskName name of the task to resolve.
 */
export const resolve = async (taskName: string): Promise<TaskConstructor> => {
  const unallowedNames = ['task'];

  if (unallowedNames.includes(taskName)) {
    throw new Error(`Task '${taskName}' is not allowed for use.`);
  }

  if (taskName.endsWith('.test') || taskName.endsWith('.test.ts') || taskName.endsWith('.test.js')) {
    throw new Error(
      `Not allowed to resolve a test file (${taskName}) as a task.`,
    );
  }

  return (await import(`./${taskName}`)).default;
};

/**
 * Resolve and create a task.
 *
 * @param taskObject an object representing the task read from the configuration file.
 * @param args arguments for the task.
 * @param system system utils that the task can use
 */
export const resolveAndCreateTask = async (
  taskObject: TaskObject,
  args: TaskArgs,
  system: TaskSystem,
): Promise<TaskInterface> => {
  const resolvedTask = await resolve(taskObject.name);
  return createTask(resolvedTask, args, system);
};

/**
 * Parse tasks.
 *
 * @param tasks tasks to parse.
 */
export const parseTasks = (tasks: Task[]): TaskObject[] => tasks.map(
  (task: Task): TaskObject => {
    let name: string;
    let params: TaskParams = {};

    if (typeof task === 'string') {
      name = task;
    } else {
      const entries = Object.entries(task);
      if (entries.length < 1) {
        throw new Error('Empty task entry.');
      } else if (entries.length > 1) {
        throw new Error('Bad task entry.');
      }
      const [objectTaskName, objectTaskParams] = entries[0];
      name = objectTaskName;
      params = objectTaskParams;
    }

    return {
      name,
      params,
    };
  },
);

/**
 * Create a new TaskSystem.
 */
export const createTaskSystem = (): TaskSystem => {
  const { barrier } = synchro();
  const storage = new Map<string, string>();

  return {
    barrier,
    storage,
    defaultTimeout: 30_000,
  };
};
