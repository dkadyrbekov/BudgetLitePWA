export type BudgetCategory = {
  id: string;
  name: string;
  icon: string;
  position: number;
};

export type BudgetExpense = {
  id: string;
  amount: number;
  comment: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  date: string;
  time: string;
  createdAt: string;
};
