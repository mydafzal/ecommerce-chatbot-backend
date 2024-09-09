export interface Customer {
  id: number;
  email: string;
  fullName: string;
  billing: any;
  shipping: any;
  isPayingCustomer: boolean;
  avatarUrl: string;
}
