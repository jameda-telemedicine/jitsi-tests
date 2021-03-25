import type { DynamicString } from './strings';

export type InstanceRoom = DynamicString | {
  name: DynamicString;
  randomSuffix?: boolean;
};

export type BaseInstance = {
  name: DynamicString;
  parallel?: boolean;
};

export type BaseJitsiInstance = BaseInstance & {
  type: 'jitsi';
};

export type JitsiInstance = BaseJitsiInstance & {
  url: DynamicString;
  jwt?: DynamicString;
  room: InstanceRoom;
};

export type InternalJitsiInstance = BaseJitsiInstance & {
  url: string;
  jwt: string;
  room: string;
  randomSuffix: boolean;
  suffixed: boolean;
};

export type Instance = JitsiInstance;

export type InternalInstance = InternalJitsiInstance;
