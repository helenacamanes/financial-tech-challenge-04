export interface User {
  id: string;
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  metadata?: {
    creationTime?: string;
  };
}
