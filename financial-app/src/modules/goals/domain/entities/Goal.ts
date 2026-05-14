export interface Goal {
  id: string;

  title: string;

  current: number;

  target: number;

  icon: string;

  color: string;

  createdAt?: Date;

  updatedAt?: Date;
}
